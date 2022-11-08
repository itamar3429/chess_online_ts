import { Board } from "./Board";
import { chessPiecesB, chessPiecesW } from "./chess-conf";
import { Events as ClickEvents } from "./Events";
import { boardComponent } from "./BoardComponent";

export class Game {
	GameDiv = document.getElementById("start-game");
	createBtn = document.getElementById("new-game");
	gameIDInput = document.getElementById("game-id") as HTMLInputElement;
	joinBtn = document.getElementById("join-game");
	randomBtn = document.getElementById("join-random");
	loadingDiv = document.getElementById("loader-container");
	copyLbl = document.getElementById("copy-lbl");
	copyIcon = document.getElementById("copyBtn");
	clientID!: string;
	gameID!: string;
	myColor!: "white" | "black";
	ws!: WebSocket;

	board!: Board;
	constructor() {
		console.log("game start");
	}

	start() {
		this.initListeners();
		this.connect();
		this.addWSListener();
	}

	startGame() {
		boardComponent.render();

		//initializes the BoardPieces class and adds pieces to board
		this.board = new Board(
			[chessPiecesB, chessPiecesW],
			this.myColor,
			this.sendMovement.bind(this)
		);

		new ClickEvents(this.board, boardComponent, this.myColor);
	}

	connect() {
		const HOST = location.origin.replace(/^http/, "ws");

		const ws = new WebSocket(HOST);
		this.ws = ws;
	}

	initListeners() {
		// create game click
		this.createBtn?.addEventListener("click", (_e) => {
			const payLoad = {
				method: "create",
				clientID: this.clientID,
			};

			this.ws.send(JSON.stringify(payLoad));
		});

		// join game with id
		this.joinBtn!.addEventListener("click", (_e) => {
			const payLoad = {
				method: "join",
				gameID: this.gameIDInput!.value,
				clientID: this.clientID,
			};

			this.ws.send(JSON.stringify(payLoad));
		});

		// join random game

		console.log(this.randomBtn);

		this.randomBtn!.addEventListener("click", (_e) => {
			const payLoad = {
				method: "random",
				clientID: this.clientID,
			};
			this.loadingDiv!.style.display = "flex";

			this.ws.send(JSON.stringify(payLoad));

			this.GameDiv!.style.display = "none";
			this.loadingDiv!.style.display = "flex";
		});

		// join random game
		this.copyIcon!.addEventListener("click", async (_e) => {
			this.gameIDInput?.focus();
			(this.gameIDInput as HTMLInputElement)?.select();
			const isCopied = await new Promise((res, _rej) => {
				res(document.execCommand("copy"));
			});
			if (isCopied) {
				this.copyLbl!.style.visibility = "visible";
				this.copyLbl!.style.opacity = "1";
				setTimeout(() => {
					// copyLbl.style.visibility = 'hidden'
					this.copyLbl!.style.opacity = "0";
					setTimeout(() => {
						this.copyLbl!.style.visibility = "hidden";
						// copyLbl.style.opacity = '0'
					}, 1000);
				}, 1000);
			}
		});
	}

	addWSListener() {
		this.ws.onmessage = (message) => {
			const response = JSON.parse(message.data);

			if (response.method === "connect") {
				// if (getCookie('clientID')) {
				//     clientID = getCookie('clientID')
				// } else {
				this.clientID = response.clientID;
				// setCookie('clientID', clientID, 2)
				// }
				// console.log(this.clientID);
			}

			if (response.method === "create") {
				console.log("gameId: ", response.game.id);
				this.gameIDInput.value = response.game.id;
			}

			if (response.method === "join") {
				if (!response.success) {
					console.log("failed to join");

					//tell the client he couldnt join
					// GameDiv.style.display = ''
				}
				if (response.success) {
					this.GameDiv!.style.display = "none";
					this.loadingDiv!.style.display = "flex";
					this.gameID = response.game.id;
					this.myColor = response.game.clients.filter(
						(client: any) => client.clientID == this.clientID
					)[0].color;
				}
			}

			if (response.method === "start") {
				this.loadingDiv!.style.display = "none";
				this.startGame();
				// this.create_table();
				// pieceClass = new BoardPieces([chessPiecesB, chessPiecesW]);
				// addListeners();
			}

			if (response.method == "random") {
				this.gameID = response.gameID;
				const payLoad = {
					method: "join",
					gameID: this.gameID,
					clientID: this.clientID,
				};
				this.ws.send(JSON.stringify(payLoad));
			}

			if (response.method === "set") {
				let index = response.index;
				let location = response.location;
				this.board.index = index;
				this.board.setLocation(location.y, location.x);
			}
		};
	}

	sendMovement(y: number, x: number, index: number) {
		let payLoad = {
			method: "set",
			location: {
				y,
				x,
			},
			index,
			clientID: this.clientID,
			gameID: this.gameID,
		};

		this.ws.send(JSON.stringify(payLoad));

		//   }
	}
}
