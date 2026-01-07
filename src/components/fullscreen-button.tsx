import { useLocation } from "@tanstack/react-router"
import { useFullscreen } from "@/hooks/use-fullscreen"
import { cn } from "@/lib/utils"

export function FullscreenButton({ className }: { className?: string }) {
	const { isFullscreen, isSupported, toggle } = useFullscreen()
	const location = useLocation()

	// Hide button on game route (game must stay fullscreen)
	if (location.pathname === "/game") {
		return null
	}

	// On main menu, only show if already in fullscreen (acts as exit button)
	if (location.pathname === "/" && !isFullscreen) {
		return null
	}

	if (!isSupported) {
		return null
	}

	const handleClick = async () => {
		try {
			await toggle()
		} catch (error) {
			console.error("Failed to toggle fullscreen:", error)
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"hidden lg:block font-main bg-stone-800/50 hover:bg-stone-700/50 rounded border border-stone-600 hover:border-stone-500 transition-all duration-200 cursor-pointer py-2 px-4",
				className,
			)}
			aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
			title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
		>
			<span>{isFullscreen ? "⛶ Exit" : "⛶ Full"}</span>
		</button>
	)
}
