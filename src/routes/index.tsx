import { createFileRoute, Link } from "@tanstack/react-router"
import CreditsDialog from "@/components/credits-dialog"
import { DialogButton } from "@/components/dialog-button"
import {
	CrossedSwordIcon,
	CrownIcon,
	DemonLevelIcon,
	GoblinLevelIcon,
	GolemLevelIcon,
	OrcLevelIcon,
	ThreeFriendsIcon,
	TrollLevelIcon,
	VampireLevelIcon,
} from "@/components/icons"
import LeaderboardDialog from "@/components/leaderboard-dialog"
import { GRID_CONFIGS } from "@/lib/game-utils"
import type { Difficulty } from "@/lib/types"

export const Route = createFileRoute("/")({ component: App })

const DIFFICULTY_CONFIG: Array<{
	value: Difficulty
	label: string
	description: string
	Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
	bgColor: string
	borderColor: string
	hoverBorder: string
	accentColor: string
}> = [
	{
		value: "goblin",
		label: "Goblin",
		description: `${GRID_CONFIGS.goblin.pairs} pairs`,
		Icon: GoblinLevelIcon,
		bgColor: "from-slate-950 via-slate-900 to-slate-950",
		borderColor: "border-slate-800",
		hoverBorder: "group-hover:border-slate-700",
		accentColor: "via-slate-700",
	},
	{
		value: "troll",
		label: "Troll",
		description: `${GRID_CONFIGS.troll.pairs} pairs`,
		Icon: TrollLevelIcon,
		bgColor: "from-cyan-950 via-slate-900 to-slate-950",
		borderColor: "border-cyan-900",
		hoverBorder: "group-hover:border-cyan-800",
		accentColor: "via-cyan-800",
	},
	{
		value: "orc",
		label: "Orc",
		description: `${GRID_CONFIGS.orc.pairs} pairs`,
		Icon: OrcLevelIcon,
		bgColor: "from-emerald-950 via-slate-900 to-slate-950",
		borderColor: "border-emerald-900",
		hoverBorder: "group-hover:border-emerald-800",
		accentColor: "via-emerald-800",
	},
	{
		value: "golem",
		label: "Golem",
		description: `${GRID_CONFIGS.golem.pairs} pairs`,
		Icon: GolemLevelIcon,
		bgColor: "from-amber-950 via-stone-900 to-stone-950",
		borderColor: "border-amber-900",
		hoverBorder: "group-hover:border-amber-800",
		accentColor: "via-amber-900",
	},
	{
		value: "vampire",
		label: "Vampire",
		description: `${GRID_CONFIGS.vampire.pairs} pairs`,
		Icon: VampireLevelIcon,
		bgColor: "from-red-950 via-stone-900 to-stone-950",
		borderColor: "border-red-900",
		hoverBorder: "group-hover:border-red-800",
		accentColor: "via-red-900",
	},
	{
		value: "demon",
		label: "Demon",
		description: `${GRID_CONFIGS.demon.pairs} pairs`,
		Icon: DemonLevelIcon,
		bgColor: "from-rose-950 via-stone-950 to-black",
		borderColor: "border-rose-950",
		hoverBorder: "group-hover:border-rose-900",
		accentColor: "via-rose-900",
	},
]

function App() {
	return (
		<div
			className="min-h-screen bg-cover bg-center bg-no-repeat text-stone-50 flex items-center justify-center px-4"
			style={{ backgroundImage: "url(/main-menu-bg.png)" }}
		>
			<div className="max-w-3xl w-full z-10">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-5xl sm:text-7xl font-bold bg-linear-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent mb-4 drop-shadow-lg">
						The Deep Vault
					</h1>
					<p className="text-amber-200 text-lg sm:text-xl">Find all the matching pairs!</p>
					<p className="text-stone-400 text-sm mt-2">Choose your path and begin your quest</p>
				</div>

				{/* Difficulty Selection */}
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{DIFFICULTY_CONFIG.map(
						({
							value,
							label,
							description,
							Icon,
							bgColor,
							borderColor,
							hoverBorder,
							accentColor,
						}) => (
							<Link
								to="/$difficulty"
								params={{ difficulty: value }}
								key={value}
								className="group relative overflow-hidden rounded-lg p-3 text-left transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800 cursor-pointer active:scale-95"
							>
								{/* Gradient Background with themed colors */}
								<div className={`absolute inset-0 bg-linear-to-br ${bgColor} opacity-60`} />

								{/* Glassmorphism backdrop blur layer */}
								<div className="absolute inset-0 backdrop-blur-xs rounded-lg" />

								{/* Border with theme color */}
								<div
									className={`absolute inset-0 border-4 ${borderColor} rounded-lg transition-colors duration-300 ${hoverBorder}`}
								/>

								{/* Top accent line with theme color */}
								<div
									className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent ${accentColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
								/>

								{/* Corner decorations */}
								<div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

								{/* Content */}
								<div className="relative flex flex-col items-center gap-2 text-center py-2">
									<Icon className="size-10 text-stone-300 shrink-0" />
									<div className="flex-1">
										<h3 className="text-lg font-bold text-stone-100 group-hover:text-stone-50 transition-colors drop-shadow-md">
											{label}
										</h3>
										<p className="text-stone-400 text-xs group-hover:text-stone-300 transition-colors">
											{description}
										</p>
									</div>
									<div className="text-2xl transition-transform duration-300 group-hover:scale-110">
										<CrossedSwordIcon className="text-stone-100 drop-shadow-lg" />
									</div>
								</div>

								{/* Bottom border accent */}
								<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</Link>
						),
					)}
				</div>

				{/* Footer */}
				<div className="mt-12 text-center text-stone-400 text-sm">
					<p>With your memory. Conquer the vault. Claim your victory.</p>
					<div className="flex justify-center gap-4 mt-8">
						<DialogButton
							className="static lg:fixed z-20 bottom-6 left-6"
							icon={<CrownIcon className="size-8" />}
							label="Show leaderboard"
							title="Leaderboard"
							dialog={LeaderboardDialog}
						/>
						<DialogButton
							className="static lg:fixed z-20 bottom-6 right-6"
							icon={<ThreeFriendsIcon className="size-8" />}
							label="Show credits"
							title="Credits"
							dialog={CreditsDialog}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
