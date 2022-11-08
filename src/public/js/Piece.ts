import { Board } from "./Board";
import { TColors, TMove, TType, types } from "./types";

// isForThreat as in king threat detection

// export class Piece {
// 	// extends Board
// 	// /**
// 	//  *
// 	//  * @param {Number} y
// 	//  * @param {Number} x
// 	//  * @param {string} type
// 	//  * @param {string} color
// 	//  * @param {[string]} classes
// 	//  * @param {Board} parent
// 	//  * @param {Number} index
// 	//  */

// 	class: string[];
// 	deleted = false;
// 	memory: { x: number; y: number }[] = [];
// 	icon: HTMLElement | null = null;
// 	possibleMoves: TMove[] = [];

// 	constructor(
// 		public y: number,
// 		public x: number,
// 		public type: TType,
// 		public color: TColors,
// 		classes: string[],
// 		public parent: Board,
// 		public index: number
// 	) {
// 		// super(null);
// 		// this.y = y;
// 		// this.x = x;
// 		this.type = type;
// 		this.color = color;
// 		this.class = classes;
// 		// this.deleted = false;
// 		// this.memory = [];
// 		this.createPieceElement();
// 		this.appendPiece();
// 		this.parent = parent;
// 		this.index = index;
// 	}

// 	createPieceElement() {
// 		const icon = document.createElement("i");
// 		icon.setAttribute("data-x", this.x + "");
// 		icon.setAttribute("data-y", this.y + "");
// 		icon.classList.add(...this.class);
// 		icon.setAttribute("tabindex", "0");
// 		this.icon = icon;
// 	}

// 	render() {
// 		this.icon?.remove();
// 		this.createPieceElement();
// 		this.appendPiece();
// 	}

// 	appendPiece() {
// 		this.memory.push({
// 			y: this.y,
// 			x: this.x,
// 		});
// 		document.getElementById(`${this.y}-${this.x}`)?.appendChild(this.icon!);
// 	}

// 	deletePiece() {
// 		this.icon?.remove();
// 		this.deleted = true;
// 		this.MoveLocations(-1, -1);
// 	}

// 	MoveLocations(y: number, x: number) {
// 		this.x = x;
// 		this.y = y;
// 	}

// 	possibleMoveLocations(isForT = false, initial = true) {
// 		// middle function to get possible move locations
// 		let result = this[types[this.type]](isForT, initial);
// 		return result;
// 	}

// 	//<----
// 	//calculate possible moves for each piece type
// 	pawnMove(isForT = false) {
// 		let y = this.y;
// 		let x = this.x;

// 		this.possibleMoves = [];

// 		const isNext1Occupied = this.parent.getPiece(
// 			y + (this.isBlack(1) as number),
// 			x
// 		);
// 		const isNext2Occupied = this.parent.getPiece(
// 			y + (this.isBlack(2) as number),
// 			x
// 		);
// 		// is one step allowed
// 		if (!isForT && (this.isBlack() ? y < 7 : y > 0) && !isNext1Occupied)
// 			this.possibleMoves.push({
// 				y: y + (this.isBlack(1) as number),
// 				x: x,
// 			});
// 		// are two steps allowed
// 		if (
// 			!isForT &&
// 			(this.isBlack() ? y === 1 : y === 6) &&
// 			!isNext2Occupied &&
// 			!isNext1Occupied
// 		) {
// 			this.possibleMoves.push({
// 				y: y + (this.isBlack(2) as number),
// 				x: x,
// 			});
// 		}

// 		// can i eat front right
// 		if (
// 			(this.isBlack() ? y < 7 : y > 0) &&
// 			x < 7 &&
// 			(isForT ||
// 				this.parent.getPiece(
// 					y + (this.isBlack(1) as number),
// 					x + 1,
// 					this.getOpponentColor()
// 				))
// 		) {
// 			this.possibleMoves.push({
// 				y: y + (this.isBlack(1) as number),
// 				x: x + 1,
// 				kill: true,
// 			});
// 		}

// 		// can i eat front left
// 		if (
// 			(this.isBlack() ? y < 7 : y > 0) &&
// 			x > 0 &&
// 			(isForT ||
// 				this.parent.getPiece(
// 					y + (this.isBlack(1) as number),
// 					x - 1,
// 					this.getOpponentColor()
// 				))
// 		) {
// 			this.possibleMoves.push({
// 				y: y + (this.isBlack(1) as number),
// 				x: x - 1,
// 				kill: true,
// 			});
// 		}
// 		return this.possibleMoves;
// 	}

// 	kingMove(isForT = false, initial = true) {
// 		let x = this.x;
// 		let y = this.y;
// 		let checkArr: {
// 			x: number;
// 			y: number;
// 			threat?: boolean;
// 			kill?: boolean;
// 		}[] = [
// 			{
// 				y: y - 1,
// 				x: x,
// 			},
// 			{
// 				y: y - 1,
// 				x: x + 1,
// 			},
// 			{
// 				y: y - 1,
// 				x: x - 1,
// 			},
// 			{
// 				y: y + 1,
// 				x: x,
// 			},
// 			{
// 				y: y + 1,
// 				x: x + 1,
// 			},
// 			{
// 				y: y + 1,
// 				x: x - 1,
// 			},
// 			{
// 				y: y,
// 				x: x + 1,
// 			},
// 			{
// 				y: y,
// 				x: x - 1,
// 			},
// 		];

// 		checkArr = checkArr.filter(
// 			(check) =>
// 				this.parent.isLocationExists(check.y, check.x) &&
// 				(isForT || !this.parent.getPiece(check.y, check.x, this.color))
// 		);

// 		let opponetsMove = !initial
// 			? []
// 			: this.parent.getAllOppMove(this.color, true, false);

// 		!isForT &&
// 			checkArr.map((check) => {
// 				let threat = isForT
// 					? false
// 					: opponetsMove.filter(
// 							(move) => move.x === check.x && move.y === check.y
// 					  );
// 				// console.log(threat);
// 				check.threat = threat ? threat.length > 0 : false;
// 				check.kill = this.parent.getPiece(
// 					check.y,
// 					check.x,
// 					this.getOpponentColor()
// 				)
// 					? true
// 					: false;
// 				return check;
// 			});
// 		this.possibleMoves = checkArr;
// 		return this.possibleMoves;
// 	}

// 	queenMove(isForT = false) {
// 		const rook = this.rookMove(isForT);
// 		const bishop = this.bishopMove(isForT);
// 		this.possibleMoves = [...rook, ...bishop];
// 		return this.possibleMoves;
// 	}

// 	rookMove(isForT = false) {
// 		this.possibleMoves = [];
// 		let x = this.x;
// 		let y = this.y;

// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, 0, isForT));
// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, 0, isForT));
// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, 0, 1, isForT));
// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, 0, -1, isForT));

// 		return this.possibleMoves;
// 	}

// 	bishopMove(isForT = false) {
// 		// bishop movement
// 		let x = this.x;
// 		let y = this.y;
// 		this.possibleMoves = [];

// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, 1, isForT));
// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, -1, isForT));
// 		this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, 1, isForT));
// 		this.possibleMoves.push(
// 			...this.getMovesInDirection(y, x, -1, -1, isForT)
// 		);

// 		return this.possibleMoves;
// 	}

// 	knightMove(isForT = false) {
// 		let x = this.x;
// 		let y = this.y;
// 		this.possibleMoves = [];

// 		let checkArr = [
// 			{
// 				y: y + 2,
// 				x: x + 1,
// 			},
// 			{
// 				y: y + 2,
// 				x: x - 1,
// 			},
// 			{
// 				y: y - 2,
// 				x: x + 1,
// 			},
// 			{
// 				y: y - 2,
// 				x: x - 1,
// 			},
// 			{
// 				y: y + 1,
// 				x: x + 2,
// 			},
// 			{
// 				y: y + 1,
// 				x: x - 2,
// 			},
// 			{
// 				y: y - 1,
// 				x: x + 2,
// 			},
// 			{
// 				y: y - 1,
// 				x: x - 2,
// 			},
// 		];

// 		checkArr.forEach((check) => {
// 			let oPiece = this.parent.getPiece(check.y, check.x, this.color);
// 			if (
// 				(this.parent.isLocationExists(check.y, check.x) && isForT) ||
// 				!oPiece
// 			) {
// 				this.possibleMoves.push({
// 					y: check.y,
// 					x: check.x,
// 					kill: this.parent.getPiece(check.y, check.x) ? true : false,
// 				});
// 			}
// 		});
// 		return this.possibleMoves;
// 	}

// 	getMovesInDirection(
// 		y: number,
// 		x: number,
// 		dY: number,
// 		dX: number,
// 		isForT: boolean
// 	) {
// 		let moves = [];
// 		for (let i = 1; i < 8; i++) {
// 			let row = y + dY * i;
// 			let col = x + dX * i;
// 			if (this.parent.isLocationExists(row, col)) {
// 				// if (true)
// 				let LocOccupied = this.parent.getPiece(row, col);
// 				if (
// 					!(LocOccupied && LocOccupied.piece.color == this.color) ||
// 					isForT
// 				) {
// 					moves.push({
// 						y: row,
// 						x: col,
// 						kill: LocOccupied ? true : false,
// 					});
// 					if (
// 						LocOccupied &&
// 						(LocOccupied.piece.color !== this.color ||
// 							(LocOccupied.piece.color == this.color && isForT))
// 					)
// 						if (
// 							!(
// 								LocOccupied.piece.color !== this.color &&
// 								LocOccupied.piece.type == "king" &&
// 								isForT
// 							)
// 						)
// 							// check if king then keep going
// 							break;
// 				} else break;
// 			} else break;
// 		}
// 		return moves;
// 	}
// 	// --->

// 	isBlack(val: number | null = null) {
// 		if (val) return this.color == "black" ? val : -val;
// 		return this.color == "black";
// 	}

// 	getOpponentColor() {
// 		return this.color == "black" ? "white" : "black";
// 	}
// }

export class Piece {
	component!: HTMLElement;
	deleted: boolean = false;
	memory: { x: number; y: number }[] = [];
	possibleMoves: TMove[] = [];

	constructor(
		public y: number,
		public x: number,
		public type: TType,
		public color: TColors,
		public classes: string[],
		public parent: Board,
		public index: number
	) {
		this.type = type;
		this.color = color;
		this.parent = parent;
		this.index = index;
		this.render();
	}

	render() {
		this.component?.remove();
		const component = document.createElement("i");
		component.setAttribute("data-x", this.x + "");
		component.setAttribute("data-y", this.y + "");
		component.classList.add(...this.classes);
		component.setAttribute("tabindex", "0");
		this.component = component;

		document
			.getElementById(`${this.y}-${this.x}`)
			?.appendChild(this.component);
	}

	deletePiece() {
		this.component?.remove();
		this.deleted = true;
		this.SetLocation(-1, -1);
	}

	SetLocation(y: number, x: number) {
		this.memory.push({
			y: this.y,
			x: this.x,
		});
		this.x = x;
		this.y = y;
		this.render();
	}

	possibleMovement(isForT = false, initial = true) {
		// middle function to get possible move locations
		let result = this[types[this.type]](isForT, initial);
		return result;
	}

	isBlack(num: number | null = null) {
		if (this.color == "black") {
			return num || 1;
		} else return -(num || 0);
	}

	getMovesInDirection(
		y: number,
		x: number,
		dY: number,
		dX: number,
		isForThreat: boolean
	) {
		let moves = [];
		for (let i = 1; i < 8; i++) {
			let row = y + dY * i;
			let col = x + dX * i;

			if (this.parent.isLocationExists(row, col)) {
				let LocPiece = this.parent.getPiece(row, col);
				if (
					!(LocPiece && LocPiece.piece.color == this.color) ||
					isForThreat
				) {
					moves.push({
						y: row,
						x: col,
						kill: LocPiece ? true : false,
					});
					if (
						LocPiece &&
						(LocPiece.piece.color !== this.color ||
							(LocPiece.piece.color == this.color && isForThreat))
					)
						if (
							!(
								LocPiece.piece.color !== this.color &&
								LocPiece.piece.type == "king" &&
								isForThreat
							)
						)
							// check if king then keep going
							break;
				} else break;
			} else break;
		}
		return moves;
	}

	pawnMove(isForT = false) {
		let y = this.y;
		let x = this.x;

		this.possibleMoves = [];

		const isNext1Occupied = this.parent.getPiece(
			y + (this.isBlack(1) as number),
			x
		);
		const isNext2Occupied = this.parent.getPiece(
			y + (this.isBlack(2) as number),
			x
		);

		// is one step allowed
		if (!isForT && (this.isBlack() ? y < 7 : y > 0) && !isNext1Occupied)
			this.possibleMoves.push({
				y: y + (this.isBlack(1) as number),
				x: x,
			});

		// are two steps allowed
		if (
			!isForT &&
			(this.isBlack() ? y === 1 : y === 6) &&
			!isNext2Occupied &&
			!isNext1Occupied
		) {
			this.possibleMoves.push({
				y: y + (this.isBlack(2) as number),
				x: x,
			});
		}

		// can i eat front right
		if (
			(this.isBlack() ? y < 7 : y > 0) &&
			x < 7 &&
			(isForT ||
				this.parent.getPiece(
					y + (this.isBlack(1) as number),
					x + 1,
					this.getOpponentColor()
				))
		) {
			this.possibleMoves.push({
				y: y + (this.isBlack(1) as number),
				x: x + 1,
				kill: true,
			});
		}

		// can i eat front left
		if (
			(this.isBlack() ? y < 7 : y > 0) &&
			x > 0 &&
			(isForT ||
				this.parent.getPiece(
					y + (this.isBlack(1) as number),
					x - 1,
					this.getOpponentColor()
				))
		) {
			this.possibleMoves.push({
				y: y + (this.isBlack(1) as number),
				x: x - 1,
				kill: true,
			});
		}
		return this.possibleMoves;
	}

	kingMove(isForT = false, initial = true) {
		let { x, y } = this;

		let checkArr: TMove[] = [
			{
				y: y - 1,
				x: x,
			},
			{
				y: y - 1,
				x: x + 1,
			},
			{
				y: y - 1,
				x: x - 1,
			},
			{
				y: y + 1,
				x: x,
			},
			{
				y: y + 1,
				x: x + 1,
			},
			{
				y: y + 1,
				x: x - 1,
			},
			{
				y: y,
				x: x + 1,
			},
			{
				y: y,
				x: x - 1,
			},
		];

		checkArr = checkArr.filter(
			(check) =>
				this.parent.isLocationExists(check.y, check.x) &&
				(isForT || !this.parent.getPiece(check.y, check.x, this.color))
		);

		let opponentsMove = !initial
			? []
			: this.parent.getAllOppMove(this.color, true, false);

		!isForT &&
			checkArr.map((location) => {
				let threat = isForT
					? false
					: opponentsMove.filter(
							(move) => move.x === location.x && move.y === location.y
					  );

				location.threat = threat ? threat.length > 0 : false;

				location.kill = this.parent.getPiece(
					location.y,
					location.x,
					this.getOpponentColor()
				)
					? true
					: false;
				return location;
			});
		this.possibleMoves = checkArr;
		return this.possibleMoves;
	}

	queenMove(isForT = false) {
		const rook = this.rookMove(isForT);
		const bishop = this.bishopMove(isForT);
		this.possibleMoves = [...rook, ...bishop];
		return this.possibleMoves;
	}

	rookMove(isForT = false) {
		this.possibleMoves = [];
		let x = this.x;
		let y = this.y;

		this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, 0, isForT));
		this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, 0, isForT));
		this.possibleMoves.push(...this.getMovesInDirection(y, x, 0, 1, isForT));
		this.possibleMoves.push(...this.getMovesInDirection(y, x, 0, -1, isForT));

		return this.possibleMoves;
	}

	bishopMove(isForT = false) {
		// bishop movement
		let x = this.x;
		let y = this.y;
		this.possibleMoves = [];

		this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, 1, isForT));
		this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, -1, isForT));
		this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, 1, isForT));
		this.possibleMoves.push(
			...this.getMovesInDirection(y, x, -1, -1, isForT)
		);

		return this.possibleMoves;
	}

	knightMove(isForT = false) {
		let x = this.x;
		let y = this.y;
		this.possibleMoves = [];

		let checkArr = [
			{
				y: y + 2,
				x: x + 1,
			},
			{
				y: y + 2,
				x: x - 1,
			},
			{
				y: y - 2,
				x: x + 1,
			},
			{
				y: y - 2,
				x: x - 1,
			},
			{
				y: y + 1,
				x: x + 2,
			},
			{
				y: y + 1,
				x: x - 2,
			},
			{
				y: y - 1,
				x: x + 2,
			},
			{
				y: y - 1,
				x: x - 2,
			},
		];

		checkArr.forEach((check) => {
			let oPiece = this.parent.getPiece(check.y, check.x, this.color);
			if (
				(this.parent.isLocationExists(check.y, check.x) && isForT) ||
				!oPiece
			) {
				this.possibleMoves.push({
					y: check.y,
					x: check.x,
					kill: this.parent.getPiece(check.y, check.x) ? true : false,
				});
			}
		});
		return this.possibleMoves;
	}

	getOpponentColor() {
		return this.color == "black" ? "white" : "black";
	}
}
