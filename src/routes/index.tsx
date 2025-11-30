import { createFileRoute, Link } from "@tanstack/react-router"
import { CrossedSwordIcon } from "@/components/icons"
import { CONSENT_TEXT, useConsentStore } from "@/lib/consent"
import { useCustomDialog } from "@/lib/dialog/hooks"

export const Route = createFileRoute("/")({ component: App })

function App() {
	const { hasConsented, setConsent } = useConsentStore()
	const { show } = useCustomDialog()

	const handleAboutClick = () => {
		show({
			size: "large",
			header: ({ closeDialog }) => (
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold text-amber-100">{CONSENT_TEXT.title}</h2>
					<button
						type="button"
						onClick={closeDialog}
						className="text-stone-400 hover:text-stone-200 transition-colors"
						aria-label="Close dialog"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			),
			body: () => (
				<div className="space-y-6 text-stone-200 max-h-[60vh] overflow-y-auto pr-2">
					<p className="text-amber-200 leading-relaxed">{CONSENT_TEXT.introduction}</p>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{CONSENT_TEXT.whatWeCollect.heading}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							{CONSENT_TEXT.whatWeCollect.items.map((item) => (
								<li key={item} className="leading-relaxed">
									{item}
								</li>
							))}
						</ul>
					</section>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{CONSENT_TEXT.howWeUseIt.heading}
						</h3>
						<p className="leading-relaxed">{CONSENT_TEXT.howWeUseIt.description}</p>
					</section>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{CONSENT_TEXT.privacy.heading}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							{CONSENT_TEXT.privacy.items.map((item) => (
								<li key={item} className="leading-relaxed">
									{item}
								</li>
							))}
						</ul>
					</section>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{CONSENT_TEXT.rights.heading}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							{CONSENT_TEXT.rights.items.map((item) => (
								<li key={item} className="leading-relaxed">
									{item}
								</li>
							))}
						</ul>
					</section>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{CONSENT_TEXT.requirements.heading}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							{CONSENT_TEXT.requirements.items.map((item) => (
								<li key={item} className="leading-relaxed">
									{item}
								</li>
							))}
						</ul>
					</section>

					<div className="bg-amber-950/50 border border-amber-800 rounded-lg p-4">
						<p className="text-amber-100 leading-relaxed font-medium">
							{CONSENT_TEXT.consentStatement}
						</p>
					</div>
				</div>
			),
			footer: ({ closeDialog }) => (
				<div className="flex justify-end gap-3">
					{!hasConsented && (
						<button
							type="button"
							onClick={() => {
								setConsent(true)
								closeDialog()
							}}
							className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
						>
							I Agree and Consent
						</button>
					)}
					<button
						type="button"
						onClick={closeDialog}
						className="px-6 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						Close
					</button>
				</div>
			),
		})
	}

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
					<p className="text-amber-200 text-lg sm:text-xl">
						Gaze Estimation Data Collection Platform
					</p>
					<p className="text-stone-400 text-sm mt-2">
						Help train AI by playing a memory matching game
					</p>
				</div>

				{/* Menu Buttons */}
				<div className="flex flex-col gap-6">
					{/* About Button */}
					<button
						type="button"
						onClick={handleAboutClick}
						className="group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800 cursor-pointer active:scale-95 w-full"
					>
						{/* Gradient Background */}
						<div className="absolute inset-0 bg-linear-to-br from-stone-800 via-stone-700 to-stone-800 opacity-80" />

						{/* Glassmorphism backdrop blur layer */}
						<div className="absolute inset-0 backdrop-blur-xs rounded-xl" />

						{/* Border */}
						<div className="absolute inset-0 border-4 border-stone-600 rounded-xl transition-colors duration-300 group-hover:border-stone-500" />

						{/* Top accent line */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

						{/* Content */}
						<div className="relative flex items-center justify-center gap-4">
							<div className="flex-1 text-left pl-4">
								<h2 className="text-2xl font-bold text-stone-200 group-hover:text-stone-100 transition-colors drop-shadow-md">
									1. ABOUT
								</h2>
								<p className="text-stone-400 text-sm group-hover:text-stone-300 transition-colors mt-1">
									{hasConsented
										? "Review data collection information"
										: "Read about data collection & consent"}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{hasConsented && (
									<span className="text-green-400 text-sm font-semibold">✓ Consented</span>
								)}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-8 w-8 text-stone-400 group-hover:text-stone-300 transition-colors"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>

						{/* Bottom border accent */}
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</button>

					{/* Play Game Button */}
					<Link
						to="/game"
						className={`group relative overflow-hidden rounded-xl p-8 text-center transition-all duration-300 focus:outline-none w-full ${
							hasConsented
								? "hover:scale-105 cursor-pointer active:scale-95 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800"
								: "cursor-not-allowed opacity-50"
						}`}
						disabled={!hasConsented}
						onClick={(e) => {
							if (!hasConsented) {
								e.preventDefault()
							}
						}}
					>
						{/* Gradient Background */}
						<div className="absolute inset-0 bg-linear-to-br from-amber-950 via-amber-900 to-yellow-950 opacity-80" />

						{/* Glassmorphism backdrop blur layer */}
						<div className="absolute inset-0 backdrop-blur-xs rounded-xl" />

						{/* Border */}
						<div
							className={`absolute inset-0 border-4 rounded-xl transition-colors duration-300 ${
								hasConsented ? "border-amber-800 group-hover:border-amber-700" : "border-amber-900"
							}`}
						/>

						{/* Top accent line */}
						{hasConsented && (
							<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						)}

						{/* Corner decorations */}
						{hasConsented && (
							<>
								<div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
							</>
						)}

						{/* Content */}
						<div className="relative flex flex-col items-center gap-4">
							<CrossedSwordIcon
								className={`size-16 shrink-0 drop-shadow-lg transition-colors ${
									hasConsented ? "text-amber-300" : "text-amber-800"
								}`}
							/>
							<div className="flex-1">
								<h2
									className={`text-3xl font-bold drop-shadow-md mb-2 transition-colors ${
										hasConsented ? "text-amber-100 group-hover:text-amber-50" : "text-amber-800"
									}`}
								>
									2. PLAY GAME
								</h2>
								<p
									className={`text-sm transition-colors ${
										hasConsented ? "text-amber-200 group-hover:text-amber-100" : "text-amber-800"
									}`}
								>
									{hasConsented
										? "16 pairs to match • Recording enabled"
										: "Complete consent before playing"}
								</p>
							</div>
						</div>

						{/* Bottom border accent */}
						{hasConsented && (
							<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						)}
					</Link>
				</div>

				{/* Footer */}
				<div className="mt-12 text-center text-stone-400 text-sm">
					<p>
						{hasConsented
							? "Thank you for participating in gaze estimation research"
							: "Read the About section to learn more and provide consent"}
					</p>
				</div>
			</div>
		</div>
	)
}
