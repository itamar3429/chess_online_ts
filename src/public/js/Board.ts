import { Piece } from "./Piece";
import {
	TColors,
	TData,
	TKinkAttacked,
	TMove,
	TPossibleMove,
	TType,
} from "./types";

export class Board {
	turn: TColors = "white";
	pieces: Piece[] = [];
	index = -1;
	kingAttacked: TKinkAttacked = {
		threat: false,
		threats: null,
		king: null,
	};

	winnerDiv: HTMLDivElement | null = null;

	turnDiv: HTMLDivElement | null = null;
	constructor(
		Arr: TData | null,
		public myColor: "white" | "black",
		public sendMovement: (y: number, x: number, index: number) => any
	) {
		if (Arr) {
			this.initializeTurnDiv();
			this.initializePieces(Arr);
		}
	}

	render() {
		this.pieces.forEach((piece) => {
			if (!piece.deleted) piece?.render();
		});
	}

	initializeTurnDiv() {
		let divTurn = document.createElement("div");
		divTurn.classList.add("div-turn");
		divTurn.style.color = "white";
		divTurn.style.bottom =
			// document.querySelector('.board-reverse') ? '100%' :
			"-10%";
		divTurn.innerHTML = `<h2>white's turn</h2>`;
		document.body.querySelector(".chess-inner")?.appendChild(divTurn);
		this.turnDiv = divTurn;
	}

	initializePieces(Arr: TData) {
		this.pieces = [];
		Arr.forEach((obj) => {
			const keys = Object.keys(obj) as (keyof typeof obj)[];
			keys.forEach((key) => {
				obj[key].forEach((piece: any, i: number) => {
					const newPiece = new Piece(
						piece.y,
						piece.x,
						piece.type,
						piece.color,
						piece.class,
						this,
						i
					);
					this.pieces.push(newPiece);
				});
			});
		});
	}

	getPiece(
		y: number,
		x: number,
		color: "white" | "black" | null = null
	): { piece: Piece; index: number } | null {
		let index: number | null = null;
		let piece = this.pieces.filter((piece, i) => {
			if (
				piece.x === x &&
				piece.y === y &&
				(color ? piece.color == color : true)
			) {
				index = i;
				return true;
			}
			return false;
		});
		if (piece.length)
			return {
				piece: piece[0],
				index: index!,
			};
		return null;
	}

	getPieceByName(type: TType, color: TColors) {
		let pieces = this.pieces.filter(
			(piece) => piece.type === type && piece.color === color
		);
		return pieces;
	}

	resetBoard(Arr: TData) {
		// clearListeners();
		this.turnDiv?.remove();
		this.pieces.forEach((piece) => {
			piece.component.remove();
		});

		this.initializePieces(Arr);
		this.turn = "white";
		this.index = -1;
		this.kingAttacked = {
			threat: false,
			threats: null,
			king: null,
		};
		if (this.winnerDiv) {
			this.winnerDiv.remove();
			this.winnerDiv = null;
		}
	}

	isKingAttacked() {
		const moves = this.getAllOppMove(this.turn, false);
		const king = this.getPieceByName("king", this.turn)[0];
		const x = king.x;
		const y = king.y;
		const threats = moves.filter((piece) => piece.x === x && piece.y === y);
		let threat = threats ? threats : [];
		this.kingAttacked = {
			threat: threats.length > 0 || threat.length > 0,
			threats: threat,
			king,
		};
		return {
			threat: threats.length > 0 || threat.length > 0,
			threats: threat,
			king: {
				y,
				x,
			},
		};
	}

	kingAttackedManager(y: number, x: number, kingA: TKinkAttacked) {
		// let kingA = this.isKingAttacked()
		if (!kingA.threat) return true;

		let kingThreats = kingA.threats;
		let l = kingThreats.length;
		if (l == 0) return true;
		let isKnight = kingThreats.filter((t: any) => t.type == "knight");
		if (isKnight.length == 1)
			return isKnight[0].threats.x == x && isKnight[0].threats.y == y;
		else {
			if (l > 1) return false;

			let kingLoc = {
				y: kingA.king?.y || 0,
				x: kingA.king?.x || 0,
			};
			let attackerLoc = kingThreats[0].loc;
			kingThreats = kingThreats[0];

			let result =
				(kingThreats.loc.x == x && kingThreats.loc.y == y) ||
				this.isBetween(
					kingLoc,
					{
						y,
						x,
					},
					attackerLoc
				);

			return result;
		}
	}

	kingAttackAfterMove(piece: Piece, moves: TMove[]) {
		// let myColor = this.turn;
		moves = moves.filter((move) => {
			let res = false;
			let x = piece.x;
			let y = piece.y;
			piece.SetLocation(move.y, move.x);
			let kingThreat = this.isKingAttacked();
			piece.SetLocation(y, x);
			res =
				!kingThreat.threat ||
				this.kingAttackedManager(move.y, move.x, kingThreat);
			return res;
		});
		return moves;
	}

	isMiddle(x1: number, x2: number, x3: number) {
		return (x1 >= x2 && x2 >= x3) || (x1 <= x2 && x2 <= x3);
	}

	isBetween(loc1: TMove, loc2: TMove, loc3: TMove) {
		// Checks if the location is between two other locations
		let y1 = loc1.y;
		let y2 = loc2.y;
		let x1 = loc1.x;
		let x2 = loc2.x;
		let y3 = loc3.y;
		let x3 = loc3.x;

		if (x1 == x3) {
			return x2 == x1 && this.isMiddle(y1, y2, y3);
		}

		if (y1 == y3) {
			return y2 == y1 && this.isMiddle(x1, x2, x3);
		}

		let m = (y1 - y3) / (x1 - x3);
		let b = y1 - m * x1;
		return (
			y2 == m * x2 + b &&
			this.isMiddle(x1, x2, x3) &&
			this.isMiddle(y1, y2, y3)
		);
	}

	isLocationExists(y: number, x: number) {
		return x > -1 && x < 8 && y > -1 && y < 8;
	}

	setLocation(y: number, x: number) {
		let index = this.index;
		if (
			this.pieces.length > index &&
			index > -1 &&
			!this.pieces[index].deleted &&
			this.isLocationExists(y, x)
		) {
			if (this.pieces[index].color == this.turn) {
				const isOccupied = this.getPiece(y, x);
				if (isOccupied) {
					isOccupied.piece.deletePiece();
				}
				this.pieces[index].SetLocation(y, x);
				this.pieces[index].render();

				if (this.myColor == this.turn) {
					// if im the client managing this color then send the movement to the server
					this.sendMovement(y, x, index);
				}
				if (
					this.pieces[index].type === "pawn" &&
					((this.turn == "white" && y == 0) ||
						(this.turn == "black" && y == 7))
				)
					setTimeout(() => this.makePawnQueen(index), 300);
				this.nexTurn();
			}
		}
	}

	makePawnQueen(index: number) {
		let piece = this.pieces[index];
		if (piece.type == "pawn") {
			piece.type = "queen";
			piece.classes = piece.classes.filter((x) => !x.includes("pawn"));
			piece.classes.push("fa-chess-queen", "queen");
			piece.render();
		}

		// this.nexTurn();
	}

	getAllOppMove(colorSelf: TColors, forT = true, initial = false) {
		let possibleMovements: TPossibleMove[] = [];

		let filtered = this.pieces.filter(
			(x) => x.color != colorSelf && !x.deleted
		);
		filtered.forEach((cell) => {
			let pos: Partial<TPossibleMove>[] = cell.possibleMovement(
				forT,
				initial
			);
			pos.map((p) => {
				p.type = cell.type;
				p.color = cell.color;
				p.loc = {
					y: cell.y,
					x: cell.x,
				};
			});
			possibleMovements.push(...(pos as TPossibleMove[]));
		});
		return possibleMovements;
	}

	nexTurn() {
		this.turn = this.turn === "black" ? "white" : "black";
		const isWinner = this.canKillKing();

		if (!this.hasMoves()) {
			this.winner(this.turn === "black" ? "white" : "black");
		}
		if (isWinner) {
			this.winner(this.turn);
		}
		this.whoseTurn();
	}

	whoseTurn() {
		if (this.turnDiv) this.turnDiv.style.opacity = "0";
		setTimeout(() => {
			if (this.turnDiv) {
				this.turnDiv.style.opacity = "1";
				// this.turnDiv.style.bottom = this.turnDiv.style.bottom.includes('100') ? '-10%' : '100%'
				this.turnDiv.style.color = this.turn;
				if (this.turnDiv.firstElementChild)
					this.turnDiv.firstElementChild.innerHTML = `${this.turn}'s turn`;
			}
		}, 500);
	}

	isMyTurn(index: number) {
		return this.turn === this.pieces[index].color;
	}

	hasMoves() {
		let kingThreat = this.isKingAttacked();
		// if (kingThreat.threat == false)
		//     return true
		let moves = this.getAllOppMove(
			this.turn == "black" ? "white" : "black",
			false,
			true
		);

		// let kingThreat = this.isKingAttacked()
		moves = moves.filter(
			(move) =>
				(move.type !== "king" &&
					this.kingAttackedManager(move.y, move.x, kingThreat)) ||
				(move.type == "king" && !move.threat)
		);
		return moves.length > 0;
	}

	canKillKing() {
		let positions = this.getAllOppMove(
			this.turn == "black" ? "white" : "black",
			false
		);

		let color: TColors = this.turn == "black" ? "white" : "black";
		// if opponent came to kill king and can approach him its checkmate
		const oppKing = this.getPieceByName("king", color)[0];

		let filtered = positions.filter(
			(pos) => pos.x == oppKing.x && pos.y == oppKing.y
		);
		if (filtered.length > 0) {
			// if (!false) {
			// this.winner(this.turn)
			return true;
			// }
		}
		return false;
	}

	winner(color: TColors) {
		const winDiv = document.createElement("div");
		winDiv.classList.add("winner-div");
		winDiv.innerHTML = `<h3>Checkmate</h3><h1>${color} won !!</h1>
		 <p>hope you had fun playing</p>`;
		winDiv.style.backgroundColor = color;
		winDiv.style.color = color == "black" ? "white" : "black";
		winDiv.style.outline = "15px solid green";
		document.body.appendChild(winDiv);
		this.winnerDiv = winDiv;
	}
}
