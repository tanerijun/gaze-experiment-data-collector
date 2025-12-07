import { useState } from "react"
import { useLanguageStore } from "@/lib/language-store"
import type { Language } from "@/lib/localization"

interface LanguageSelectorDialogProps {
	onClose: () => void
}

export function LanguageSelectorDialog({ onClose }: LanguageSelectorDialogProps) {
	const { language: currentLanguage, setLanguage } = useLanguageStore()
	const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage)

	const handleConfirm = () => {
		setLanguage(selectedLanguage)
		onClose()
	}

	const languages: { code: Language; name: string; nativeName: string }[] = [
		{ code: "EN", name: "English", nativeName: "English" },
		{ code: "ZH-TW", name: "Traditional Chinese", nativeName: "繁體中文" },
	]

	return (
		<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl border-4 border-amber-600 p-8 max-w-md w-full relative overflow-hidden">
				{/* Top border accent */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

				{/* Corner decorations */}
				<div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-amber-400" />
				<div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-amber-400" />
				<div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-amber-400" />
				<div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-amber-400" />

				<h2 className="text-3xl font-bold text-center bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg mb-2">
					Language
				</h2>

				<p className="text-stone-300 text-center mb-6 text-sm">Choose your preferred language</p>

				{/* Language options */}
				<div className="space-y-3 mb-6">
					{languages.map((lang) => (
						<button
							key={lang.code}
							type="button"
							onClick={() => setSelectedLanguage(lang.code)}
							className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
								selectedLanguage === lang.code
									? "border-amber-500 bg-amber-950/50"
									: "border-stone-600 bg-stone-950/30 hover:border-stone-500 hover:bg-stone-950/50"
							}`}
						>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-lg font-semibold text-amber-100">{lang.code}</div>
									<div className="text-sm text-stone-400">{lang.nativeName}</div>
								</div>
								{selectedLanguage === lang.code && <div className="text-amber-400 text-xl">✓</div>}
							</div>
						</button>
					))}
				</div>

				{/* Confirm button */}
				<button
					type="button"
					onClick={handleConfirm}
					className="w-full group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
					<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
					<span className="relative z-10">{selectedLanguage === "EN" ? "Confirm" : "確認"}</span>
				</button>
			</div>
		</div>
	)
}
