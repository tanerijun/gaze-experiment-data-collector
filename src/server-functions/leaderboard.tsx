import { env } from "cloudflare:workers"
import { createServerFn } from "@tanstack/react-start"
import { difficulties } from "@/lib/game-data"
import { getTop5Leaderboard } from "@/lib/game-utils"
import type { Difficulty } from "@/lib/types"

interface LeaderboardEntry {
	playerName: string
	moves: number
	timeElapsed: number
	accuracy: number
}

export const getScores = createServerFn({ method: "GET" })
	.inputValidator((data: { difficulty: Difficulty }) => {
		if (!difficulties.includes(data.difficulty)) {
			throw new Error("invalid difficulty")
		}
		return data
	})
	.handler(async ({ data }): Promise<LeaderboardEntry[]> => {
		try {
			const kvData = await env.the_deep_vault_leaderboard.get(data.difficulty)

			if (!kvData) {
				console.warn(`No leaderboard data found for difficulty: ${data.difficulty}`)
				return []
			}

			// Parse the JSON string from KV
			const parsedData: LeaderboardEntry[] = JSON.parse(kvData)

			// Ensure it's an array and validate structure
			if (!Array.isArray(parsedData)) {
				console.warn(`Invalid leaderboard data format for difficulty: ${data.difficulty}`)
				return []
			}

			return parsedData
		} catch (error) {
			console.error(`Error fetching leaderboard for ${data.difficulty}:`, error)
			throw new Error(`Failed to fetch leaderboard data for ${data.difficulty}`)
		}
	})

export const updateLeaderboard = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			difficulty: Difficulty
			playerName: string
			moves: number
			accuracy: number
			timeElapsed: number
		}) => {
			if (!difficulties.includes(data.difficulty)) {
				throw new Error("invalid difficulty")
			}
			if (!data.playerName || data.playerName.trim().length === 0) {
				throw new Error("player name is required")
			}
			if (data.moves < 1 || !Number.isInteger(data.moves)) {
				throw new Error("invalid moves")
			}
			if (data.accuracy < 0 || data.accuracy > 100 || !Number.isInteger(data.accuracy)) {
				throw new Error("invalid accuracy")
			}
			if (data.timeElapsed < 1 || !Number.isInteger(data.timeElapsed)) {
				throw new Error("invalid time elapsed")
			}
			return data
		},
	)
	.handler(async ({ data }): Promise<LeaderboardEntry[]> => {
		try {
			// Get current leaderboard
			const kvData = await env.the_deep_vault_leaderboard.get(data.difficulty)
			const currentEntries: LeaderboardEntry[] = kvData ? JSON.parse(kvData) : []

			// Create new entry
			const newEntry: LeaderboardEntry = {
				playerName: data.playerName.trim(),
				moves: data.moves,
				accuracy: data.accuracy,
				timeElapsed: data.timeElapsed,
			}

			// Get top 5 with new entry included
			const top5 = getTop5Leaderboard(currentEntries, newEntry)

			// Save back to KV
			await env.the_deep_vault_leaderboard.put(data.difficulty, JSON.stringify(top5))

			return top5
		} catch (error) {
			console.error(`Error updating leaderboard for ${data.difficulty}:`, error)
			throw new Error(`Failed to update leaderboard for ${data.difficulty}`)
		}
	})
