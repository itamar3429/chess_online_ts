import { board } from "./Game";
import { chessPiecesB, chessPiecesW } from "./chess-conf";

const chessInner = document.createElement("div");
let table = document.createElement("table");
// let selectedPieceIndex = 0;
export class BoardComponent {
	constructor() {}
	render() {
		this.createBoard();
		this.renderTable();
	}

	createBoard() {
		//create div containers
		const divC = document.createElement("div");
		divC.classList.add("chess-container");

		chessInner.classList.add("chess-inner");

		divC.appendChild(chessInner);

		// add the div to body
		document.body.appendChild(divC);

		// table borders
		const navR = document.createElement("div");
		navR.classList.add("chess-nav", "right-nav");
		const navL = document.createElement("div");
		navL.classList.add("chess-nav", "left-nav");
		const navT = document.createElement("div");
		navT.classList.add("chess-nav", "top-nav");
		const navB = document.createElement("div");
		navB.classList.add("chess-nav", "bottom-nav");

		const rotateIcon = document.createElement("i");
		rotateIcon.classList.add("fa-solid", "fa-rotate");
		// resetIcon.classList.add('fa-solid', 'fa-arrow-rotate-left')
		rotateIcon.id = "rotate-board";
		rotateIcon.setAttribute("title", "rotate the board 180 degrees");

		const resetIcon = document.createElement("i");
		resetIcon.classList.add("fa-solid", "fa-arrow-rotate-left");
		resetIcon.id = "reset-board";
		resetIcon.setAttribute("title", "reset the board and start again");

		createNumbers(true, navL);
		createNumbers(false, navT);

		chessInner.appendChild(navR);
		chessInner.appendChild(navL);
		chessInner.appendChild(navT);
		chessInner.appendChild(navB);
		chessInner.appendChild(rotateIcon);
		chessInner.appendChild(resetIcon);

		// this.renderTable();

		rotateIcon.addEventListener("click", (_e) => {
			table.classList.toggle("board-reverse");
			Array.from(table.rows).forEach((el) =>
				el.classList.toggle("board-reverse")
			);
			if (board.turnDiv) board.turnDiv.style.opacity = "0";
			setTimeout(() => {
				if (board.turnDiv) board.turnDiv.style.opacity = "1";
				// pieceClass.turnDiv.style.bottom = pieceClass.turnDiv.style.bottom.includes('100') ? '-10%' : '100%'
			}, 600);
		});

		resetIcon.addEventListener("click", (_e) => {
			board.resetBoard([chessPiecesB, chessPiecesW]);
		});
	}

	renderTable = () => {
		// create the table and add to div
		table.remove();
		table = document.createElement("table");
		chessInner.appendChild(table);

		// create rows and cells
		let i = 0;
		while (i < 8) {
			let row = table.insertRow(i);
			let j = 0;
			while (j < 8) {
				let cell = row.insertCell(j);
				cell.id = `${i}-${j}`;

				j++;
			}
			i++;
		}
	};
}

export const boardComponent = new BoardComponent();

function createNumbers(isNumbers: boolean, parent: HTMLElement) {
	for (let i = 0; i < 8; i++) {
		const div = document.createElement("div");
		div.classList.add(isNumbers ? "vertical-numbers" : "horizontal-numbers");
		div.innerText =
			(isNumbers ? i + 1 : String.fromCharCode(i + 1 + 64)) + "";
		parent.appendChild(div);
	}
}
