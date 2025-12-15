import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { ExperimentTutorial } from "@/components/experiment-tutorial"
import { CrossedSwordIcon } from "@/components/icons"
import { LanguageSelectorDialog } from "@/components/language-selector-dialog"
import ParticipantForm from "@/components/participant-form"
import { SessionCleanupDialog } from "@/components/session-recovery-dialog"
import { SetupFlow } from "@/components/setup-flow"
import { useTranslation } from "@/hooks/use-translation"
import { useConsentStore } from "@/lib/consent"
import { useCustomDialog } from "@/lib/dialog/hooks"
import { getAllSessions } from "@/lib/indexed-db"
import { useLanguageStore } from "@/lib/language-store"
import { useRecordingStore } from "@/lib/recording-store"

export const Route = createFileRoute("/")({ component: App })

function App() {
	const { show } = useCustomDialog()
	const hasConsented = useConsentStore((s) => s.hasConsented)
	const setConsent = useConsentStore((s) => s.setConsent)
	const participant = useRecordingStore((s) => s.participant)
	const navigate = useNavigate()
	const { hasSelectedLanguage, isHydrated } = useLanguageStore()
	const { t, language } = useTranslation()
	const [showTutorial, setShowTutorial] = useState(false)
	const [showSetupFlow, setShowSetupFlow] = useState(false)
	const [showCleanup, setShowCleanup] = useState(false)
	const [hasStaleSessions, setHasStaleSessions] = useState(false)
	const [showLanguageSelector, setShowLanguageSelector] = useState(false)

	// Show language selector on first visit
	useEffect(() => {
		if (isHydrated && !hasSelectedLanguage) {
			setShowLanguageSelector(true)
		}
	}, [hasSelectedLanguage, isHydrated])

	useEffect(() => {
		const checkStorage = async () => {
			try {
				const sessions = await getAllSessions()
				// Show manager if there are any sessions at all
				const hasAnySessions = sessions.length > 0
				setHasStaleSessions(hasAnySessions)
			} catch (e) {
				console.error("Failed to check storage:", e)
			}
		}
		checkStorage()
	}, [])

	const handleAboutClick = () => {
		show({
			size: "large",
			header: ({ closeDialog }) => (
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold text-amber-100">{t.consent.title}</h2>
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
					<p className="text-amber-200 leading-relaxed">{t.consent.introduction}</p>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{t.consent.whatWeCollect.heading}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li className="leading-relaxed">{t.consent.whatWeCollect.item1}</li>
							<li className="leading-relaxed">{t.consent.whatWeCollect.item2}</li>
							<li className="leading-relaxed">{t.consent.whatWeCollect.item3}</li>
						</ul>
					</section>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{t.consent.howWeUseIt.heading}
						</h3>
						<p className="leading-relaxed">{t.consent.howWeUseIt.description}</p>
					</section>

					<section>
						<h3 className="text-xl font-semibold text-amber-100 mb-3">
							{t.consent.requirements.heading}
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li className="leading-relaxed">{t.consent.requirements.item1}</li>
							<li className="leading-relaxed">{t.consent.requirements.item2}</li>
							<li className="leading-relaxed">{t.consent.requirements.item3}</li>
							<li className="leading-relaxed">{t.consent.requirements.item4}</li>
							<li className="leading-relaxed">{t.consent.requirements.item5}</li>
						</ul>
					</section>

					<div className="bg-amber-950/50 border border-amber-800 rounded-lg p-4">
						<p className="text-amber-100 leading-relaxed font-medium">
							{t.consent.consentStatement}
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
							{t.consent.agreeButton}
						</button>
					)}
					<button
						type="button"
						onClick={closeDialog}
						className="px-6 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						{t.common.close}
					</button>
				</div>
			),
		})
	}

	const handleParticipantInfoClick = () => {
		show({
			size: "medium",
			header: () => (
				<div>
					<h2 className="text-2xl font-bold bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
						{t.participantForm.title}
					</h2>
				</div>
			),
			body: ({ closeDialog }) => (
				<ParticipantForm onComplete={closeDialog} onCancel={closeDialog} />
			),
		})
	}

	const handleStartExperiment = () => {
		setShowTutorial(true)
	}

	const handleTutorialComplete = () => {
		setShowTutorial(false)
		setShowSetupFlow(true)
	}

	const handleTutorialCancel = () => {
		setShowTutorial(false)
	}

	const handleSetupComplete = () => {
		// Setup is complete, recording has started, navigate to game
		setShowSetupFlow(false)
		navigate({ to: "/game" })
	}

	const handleSetupCancel = () => {
		setShowSetupFlow(false)
	}

	return (
		<>
			{showLanguageSelector && (
				<LanguageSelectorDialog onClose={() => setShowLanguageSelector(false)} />
			)}

			{showCleanup && (
				<SessionCleanupDialog
					onClose={() => {
						setShowCleanup(false)
						// Re-check sessions when dialog closes to see if we should hide the button
						getAllSessions().then((s) => setHasStaleSessions(s.length > 0))
					}}
				/>
			)}

			{showTutorial && (
				<ExperimentTutorial onComplete={handleTutorialComplete} onCancel={handleTutorialCancel} />
			)}

			{showSetupFlow && <SetupFlow onComplete={handleSetupComplete} onCancel={handleSetupCancel} />}

			<div
				className="min-h-screen bg-cover bg-center bg-no-repeat text-stone-50 flex items-center justify-center px-4"
				style={{ backgroundImage: "url(/main-menu-bg.png)" }}
			>
				{/* Language Switcher Button */}
				<button
					type="button"
					onClick={() => setShowLanguageSelector(true)}
					className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 px-4 py-2 rounded-lg backdrop-blur-sm border border-stone-700 transition-all shadow-lg hover:scale-105"
					aria-label="Change language"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
						/>
					</svg>
					<span className="font-semibold">{language === "EN" ? "EN" : "繁中"}</span>
				</button>

				<div className="max-w-2xl w-full z-10">
					{hasStaleSessions && (
						<button
							type="button"
							onClick={() => setShowCleanup(true)}
							className="absolute bottom-4 left-4 z-40 flex items-center gap-2 bg-amber-950/80 hover:bg-amber-900 text-amber-200 px-4 py-2 rounded-lg backdrop-blur-sm border border-amber-800 transition-all shadow-lg hover:scale-105"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
								/>
							</svg>
							<span className="font-semibold">{t.mainMenu.manageSessionsButton}</span>
						</button>
					)}

					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-5xl sm:text-7xl font-bold bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent mb-4 drop-shadow-lg">
							{t.mainMenu.title}
						</h1>
						<p className="text-stone-400 text-lg sm:text-xl">{t.mainMenu.subtitle}</p>
					</div>

					{/* Menu Buttons */}
					<div className="flex flex-col gap-6">
						{/* 1. About/Consent Button */}
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
										{t.mainMenu.aboutButton.title}
									</h2>
									<p className="text-stone-400 text-sm group-hover:text-stone-300 transition-colors mt-1">
										{hasConsented
											? t.mainMenu.aboutButton.descriptionWithConsent
											: t.mainMenu.aboutButton.descriptionNoConsent}
									</p>
								</div>
								<div className="flex items-center gap-2">
									{hasConsented && (
										<span className="text-green-400 text-xs font-semibold">
											{t.mainMenu.aboutButton.consentedBadge}
										</span>
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

						{/* 2. Participant Information Button */}
						<button
							type="button"
							onClick={handleParticipantInfoClick}
							disabled={!hasConsented}
							className={`group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 focus:outline-none w-full ${
								hasConsented
									? "hover:scale-105 cursor-pointer active:scale-95 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800"
									: "cursor-not-allowed opacity-50"
							}`}
						>
							{/* Gradient Background */}
							<div className="absolute inset-0 bg-linear-to-br from-stone-800 via-stone-700 to-stone-800 opacity-80" />

							{/* Glassmorphism backdrop blur layer */}
							<div className="absolute inset-0 backdrop-blur-xs rounded-xl" />

							{/* Border */}
							<div
								className={`absolute inset-0 border-4 rounded-xl transition-colors duration-300 ${
									hasConsented
										? "border-stone-600 group-hover:border-stone-500"
										: "border-stone-700"
								}`}
							/>

							{/* Top accent line */}
							{hasConsented && (
								<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							)}

							{/* Content */}
							<div className="relative flex items-center justify-center gap-4">
								<div className="flex-1 text-left pl-4">
									<h2
										className={`text-2xl font-bold transition-colors drop-shadow-md ${
											hasConsented ? "text-stone-200 group-hover:text-stone-100" : "text-stone-600"
										}`}
									>
										{t.mainMenu.participantButton.title}
									</h2>
									<p
										className={`text-sm transition-colors mt-1 ${
											hasConsented ? "text-stone-400 group-hover:text-stone-300" : "text-stone-600"
										}`}
									>
										{participant
											? t.mainMenu.participantButton.descriptionComplete
											: hasConsented
												? t.mainMenu.participantButton.descriptionIncomplete
												: t.mainMenu.participantButton.descriptionLocked}
									</p>
								</div>
								<div className="flex items-center gap-2">
									{participant && (
										<span className="text-green-400 text-xs font-semibold">
											{t.mainMenu.participantButton.completeBadge}
										</span>
									)}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className={`h-8 w-8 transition-colors ${
											hasConsented ? "text-stone-400 group-hover:text-stone-300" : "text-stone-600"
										}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
							</div>

							{/* Bottom border accent */}
							{hasConsented && (
								<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							)}
						</button>

						{/* 3. Start Experiment Button */}
						<button
							type="button"
							onClick={handleStartExperiment}
							disabled={!hasConsented || !participant}
							className={`group relative overflow-hidden rounded-xl p-8 text-center transition-all duration-300 focus:outline-none w-full ${
								hasConsented && participant
									? "hover:scale-105 cursor-pointer active:scale-95 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800"
									: "cursor-not-allowed opacity-50"
							}`}
						>
							{/* Gradient Background */}
							<div className="absolute inset-0 bg-linear-to-br from-amber-950 via-amber-900 to-yellow-950 opacity-80" />

							{/* Glassmorphism backdrop blur layer */}
							<div className="absolute inset-0 backdrop-blur-xs rounded-xl" />

							{/* Border */}
							<div
								className={`absolute inset-0 border-4 rounded-xl transition-colors duration-300 ${
									hasConsented && participant
										? "border-amber-800 group-hover:border-amber-700"
										: "border-amber-900"
								}`}
							/>

							{/* Top accent line */}
							{hasConsented && participant && (
								<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							)}

							{/* Corner decorations */}
							{hasConsented && participant && (
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
										hasConsented && participant ? "text-amber-300" : "text-amber-800"
									}`}
								/>
								<div className="flex-1">
									<h2
										className={`text-3xl font-bold drop-shadow-md mb-2 transition-colors ${
											hasConsented && participant
												? "text-amber-100 group-hover:text-amber-50"
												: "text-amber-800"
										}`}
									>
										{t.mainMenu.startButton.title}
									</h2>
									<p
										className={`text-sm transition-colors ${
											hasConsented && participant
												? "text-amber-200 group-hover:text-amber-100"
												: "text-amber-800"
										}`}
									>
										{hasConsented && participant
											? t.mainMenu.startButton.descriptionReady
											: !hasConsented
												? t.mainMenu.startButton.descriptionConsentNeeded
												: t.mainMenu.startButton.descriptionInfoNeeded}
									</p>
								</div>
							</div>

							{/* Bottom border accent */}
							{hasConsented && participant && (
								<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							)}
						</button>
					</div>

					{/* Footer */}
					<div className="mt-8 text-center space-y-4">
						<p className="text-stone-400">
							{!hasConsented
								? t.mainMenu.footer.step1
								: !participant
									? t.mainMenu.footer.step2
									: t.mainMenu.footer.step3}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}
