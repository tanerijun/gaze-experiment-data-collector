/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <workaround for dialog interaction> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <workaround for dialog interaction> */

import { CloseIcon } from "./icons"

interface CreditsDialogProps {
	isOpen: boolean
	onClose: () => void
}

const CREDITS_DATA = [
	{ role: "Development", names: ["tanerijun"] },
	{ role: "Graphics & Icons", names: ["Kenney", "Craftpix", "Game-icons"] },
]

export default function CreditsDialog({ isOpen, onClose }: CreditsDialogProps) {
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				className="relative bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-lg shadow-2xl border-4 border-stone-700 max-w-md w-full animate-in zoom-in-95 duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-stone-600" />
				<div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-stone-600" />
				<div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-stone-600" />
				<div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-stone-600" />

				{/* Header */}
				<div className="relative p-4 border-b-2 border-stone-700">
					<h2 className="text-2xl font-bold text-center bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
						Credits
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all duration-200 text-stone-300 hover:text-stone-100 cursor-pointer"
						aria-label="Close credits"
					>
						<CloseIcon className="size-6" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="space-y-3">
						{CREDITS_DATA.map((credit, index) => (
							<div key={credit.role}>
								<div className="py-2">
									<p className="text-stone-400 text-xs uppercase tracking-wider font-bold mb-1">
										{credit.role}
									</p>
									{credit.names.map((name) => (
										<p key={name} className="text-stone-100 text-sm font-medium">
											{name}
										</p>
									))}
								</div>

								{/* Separator (except after last item) */}
								{index < CREDITS_DATA.length - 1 && (
									<div className="h-px bg-linear-to-r from-transparent via-stone-700 to-transparent" />
								)}
							</div>
						))}
					</div>
				</div>

				{/* Bottom border accent */}
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
			</div>
		</div>
	)
}
