import { Board } from "./Board";
import { BoardComponent } from "./BoardComponent";

const classes = {
	selected: ["focused-piece"],
	highlight: ["move-option"],
	warning: ["move-option", "move-option-threat"],
	kill: ["move-option-kill"],
	opponent: ["focused-piece-other"],
};

type TTableCell = {
	action: "selected" | "highlight" | "warning" | "kill" | "none" | "opponent";
};

export class Events {
	tableArr: TTableCell[][] = [];
	selected: { x: number; y: number } | null = null;

	constructor(
		public board: Board,
		public functions: BoardComponent,
		public myColor: "white" | "black"
	) {
		this.initArr();
		this.addListeners();
	}

	initArr() {
		for (let y = 0; y < 8; y++) {
			this.tableArr.push([]);
			for (let x = 0; x < 8; x++) {
				this.tableArr[y][x] = { action: "none" };
			}
		}
	}

	addListeners() {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				const el = document.getElementById(`${i}-${j}`);
				el?.addEventListener("click", (e) => {
					this.onClick(i, j, e);
				});
			}
		}
	}

	onClick(y: number, x: number, _e: MouseEvent) {
		if (this.myColor == this.board.turn)
			switch (this.tableArr[y][x].action) {
				case "selected":
					break;
				case "opponent":
					break;
				case "warning":
					break;
				case "kill":
				case "highlight":
					this.movePiece(y, x);
					break;
				case "none":
					if (this.board.getPiece(y, x)) this.selectPiece(y, x);
					else {
						this.reset();
					}
					break;
			}
		else {
			this.reset();
			this.tableArr[y][x].action = "opponent";
		}
		this.render();
	}

	render() {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				const el = document.getElementById(`${y}-${x}`);
				this.removeAllClasses(el!);
				if (this.tableArr[y][x].action == "selected") {
					el?.classList.add(...classes.selected);
				}

				if (this.tableArr[y][x].action == "highlight") {
					el?.classList.add(...classes.highlight);
				}
				if (this.tableArr[y][x].action == "opponent") {
					el?.classList.add(...classes.opponent);
				}

				if (this.tableArr[y][x].action == "warning") {
					el?.classList.add(...classes.warning);
				}

				if (this.tableArr[y][x].action == "kill") {
					el?.classList.add(...classes.kill);
				}
				if (this.tableArr[y][x].action == "none") {
					// this.tableArr[y][x].selected = true;
					console.log(this.tableArr);
				}
			}
		}
	}

	reset() {
		this.selected = null;
		this.tableArr.forEach((row) =>
			row.forEach((cell) => (cell.action = "none"))
		);
		// this.functions.renderTable();
		// this.addListeners();
		this.board.render();
	}

	removeAllClasses(el: HTMLElement) {
		const allClasses = Object.values(classes).flat(10);
		el?.classList.remove(...allClasses);
	}

	selectPiece(y: number, x: number) {
		this.reset();
		this.tableArr[y][x].action = "selected";
		this.selected = { y, x };

		let currentPiece = this.board.getPiece(y, x)!;
		this.board.index = currentPiece.index;
		if (this.board.isMyTurn(currentPiece.index)) {
			let positions = currentPiece.piece.possibleMovement();
			let kingThreats = this.board.isKingAttacked();
			let isKing =
				positions.length > 0 &&
				(positions[0].threat == false || positions[0].threat == true);

			// let isKingHasThreat =
			// 	positions.length > 0 &&
			// 	(positions[0].threat || positions[0].threat == false
			// 		? positions.filter((x) => x.threat == true).length > 0
			// 		: false);

			positions = positions.filter((pos) => {
				// filter moves to make sure a player deals with a king threat and not keeps going undealt with
				if (
					!isKing &&
					this.board.kingAttackedManager(pos.y, pos.x, kingThreats)
				) {
					return true;
				}
				if (isKing) {
					return true;
				}
				return false;
			});
			if (!isKing)
				positions = this.board.kingAttackAfterMove(
					currentPiece.piece,
					positions
				); // filter possible moves to adjust moves relative to king threat (player cannot intend to kill a king)
			positions.forEach((pos) => {
				if (!pos.threat) {
					// if its a king and the move doesn't threat the king

					this.tableArr[pos.y][pos.x].action = "highlight";
					if (pos.kill) this.tableArr[pos.y][pos.x].action = "kill";
				} else {
					this.tableArr[pos.y][pos.x].action = "warning";
				}
			});
		} else {
			// if not his turn
			this.tableArr[y][x].action = "opponent";
		}
	}

	movePiece(y: number, x: number) {
		this.board.setLocation(y, x);
		this.reset();
	}
}
