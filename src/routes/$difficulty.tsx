import { createFileRoute } from "@tanstack/react-router"
import { type Difficulty, difficulties } from "@/lib/game-utils"

export const Route = createFileRoute("/$difficulty")({
	component: RouteComponent,
	params: {
		parse: ({ difficulty }) => {
			// @ts-expect-error -> we're validating level
			if (!difficulties.includes(difficulty)) {
				throw new Error("Invalid difficulty")
			}
			return { difficulty: difficulty as Difficulty }
		},
	},
})

function RouteComponent() {
	const { difficulty } = Route.useParams()

	return <div>Hello {difficulty}</div>
}
