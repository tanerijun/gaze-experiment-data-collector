import { Link } from "@tanstack/react-router"
import { useTranslation } from "@/hooks/use-translation"

export function ErrorPage() {
	const { t } = useTranslation()

	return (
		<div
			className="min-h-screen bg-cover bg-center bg-no-repeat text-stone-50 flex items-center justify-center px-4"
			style={{ backgroundImage: "url(/main-menu-bg.png)" }}
		>
			<div className="flex flex-col gap-6 items-center justify-center">
				<h2 className="text-7xl text-red-800">{t.errorPage.title}</h2>
				<Link
					to="/"
					className="text-blue-500 text-xl hover:text-blue-400 hover:scale-110 transition-all"
				>
					{t.errorPage.resetButton}
				</Link>
			</div>
		</div>
	)
}
