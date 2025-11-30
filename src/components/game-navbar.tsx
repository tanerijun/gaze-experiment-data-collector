import { Link } from "@tanstack/react-router"
import { formatTime } from "@/lib/game-utils"
import type { GameStats } from "@/lib/types"

interface GameNavbarProps {
	stats: GameStats
}

export default function GameNavbar({ stats }: GameNavbarProps) {
	return (
		<div className="w-full relative backdrop-blur-lg p-2 flex items-center justify-center">
			{/* Menu Button */}
			<Link
				to="/"
				className="absolute left-2 top-2 bg-stone-800/50 hover:bg-stone-700/50 rounded border border-stone-600 hover:border-stone-500 transition-all duration-200 cursor-pointer py-0 px-1 lg:py-2 lg:px-4"
				aria-label="Back to menu"
			>
				<div className="flex gap-2">
					<span>←</span>
					<span className="hidden lg:block">Menu</span>
				</div>
			</Link>

			<div className="flex items-center gap-2 sm:gap-4 md:gap-6">
				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
						Time
					</span>
					<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold w-12 text-center">
						{formatTime(stats.timeElapsed)}
					</span>
				</div>

				<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
						Moves
					</span>
					<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold w-12 text-center">
						{stats.moves}
					</span>
				</div>

				<div className="h-6 sm:h-8 w-px bg-linear-to-b from-transparent via-stone-600 to-transparent" />

				<div className="flex flex-col items-center">
					<span className="text-stone-400 text-[8px] sm:text-[10px] uppercase tracking-wider font-bold">
						Matches
					</span>
					<span className="text-stone-100 text-[10px] sm:text-xs md:text-sm font-bold w-12 text-center">
						{stats.matches}
					</span>
				</div>
			</div>
		</div>
	)
}
