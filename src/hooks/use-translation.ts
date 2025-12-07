import { useLanguageStore } from "@/lib/language-store"
import { EN, type Language, ZH_TW } from "@/lib/localization"

/**
 * Custom hook for accessing translations based on current language
 * @returns Object containing current language, translation object, and setter function
 */
export function useTranslation() {
	const { language, setLanguage } = useLanguageStore()
	const t = language === "EN" ? EN : ZH_TW

	return {
		language,
		t,
		setLanguage,
	}
}

/**
 * Helper function to get nested translation by dot-notation key
 * @param key - Dot-notation key (e.g., "game.navbar.timeLabel")
 * @param language - Language code (defaults to "EN")
 * @returns Translated string
 */
export function getTranslation(key: string, language: Language = "EN"): string {
	const locale = language === "EN" ? EN : ZH_TW
	const keys = key.split(".")
	// biome-ignore lint/suspicious/noExplicitAny: <locale can be any>
	let value: any = locale

	for (const k of keys) {
		if (value && typeof value === "object" && k in value) {
			value = value[k]
		} else {
			console.warn(`Translation key not found: ${key}`)
			return key
		}
	}

	return typeof value === "string" ? value : key
}
