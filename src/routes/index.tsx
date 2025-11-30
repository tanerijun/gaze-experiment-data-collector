import { createFileRoute, Link } from "@tanstack/react-router"
import { CrossedSwordIcon } from "@/components/icons"

export const Route = createFileRoute("/")({ component: App })

function App() {
	return (
		<div
			className="min-h-screen bg-cover bg-center bg-no-repeat text-stone-50 flex items-center justify-center px-4"
			style={{ backgroundImage: "url(/main-menu-bg.png)" }}
		>
			<div className="max-w-2xl w-full z-10">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-5xl sm:text-7xl font-bold bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent mb-4 drop-shadow-lg">
						The Deep Vault
					</h1>
					<p className="text-amber-200 text-lg sm:text-xl">Find all the matching pairs!</p>
					<p className="text-stone-400 text-sm mt-2">Test your memory and begin your quest</p>
				</div>

				{/* Start Game Button */}
				<div className="flex justify-center">
					<Link
						to="/game"
						className="group relative overflow-hidden rounded-xl p-8 text-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800 cursor-pointer active:scale-95 w-full max-w-md"
					>
						{/* Gradient Background */}
						<div className="absolute inset-0 bg-linear-to-br from-amber-950 via-amber-900 to-yellow-950 opacity-80" />

						{/* Glassmorphism backdrop blur layer */}
						<div className="absolute inset-0 backdrop-blur-xs rounded-xl" />

						{/* Border */}
						<div className="absolute inset-0 border-4 border-amber-800 rounded-xl transition-colors duration-300 group-hover:border-amber-700" />

						{/* Top accent line */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

						{/* Corner decorations */}
						<div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />

						{/* Content */}
						<div className="relative flex flex-col items-center gap-4">
							<CrossedSwordIcon className="size-16 text-amber-300 shrink-0 drop-shadow-lg" />
							<div className="flex-1">
								<h2 className="text-3xl font-bold text-amber-100 group-hover:text-amber-50 transition-colors drop-shadow-md mb-2">
									Start Game
								</h2>
								<p className="text-amber-200 text-sm group-hover:text-amber-100 transition-colors">
									16 pairs to match
								</p>
							</div>
						</div>

						{/* Bottom border accent */}
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</Link>
				</div>

				{/* Footer */}
				<div className="mt-12 text-center text-stone-400 text-sm">
					<p>Test your memory. Conquer the vault. Claim your victory.</p>
				</div>
			</div>
		</div>
	)
}
