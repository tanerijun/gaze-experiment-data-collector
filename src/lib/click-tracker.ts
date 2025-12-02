/**
 * Click tracker for recording all clicks during gameplay
 */

import type { Card, ClickData } from "./types"

export interface ClickTrackerOptions {
	sessionId: string
	recordingStartTime: number
	onClickCapture?: (click: ClickData) => void
}

export class ClickTracker {
	private recordingStartTime: number
	private onClickCapture?: (click: ClickData) => void
	private isTracking = false
	private clickHandler: ((event: MouseEvent) => void) | null = null

	constructor(options: ClickTrackerOptions) {
		this.recordingStartTime = options.recordingStartTime
		this.onClickCapture = options.onClickCapture
	}

	/**
	 * Start tracking clicks
	 */
	start(): void {
		if (this.isTracking) return

		this.clickHandler = (event: MouseEvent) => {
			this.handleClick(event)
		}

		// Listen to all clicks on the document
		// 'true' (Capture Phase) to catch events before they are stopped by other handlers
		document.addEventListener("click", this.clickHandler, true)
		this.isTracking = true
	}

	/**
	 * Stop tracking clicks
	 */
	stop(): void {
		if (!this.isTracking || !this.clickHandler) return
		document.removeEventListener("click", this.clickHandler, true)
		this.clickHandler = null
		this.isTracking = false
	}

	/**
	 * Handle click event
	 */
	private handleClick(event: MouseEvent): void {
		const timestamp = Date.now()
		const videoTimestamp = timestamp - this.recordingStartTime

		const target = event.target as HTMLElement
		const cardElement = target.closest("[data-card-id], .memory-card, .card") as HTMLElement | null
		const spiritElement = target.closest(
			"[data-spirit], .dungeon-spirit, #dungeon-spirit",
		) as HTMLElement | null

		let cardId: string | null = null
		let targetX: number | null = null
		let targetY: number | null = null

		if (cardElement) {
			cardId = cardElement.getAttribute("data-card-id")
			const rect = cardElement.getBoundingClientRect()
			targetX = rect.left + rect.width / 2
			targetY = rect.top + rect.height / 2
		}

		const type: "explicit" | "implicit" = spiritElement ? "explicit" : "implicit"

		const click: ClickData = {
			id: this.generateClickId(),
			timestamp,
			videoTimestamp,
			type,
			screenX: event.clientX,
			screenY: event.clientY,
			targetX,
			targetY,
			cardId,
		}

		this.onClickCapture?.(click)
	}

	/**
	 * Generate unique click ID
	 */
	private generateClickId(): string {
		const timestamp = Date.now()
		const random = Math.random().toString(36).substring(2, 9)
		return `click-${timestamp}-${random}`
	}

	/**
	 * Get tracking state
	 */
	isActive(): boolean {
		return this.isTracking
	}
}

/**
 * Helper to extract card positions from the game board
 */
export function extractCardPositions(cards: Card[]): Array<{
	cardId: string
	x: number
	y: number
	width: number
	height: number
	centerX: number
	centerY: number
}> {
	const positions: Array<{
		cardId: string
		x: number
		y: number
		width: number
		height: number
		centerX: number
		centerY: number
	}> = []

	for (const card of cards) {
		const element = document.querySelector(`[data-card-id="${card.id}"]`)
		if (element) {
			const rect = element.getBoundingClientRect()
			positions.push({
				cardId: card.id,
				x: rect.left,
				y: rect.top,
				width: rect.width,
				height: rect.height,
				centerX: rect.left + rect.width / 2,
				centerY: rect.top + rect.height / 2,
			})
		}
	}

	return positions
}
