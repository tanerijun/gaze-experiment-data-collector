/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <workaround for dialog interaction> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <workaround for dialog interaction> */

import { useState } from "react"
import { calculateScore } from "@/lib/game-utils"
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
	playerName: string
	moves: number
	timeElapsed: number
	accuracy: number
}

interface LeaderboardDialogProps {
	isOpen: boolean
	onClose: () => void
}

// Dummy data for each difficulty (Top 5 only)
const DUMMY_LEADERBOARD_DATA: Record<Difficulty, LeaderboardEntry[]> = {
	goblin: [
		{
			playerName: "DragonSlayer",
			moves: 18,
			timeElapsed: 45,
			accuracy: 100,
		},
		{
			playerName: "KnightOfValor",
			moves: 18,
			timeElapsed: 52,
			accuracy: 100,
		},
		{ playerName: "MysticMage", moves: 20, timeElapsed: 48, accuracy: 100 },
		{ playerName: "ShadowHunter", moves: 19, timeElapsed: 48, accuracy: 95 },
		{ playerName: "StormBringer", moves: 20, timeElapsed: 45, accuracy: 90 },
	],
	troll: [
		{ playerName: "MasterMind", moves: 10, timeElapsed: 65, accuracy: 100 },
		{ playerName: "MemoryKing", moves: 11, timeElapsed: 72, accuracy: 98 },
		{ playerName: "QuickThink", moves: 12, timeElapsed: 58, accuracy: 96 },
		{ playerName: "BrainPower", moves: 12, timeElapsed: 75, accuracy: 92 },
		{ playerName: "SharpEye", moves: 13, timeElapsed: 68, accuracy: 90 },
	],
	orc: [
		{
			playerName: "LegendaryHero",
			moves: 6,
			timeElapsed: 120,
			accuracy: 100,
		},
		{ playerName: "ElitePlayer", moves: 7, timeElapsed: 125, accuracy: 98 },
		{ playerName: "ChampionX", moves: 8, timeElapsed: 115, accuracy: 96 },
		{ playerName: "ProGamer", moves: 8, timeElapsed: 145, accuracy: 92 },
		{
			playerName: "VictorySeeker",
			moves: 10,
			timeElapsed: 138,
			accuracy: 90,
		},
	],
	golem: [
		{ playerName: "GrandMaster", moves: 5, timeElapsed: 180, accuracy: 100 },
		{ playerName: "UltimatePro", moves: 6, timeElapsed: 192, accuracy: 98 },
		{
			playerName: "SupremeRuler",
			moves: 7,
			timeElapsed: 188,
			accuracy: 96,
		},
		{
			playerName: "MightyConqueror",
			moves: 8,
			timeElapsed: 210,
			accuracy: 92,
		},
		{ playerName: "PowerHouse", moves: 9, timeElapsed: 198, accuracy: 90 },
	],
	vampire: [
		{
			playerName: "ImmortalOne",
			moves: 3,
			timeElapsed: 240,
			accuracy: 100,
		},
		{
			playerName: "NightStalker",
			moves: 4,
			timeElapsed: 258,
			accuracy: 98,
		},
		{ playerName: "DarkLord", moves: 5, timeElapsed: 272, accuracy: 96 },
		{ playerName: "BloodPrince", moves: 6, timeElapsed: 285, accuracy: 92 },
		{
			playerName: "EternalHunter",
			moves: 7,
			timeElapsed: 298,
			accuracy: 90,
		},
	],
	demon: [
		{ playerName: "Apocalypse", moves: 3, timeElapsed: 320, accuracy: 100 },
		{ playerName: "Inferno", moves: 4, timeElapsed: 335, accuracy: 98 },
		{ playerName: "HellSpawn", moves: 5, timeElapsed: 358, accuracy: 96 },
		{
			playerName: "DeathBringer",
			moves: 6,
			timeElapsed: 378,
			accuracy: 92,
		},
		{ playerName: "ChaosReign", moves: 7, timeElapsed: 398, accuracy: 90 },
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
	const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("goblin")

	if (!isOpen) return null

	const currentLeaderboard = DUMMY_LEADERBOARD_DATA[selectedDifficulty]

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				className="relative bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 rounded-lg shadow-2xl border-4 border-stone-700 max-w-lg w-full animate-in zoom-in-95 duration-200"
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
						Leaderboard
					</h2>
					<p>Top 5</p>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-6 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all duration-200 text-stone-300 hover:text-stone-100 cursor-pointer"
						aria-label="Close leaderboard"
					>
						<CloseIcon className="size-6" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex justify-center gap-2 border-b border-stone-700 bg-stone-800/30 p-3">
					{DIFFICULTY_CONFIG.map((config) => {
						const isActive = selectedDifficulty === config.value
						return (
							<button
								key={config.value}
								onClick={() => setSelectedDifficulty(config.value)}
								className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
									isActive
										? `bg-amber-500/30 text-amber-300 border-2 border-amber-400`
										: `bg-stone-800/50 text-stone-400 hover:text-stone-300 hover:bg-stone-800 border-2 border-transparent`
								}`}
								type="button"
								title={config.label}
							>
								<config.Icon className="w-6 h-6" />
							</button>
						)
					})}
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="space-y-3">
						{currentLeaderboard.map((entry, index) => {
							const rank = index + 1
							const score = calculateScore(entry.moves, entry.accuracy, entry.timeElapsed)
							return (
								<div key={`${entry.playerName}-${index}`}>
									<div className="flex items-center gap-4">
										{/* Rank Badge */}
										<div className="shrink-0">
											<div
												className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
													rank === 1
														? "bg-amber-500 text-amber-950"
														: rank === 2
															? "bg-stone-400 text-stone-900"
															: rank === 3
																? "bg-orange-600 text-orange-950"
																: "bg-stone-700 text-stone-300"
												}`}
											>
												{rank}
											</div>
										</div>

										{/* Player Info and Stats */}
										<div className="flex-1 min-w-0">
											<p className="text-stone-100 font-semibold text-sm mb-2">
												{entry.playerName}
											</p>

											{/* Stats Grid */}
											<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
												<div className="flex justify-between">
													<span className="text-stone-400">Score:</span>
													<span className="text-stone-200 font-semibold">{score.toFixed(2)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-stone-400">Accuracy:</span>
													<span className="text-stone-200 font-semibold">{entry.accuracy}%</span>
												</div>
												<div className="flex justify-between">
													<span className="text-stone-400">Moves:</span>
													<span className="text-stone-200 font-semibold">{entry.moves}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-stone-400">Time:</span>
													<span className="text-stone-200 font-semibold">{entry.timeElapsed}s</span>
												</div>
											</div>
										</div>
									</div>

									{/* Separator (except after last item) */}
									{index < currentLeaderboard.length - 1 && (
										<div className="h-px bg-linear-to-r from-transparent via-stone-700 to-transparent mt-3" />
									)}
								</div>
							)
						})}
					</div>
				</div>

				{/* Bottom border accent */}
				<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />
			</div>
		</div>
	)
}
