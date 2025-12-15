import type { Card as CardType } from "@/lib/types"

export function Card({
	card,
	onClick,
	disabled,
}: {
	card: CardType
	onClick: (card: CardType) => void
	disabled: boolean
}) {
	const handleClick = () => {
		if (!disabled && !card.isFlipped && !card.isMatched) {
			onClick(card)
		}
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: <special card>
		// biome-ignore lint/a11y/useKeyWithClickEvents: <special card>
		<div
			data-card-id={card.id}
			className={`relative w-full h-full cursor-pointer transition-transform duration-200 ${
				!disabled && !card.isFlipped && !card.isMatched ? "hover:scale-[1.03]" : ""
			}`}
			onClick={handleClick}
			style={{ perspective: "1000px", minWidth: "40px", minHeight: "40px" }}
		>
			<div
				className={`relative w-full h-full transition-transform duration-600 ease-in-out ${
					card.isFlipped || card.isMatched ? "transform-[rotateY(180deg)]" : ""
				}`}
				style={{ transformStyle: "preserve-3d", containerType: "size" }}
			>
				{/* Card Back */}
				<div
					className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden"
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(0deg)",
						backgroundColor: "#383838",
						backgroundImage: "url(/transparent-textures/stucco.png)",
						backgroundSize: "auto",
						backgroundRepeat: "repeat",
						border: "3px solid var(--color-stone-600)",
					}}
				>
					<div
						className="select-none absolute inset-0 flex items-center justify-center"
						style={{
							color: "#a8885c", // desaturated brass/gold
							textShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
							fontSize: "40cqh",
							lineHeight: "1",
						}}
					>
						?
					</div>
				</div>

				{/* Card Front */}
				<div
					className={`absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center ${
						card.isMatched ? "ring-2 ring-amber-500" : ""
					}`}
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
					}}
				>
					<img
						src="/imgs/card_bg.png"
						alt="Card background"
						className="absolute inset-0 w-full h-full object-cover"
						draggable={false}
					/>

					{/* Item image on top with drop shadow */}
					<img
						src={card.imagePath}
						alt="Card item"
						className="relative w-full h-full object-contain"
						style={{ padding: "clamp(4px, 5%, 12px)" }}
						draggable={false}
					/>
				</div>
			</div>
		</div>
	)
}
