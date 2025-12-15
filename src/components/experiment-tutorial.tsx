import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { AlertIcon, CheckmarkIcon } from "./icons"

type TutorialStep = "intro" | "calibration" | "game"

interface ExperimentTutorialProps {
	onComplete: () => void
	onCancel: () => void
}

export function ExperimentTutorial({ onComplete, onCancel }: ExperimentTutorialProps) {
	const { t } = useTranslation()
	const [currentStep, setCurrentStep] = useState<TutorialStep>("intro")

	const handleNext = () => {
		if (currentStep === "intro") {
			setCurrentStep("calibration")
		} else if (currentStep === "calibration") {
			setCurrentStep("game")
		} else if (currentStep === "game") {
			onComplete()
		}
	}

	const handleBack = () => {
		if (currentStep === "calibration") {
			setCurrentStep("intro")
		} else if (currentStep === "game") {
			setCurrentStep("calibration")
		}
	}

	return (
		<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl border-4 border-amber-600 p-8 max-w-3xl w-full relative overflow-hidden">
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400" />
				<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400" />
				<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400" />
				<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400" />

				{/* Intro Step */}
				{currentStep === "intro" && (
					<div className="space-y-4">
						<h2 className="text-3xl font-bold text-amber-100 text-center">
							{t.tutorial.intro.title}
						</h2>

						<p className="text-stone-200 text-center text-lg leading-relaxed">
							{t.tutorial.intro.description}
						</p>

						<div className="bg-amber-950/30 border border-amber-800 rounded-lg p-6">
							<h3 className="text-amber-100 font-semibold mb-4 flex items-center">
								<AlertIcon className="size-6 mr-2" />
								{t.tutorial.intro.partsLabel}
							</h3>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-amber-950 font-bold flex items-center justify-center">
										1
									</div>
									<div>
										<h4 className="text-amber-100 font-semibold mb-1">
											{t.tutorial.intro.part1Title}
										</h4>
										<p className="text-stone-300">{t.tutorial.intro.part1Description}</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-amber-950 font-bold flex items-center justify-center">
										2
									</div>
									<div>
										<h4 className="text-amber-100 font-semibold mb-1">
											{t.tutorial.intro.part2Title}
										</h4>
										<p className="text-stone-300">{t.tutorial.intro.part2Description}</p>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-blue-950/30 border border-blue-800 rounded-lg p-4">
							<p className="text-blue-200 flex items-start">
								<CheckmarkIcon className="size-5 mr-2 mt-0.5 shrink-0" />
								<span>{t.tutorial.intro.estimatedTime}</span>
							</p>
						</div>
					</div>
				)}

				{/* Calibration Tutorial */}
				{currentStep === "calibration" && (
					<div className="space-y-6">
						<h2 className="text-3xl font-bold text-amber-100 text-center">
							{t.tutorial.calibration.title}
						</h2>

						<p className="text-stone-200 text-center leading-relaxed">
							{t.tutorial.calibration.description}
						</p>

						<div className="bg-amber-950/30 border border-amber-800 rounded-lg p-6">
							<h3 className="text-amber-100 font-semibold mb-4 flex items-center">
								<AlertIcon className="size-5 mr-2" />
								{t.tutorial.calibration.instructionsLabel}
							</h3>
							<ol className="list-decimal list-inside space-y-3 text-stone-300">
								<li>{t.tutorial.calibration.instruction1}</li>
								<li>{t.tutorial.calibration.instruction2}</li>
								<li>{t.tutorial.calibration.instruction3}</li>
								<li>{t.tutorial.calibration.instruction4}</li>
							</ol>
						</div>
					</div>
				)}

				{/* Game Tutorial */}
				{currentStep === "game" && (
					<div className="space-y-6">
						<h2 className="text-3xl font-bold text-amber-100 text-center">
							{t.tutorial.game.title}
						</h2>

						<div className="bg-stone-800/50 border border-stone-700 rounded-lg p-6">
							<h3 className="text-amber-100 font-semibold mb-3">{t.tutorial.game.storyTitle}</h3>
							<p className="text-stone-200 leading-relaxed">{t.tutorial.game.storyDescription}</p>
						</div>

						<div className="bg-amber-950/30 border border-amber-800 rounded-lg p-6">
							<h3 className="text-amber-100 font-semibold mb-4 flex items-center">
								<AlertIcon className="size-5 mr-2" />
								{t.tutorial.game.howToPlayLabel}
							</h3>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-amber-950 font-bold flex items-center justify-center text-sm font-main">
										1
									</div>
									<div>
										<h4 className="text-amber-100 font-semibold mb-1">
											{t.tutorial.game.step1Title}
										</h4>
										<p className="text-stone-300">{t.tutorial.game.step1Description}</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-amber-950 font-bold flex items-center justify-center text-sm font-main">
										2
									</div>
									<div>
										<h4 className="text-amber-100 font-semibold mb-1">
											{t.tutorial.game.step2Title}
										</h4>
										<p className="text-stone-300">{t.tutorial.game.step2Description}</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-amber-950 font-bold flex items-center justify-center text-sm font-main">
										3
									</div>
									<div>
										<h4 className="text-amber-100 font-semibold mb-1">
											{t.tutorial.game.step3Title}
										</h4>
										<p className="text-stone-300">{t.tutorial.game.step3Description}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Navigation Buttons */}
				<div className="flex gap-3 mt-8">
					{currentStep === "intro" ? (
						<button
							type="button"
							onClick={onCancel}
							className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-black active:scale-95"
						>
							{t.common.cancel}
						</button>
					) : (
						<button
							type="button"
							onClick={handleBack}
							className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-black active:scale-95"
						>
							{t.common.back}
						</button>
					)}

					<button
						type="button"
						onClick={handleNext}
						className="flex-1 group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black"
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
						<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative z-10">
							{currentStep === "game" ? t.tutorial.startButton : t.common.continue}
						</span>
					</button>
				</div>

				{/* Step indicator */}
				<div className="flex justify-center gap-2 mt-6">
					<div
						className={`h-2 w-2 rounded-full transition-all duration-300 ${
							currentStep === "intro" ? "bg-amber-500 w-8" : "bg-stone-600"
						}`}
					/>
					<div
						className={`h-2 w-2 rounded-full transition-all duration-300 ${
							currentStep === "calibration" ? "bg-amber-500 w-8" : "bg-stone-600"
						}`}
					/>
					<div
						className={`h-2 w-2 rounded-full transition-all duration-300 ${
							currentStep === "game" ? "bg-amber-500 w-8" : "bg-stone-600"
						}`}
					/>
				</div>
			</div>
		</div>
	)
}
