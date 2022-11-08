import { chessPiecesB, chessPiecesW } from "./chess-conf";

export const types = {
	pawn: "pawnMove",
	king: "kingMove",
	queen: "queenMove",
	rook: "rookMove",
	bishop: "bishopMove",
	knight: "knightMove",
} as const;

export type TType = keyof typeof types;

export type TMove = {
	kill?: boolean;
	x: number;
	y: number;
	threat?: boolean;
};

export type TColors = "white" | "black";

export type TKinkAttacked = {
	threat: boolean;
	threats: any;
	king: { x: number; y: number } | null;
};

export type TPossibleMove = TMove & {
	type: TType;
	color: TColors;
	loc: {
		x: number;
		y: number;
	};
	threat?: boolean;
};

export type TData = [typeof chessPiecesB, typeof chessPiecesW];
