/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <workaround for dialog interaction> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <workaround for dialog interaction> */

import type { Difficulty } from "@/lib/types"
import {
	CloseIcon,
	DemonLevelIcon,
	GoblinLevelIcon,
	GolemLevelIcon,
	OrcLevelIcon,
	TrollLevelIcon,
	VampireLevelIcon,
} from "./icons"

interface LeaderboardEntry {
	rank: number
	playerName: string
	score: number
}

interface LeaderboardDialogProps {
	isOpen: boolean
	onClose: () => void
}

// Dummy data for each difficulty (Top 5 only)
const DUMMY_LEADERBOARD_DATA: Record<Difficulty, LeaderboardEntry[]> = {
	goblin: [
		{ rank: 1, playerName: "DragonSlayer", score: 9850 },
		{ rank: 2, playerName: "KnightOfValor", score: 9200 },
		{ rank: 3, playerName: "MysticMage", score: 8750 },
		{ rank: 4, playerName: "ShadowHunter", score: 8500 },
		{ rank: 5, playerName: "StormBringer", score: 8200 },
	],
	troll: [
		{ rank: 1, playerName: "MasterMind", score: 15420 },
		{ rank: 2, playerName: "MemoryKing", score: 14880 },
		{ rank: 3, playerName: "QuickThink", score: 14200 },
		{ rank: 4, playerName: "BrainPower", score: 13750 },
		{ rank: 5, playerName: "SharpEye", score: 13200 },
	],
	orc: [
		{ rank: 1, playerName: "LegendaryHero", score: 22500 },
		{ rank: 2, playerName: "ElitePlayer", score: 21800 },
		{ rank: 3, playerName: "ChampionX", score: 21200 },
		{ rank: 4, playerName: "ProGamer", score: 20650 },
		{ rank: 5, playerName: "VictorySeeker", score: 20100 },
	],
	golem: [
		{ rank: 1, playerName: "GrandMaster", score: 31200 },
		{ rank: 2, playerName: "UltimatePro", score: 30400 },
		{ rank: 3, playerName: "SupremeRuler", score: 29600 },
		{ rank: 4, playerName: "MightyConqueror", score: 28900 },
		{ rank: 5, playerName: "PowerHouse", score: 28200 },
	],
	vampire: [
		{ rank: 1, playerName: "ImmortalOne", score: 42000 },
		{ rank: 2, playerName: "NightStalker", score: 41100 },
		{ rank: 3, playerName: "DarkLord", score: 40200 },
		{ rank: 4, playerName: "BloodPrince", score: 39300 },
		{ rank: 5, playerName: "EternalHunter", score: 38400 },
	],
	demon: [
		{ rank: 1, playerName: "Apocalypse", score: 55000 },
		{ rank: 2, playerName: "Inferno", score: 53800 },
		{ rank: 3, playerName: "HellSpawn", score: 52600 },
		{ rank: 4, playerName: "DeathBringer", score: 51400 },
		{ rank: 5, playerName: "ChaosReign", score: 50200 },
	],
}

const DIFFICULTY_CONFIG = [
	{
		value: "goblin" as Difficulty,
		label: "Goblin",
		Icon: GoblinLevelIcon,
		bgColor: "from-slate-950 via-slate-900 to-slate-950",
		borderColor: "border-slate-800",
		accentColor: "via-slate-700",
	},
	{
		value: "troll" as Difficulty,
		label: "Troll",
		Icon: TrollLevelIcon,
		bgColor: "from-cyan-950 via-slate-900 to-slate-950",
		borderColor: "border-cyan-900",
		accentColor: "via-cyan-800",
	},
	{
		value: "orc" as Difficulty,
		label: "Orc",
		Icon: OrcLevelIcon,
		bgColor: "from-emerald-950 via-slate-900 to-slate-950",
		borderColor: "border-emerald-900",
		accentColor: "via-emerald-800",
	},
	{
		value: "golem" as Difficulty,
		label: "Golem",
		Icon: GolemLevelIcon,
		bgColor: "from-amber-950 via-stone-900 to-stone-950",
		borderColor: "border-amber-900",
		accentColor: "via-amber-900",
	},
	{
		value: "vampire" as Difficulty,
		label: "Vampire",
		Icon: VampireLevelIcon,
		bgColor: "from-red-950 via-stone-900 to-stone-950",
		borderColor: "border-red-900",
		accentColor: "via-red-900",
	},
	{
		value: "demon" as Difficulty,
		label: "Demon",
		Icon: DemonLevelIcon,
		bgColor: "from-rose-950 via-stone-950 to-black",
		borderColor: "border-rose-950",
		accentColor: "via-rose-900",
	},
]

export default function LeaderboardDialog({ isOpen, onClose }: LeaderboardDialogProps) {
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				className="relative bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-lg shadow-2xl border-4 border-stone-700 max-w-6xl w-full animate-in zoom-in-95 duration-200"
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
						Leaderboard - Top 5
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all duration-200 text-stone-300 hover:text-stone-100 cursor-pointer"
						aria-label="Close leaderboard"
					>
						<CloseIcon className="size-6" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4 overflow-x-auto overflow-y-auto max-h-[70vh] md:overflow-x-visible md:overflow-y-visible md:max-h-none">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 min-w-max md:min-w-0">
						{DIFFICULTY_CONFIG.map(({ value, label, Icon, bgColor, borderColor, accentColor }) => (
							<div key={value} className="flex flex-col min-w-[180px] max-w-full mx-auto w-full">
								{/* Column Header */}
								<div
									className={`relative overflow-hidden rounded-t-lg p-2 border-3 border-b-0 ${borderColor}`}
								>
									{/* Gradient Background */}
									<div className={`absolute inset-0 bg-linear-to-br ${bgColor} opacity-60`} />

									{/* Border */}
									<div className={`absolute inset-0 ${borderColor} rounded-t-lg`} />

									{/* Top accent line */}
									<div
										className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent ${accentColor} to-transparent`}
									/>

									{/* Content */}
									<div className="relative flex flex-col items-center gap-1">
										<Icon className="w-6 h-6 text-stone-300" />
										<h3 className="text-base font-bold text-stone-100">{label}</h3>
									</div>
								</div>

								{/* Scores List */}
								<div
									className={`flex-1 bg-stone-900/50 rounded-b-lg border-3 border-t-0 ${borderColor} p-2`}
								>
									<div className="space-y-2">
										{DUMMY_LEADERBOARD_DATA[value].map((entry, index) => (
											<div key={entry.rank}>
												<div className="flex items-center gap-2 py-1">
													{/* Rank */}
													<span
														className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
															entry.rank === 1
																? "bg-amber-500 text-amber-950"
																: entry.rank === 2
																	? "bg-stone-400 text-stone-900"
																	: entry.rank === 3
																		? "bg-orange-600 text-orange-950"
																		: "bg-stone-700 text-stone-300"
														}`}
													>
														{entry.rank}
													</span>

													{/* Player Info */}
													<div className="flex-1 min-w-0">
														<p className="text-stone-200 text-xs font-medium truncate">
															{entry.playerName}
														</p>
														<p className="text-stone-400 text-[10px]">
															{entry.score.toLocaleString()}
														</p>
													</div>
												</div>

												{/* Separator (except after last item) */}
												{index < DUMMY_LEADERBOARD_DATA[value].length - 1 && (
													<div className="h-px bg-linear-to-r from-transparent via-stone-700 to-transparent" />
												)}
											</div>
										))}
									</div>
								</div>
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
