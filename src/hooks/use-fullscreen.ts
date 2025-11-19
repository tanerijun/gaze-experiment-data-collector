import { useCallback } from "react"

export type FullscreenElement = Document & {
	webkitFullscreenElement?: HTMLElement | null
	mozFullScreenElement?: HTMLElement | null
	msFullscreenElement?: HTMLElement | null
}

type FullscreenRequestElement = HTMLElement & {
	webkitRequestFullscreen?: () => Promise<void>
	mozRequestFullScreen?: () => Promise<void>
	msRequestFullscreen?: () => Promise<void>
}

type FullscreenDocument = Document & {
	webkitFullscreenEnabled?: boolean
	mozFullScreenEnabled?: boolean
	msFullscreenEnabled?: boolean
	webkitExitFullscreen?: () => Promise<void>
	mozCancelFullScreen?: () => Promise<void>
	msExitFullscreen?: () => Promise<void>
}

export const useFullscreen = () => {
	const enterFullscreen = useCallback(async (element: HTMLElement = document.documentElement) => {
		try {
			const requestElement = element as FullscreenRequestElement
			if (element.requestFullscreen) {
				await element.requestFullscreen()
			} else if (requestElement.webkitRequestFullscreen) {
				// Safari
				await requestElement.webkitRequestFullscreen()
			} else if (requestElement.mozRequestFullScreen) {
				// Firefox
				await requestElement.mozRequestFullScreen()
			} else if (requestElement.msRequestFullscreen) {
				// IE 11
				await requestElement.msRequestFullscreen()
			}
		} catch (err) {
			console.error("Error attempting to enable fullscreen:", err)
		}
	}, [])

	const exitFullscreen = useCallback(async () => {
		try {
			const fullscreenDoc = document as unknown as FullscreenElement
			if (document.fullscreenElement) {
				await document.exitFullscreen()
			} else if (fullscreenDoc.webkitFullscreenElement) {
				await (fullscreenDoc as FullscreenDocument).webkitExitFullscreen?.()
			} else if (fullscreenDoc.mozFullScreenElement) {
				await (fullscreenDoc as FullscreenDocument).mozCancelFullScreen?.()
			} else if (fullscreenDoc.msFullscreenElement) {
				await (fullscreenDoc as FullscreenDocument).msExitFullscreen?.()
			}
		} catch (err) {
			console.error("Error attempting to exit fullscreen:", err)
		}
	}, [])

	const toggleFullscreen = useCallback(
		async (element: HTMLElement = document.documentElement) => {
			const fullscreenDoc = document as unknown as FullscreenElement
			const isFullscreen =
				document.fullscreenElement ||
				fullscreenDoc.webkitFullscreenElement ||
				fullscreenDoc.mozFullScreenElement ||
				fullscreenDoc.msFullscreenElement

			if (isFullscreen) {
				await exitFullscreen()
			} else {
				await enterFullscreen(element)
			}
		},
		[enterFullscreen, exitFullscreen],
	)

	const isFullscreenAvailable = useCallback(() => {
		const fullscreenDoc = document as unknown as FullscreenDocument
		return !!(
			document.fullscreenEnabled ||
			fullscreenDoc.webkitFullscreenEnabled ||
			fullscreenDoc.mozFullScreenEnabled ||
			fullscreenDoc.msFullscreenEnabled
		)
	}, [])

	return {
		enterFullscreen,
		exitFullscreen,
		toggleFullscreen,
		isFullscreenAvailable,
	}
}
