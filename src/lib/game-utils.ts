import type { CalculatedLayout, Card, GridConfig, ImageItem } from "./types"

// Available categories
const CATEGORIES = ["currencies", "fruits", "herbs", "meats", "plants", "undeads", "vegetables"]
const ITEMS_PER_CATEGORY = 48

// Grid configuration for the game
export const GRID_CONFIG: GridConfig = { pairs: 2 }

/**
 * Find all valid grid layouts for a given number of cards
 */
function findValidLayouts(totalCards: number): Array<{ rows: number; cols: number }> {
	const layouts: Array<{ rows: number; cols: number }> = []

	for (let cols = 1; cols <= totalCards; cols++) {
		if (totalCards % cols === 0) {
			const rows = totalCards / cols
			layouts.push({ rows, cols })
		}
	}

	return layouts
}

/**
 * Calculate the optimal grid layout based on screen dimensions and pair count
 * Prioritizes landscape layouts when screen is landscape, maximizes screen coverage
 */
export function calculateOptimalLayout(
	pairs: number,
	viewportWidth: number,
	viewportHeight: number,
): CalculatedLayout {
	const totalCards = pairs * 2
	const validLayouts = findValidLayouts(totalCards)

	// Account for padding and borders - adjust for mobile
	const isMobile = viewportWidth < 768
	const horizontalPadding = isMobile ? 16 : 24 // Minimal horizontal padding
	const verticalPadding = isMobile ? 16 : 24 // Minimal vertical padding
	const calculatedGap = isMobile ? 8 : 12 // Smaller gap on mobile

	// Buttons are fixed position and don't take flow space
	// Only reserve a tiny bit of edge space to avoid visual overlap
	const edgeClearance = 0 // No clearance needed - buttons are transparent enough

	const availableWidth = Math.max(viewportWidth - horizontalPadding, 300) // Minimum 300px width
	const availableHeight = Math.max(viewportHeight - verticalPadding - edgeClearance, 200) // Use nearly full height

	const isLandscape = viewportWidth > viewportHeight

	// For very small pair counts, prefer more spread out layouts to maximize coverage
	const isSmallGame = pairs <= 6

	let bestLayout = validLayouts[0]
	let bestCardSize = 80
	let bestScore = -Infinity
	let hasValidLayout = false

	const layoutScores: {
		rows: number
		cols: number
		cardSize: number
		totalWidth: number
		totalHeight: number
		coverageArea: number
		aspectRatioScore: number
		cardSizeBonus: number
		score: number
	}[] = []

	for (const layout of validLayouts) {
		const { rows, cols } = layout

		// Calculate card size that would fit in this layout
		const cardWidthByWidth = (availableWidth - calculatedGap * (cols - 1)) / cols
		const cardHeightByHeight = (availableHeight - calculatedGap * (rows - 1)) / rows

		// Cards are square, so use the smaller dimension
		const cardSize = Math.min(cardWidthByWidth, cardHeightByHeight)

		// Dynamic size constraints based on viewport
		const minCardSize = isMobile ? 25 : 35 // Smaller minimum on mobile
		// Very high max card size for gaze tracking experiments - maximize screen coverage
		const maxCardSize = isMobile ? 120 : 500 // Allow very large cards on desktop

		// Skip if cards would be too small or too large
		if (cardSize < minCardSize || cardSize > maxCardSize) continue

		hasValidLayout = true

		// Calculate total coverage area
		const totalWidth = cols * cardSize + calculatedGap * (cols - 1)
		const totalHeight = rows * cardSize + calculatedGap * (rows - 1)
		const coverageArea = totalWidth * totalHeight

		// Calculate aspect ratio score
		const layoutAspectRatio = cols / rows
		const screenAspectRatio = viewportWidth / viewportHeight

		// Prefer layouts that match screen orientation
		let aspectRatioScore = 1 - Math.abs(layoutAspectRatio - screenAspectRatio) / screenAspectRatio

		// Strong boost for landscape layouts when in landscape mode (favor wide layouts)
		if (isLandscape && cols > rows) {
			aspectRatioScore *= 3.0
			// Extra boost for very wide layouts (e.g., 8x2 over 4x4)
			if (layoutAspectRatio >= 2) {
				aspectRatioScore *= 1.5
			}
			// For small games, even stronger preference for wide layouts to maximize coverage
			if (isSmallGame && layoutAspectRatio >= 3) {
				aspectRatioScore *= 2.0
			}
		}

		// Strong boost for portrait layouts when in portrait mode (favor tall layouts)
		if (!isLandscape && rows > cols) {
			aspectRatioScore *= 3.0
			// Extra boost for very tall layouts
			if (1 / layoutAspectRatio >= 2) {
				aspectRatioScore *= 1.5
			}
			// For small games, even stronger preference for tall layouts to maximize coverage
			if (isSmallGame && 1 / layoutAspectRatio >= 3) {
				aspectRatioScore *= 2.0
			}
		}

		// Penalize extreme aspect ratios (too thin or too wide)
		const extremeRatioPenalty = Math.max(layoutAspectRatio, 1 / layoutAspectRatio) > 6 ? 0.5 : 1.0

		// Strongly prefer larger cards to maximize screen usage
		const cardSizeBonus = cardSize * 10

		// Combined score: coverage area is primary, card size and aspect ratio are important factors
		const score = coverageArea * 1000 + aspectRatioScore * 800 * extremeRatioPenalty + cardSizeBonus

		layoutScores.push({
			rows,
			cols,
			cardSize: Math.floor(cardSize),
			totalWidth,
			totalHeight,
			coverageArea,
			aspectRatioScore,
			cardSizeBonus,
			score,
		})

		if (score > bestScore) {
			bestScore = score
			bestLayout = layout
			bestCardSize = cardSize
		}
	}

	// Fallback: if no valid layout found, force fit with smallest acceptable cards
	if (!hasValidLayout) {
		// Try to find the most square-ish layout and scale down cards to fit
		const squareRoot = Math.sqrt(totalCards)
		const cols = Math.ceil(squareRoot)
		const rows = Math.ceil(totalCards / cols)

		const cardWidthByWidth = (availableWidth - calculatedGap * (cols - 1)) / cols
		const cardHeightByHeight = (availableHeight - calculatedGap * (rows - 1)) / rows
		const forcedCardSize = Math.max(25, Math.floor(Math.min(cardWidthByWidth, cardHeightByHeight)))

		return {
			rows,
			cols,
			cardSize: forcedCardSize,
			gap: calculatedGap,
		}
	}

	return {
		rows: bestLayout.rows,
		cols: bestLayout.cols,
		cardSize: Math.floor(bestCardSize),
		gap: calculatedGap,
	}
}

/**
 * Build a complete list of all available images across all categories
 */
export function getAllImages(): ImageItem[] {
	const images: ImageItem[] = []

	CATEGORIES.forEach((category) => {
		for (let i = 1; i <= ITEMS_PER_CATEGORY; i++) {
			images.push({
				category,
				id: i,
				path: `/imgs/${category}/${i}.png`,
			})
		}
	})

	return images
}

/**
 * Select random images from the pool
 */
export function selectRandomImages(count: number): ImageItem[] {
	const allImages = getAllImages()
	const shuffled = shuffleArray([...allImages])
	return shuffled.slice(0, count)
}

/**
 * Create pairs of cards from selected images
 */
export function createCardPairs(images: ImageItem[]): Card[] {
	const cards: Card[] = []

	images.forEach((image) => {
		// Create two cards for each image (a pair)
		const imageId = `${image.category}-${image.id}`

		cards.push({
			id: `${imageId}-1`,
			imageId,
			imagePath: image.path,
			isFlipped: false,
			isMatched: false,
		})

		cards.push({
			id: `${imageId}-2`,
			imageId,
			imagePath: image.path,
			isFlipped: false,
			isMatched: false,
		})
	})

	return cards
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array]

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}

	return shuffled
}

/**
 * Initialize a new game with shuffled cards
 */
export function initializeGame(): Card[] {
	const selectedImages = selectRandomImages(GRID_CONFIG.pairs)
	const cardPairs = createCardPairs(selectedImages)
	return shuffleArray(cardPairs)
}

/**
 * Check if two cards match
 */
export function checkMatch(card1: Card, card2: Card): boolean {
	return card1.imageId === card2.imageId
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
