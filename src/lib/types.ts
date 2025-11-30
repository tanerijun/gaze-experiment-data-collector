export interface GridConfig {
	pairs: number
}

export interface CalculatedLayout {
	rows: number
	cols: number
	cardSize: number
	gap: number
}

export interface Card {
	id: string // unique identifier for this card instance
	imageId: string // identifier for matching (same imageId = pair)
	imagePath: string // path to the image file
	isFlipped: boolean // whether card is currently flipped
	isMatched: boolean // whether card has been matched
}

export type GameState = "initial" | "playing" | "won"

export interface GameStats {
	moves: number
	matches: number
	timeElapsed: number // in seconds
}

// Image metadata
export interface ImageItem {
	category: string
	id: number
	path: string
}
