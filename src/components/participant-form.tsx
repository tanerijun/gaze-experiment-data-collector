import { useId, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import { useRecordingStore } from "@/lib/recording-store"
import type { ParticipantInfo } from "@/lib/types"

interface ParticipantFormProps {
	onComplete?: () => void
	onCancel?: () => void
}

export default function ParticipantForm({ onComplete, onCancel }: ParticipantFormProps) {
	const { participant, setParticipant } = useRecordingStore()
	const { t } = useTranslation()
	const [errors, setErrors] = useState<Record<string, string>>({})
	// Local state to prevent updates to global store until submission
	const [formData, setFormData] = useState<ParticipantInfo>({
		name: participant?.name || "",
		age: participant?.age || 0,
		gender: participant?.gender || "",
		wearingGlasses: participant?.wearingGlasses || false,
		wearingContacts: participant?.wearingContacts || false,
	})
	const nameId = useId()
	const ageId = useId()
	const genderId = useId()

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.name.trim()) {
			newErrors.name = t.participantForm.nameError
		}

		if (!formData.age || formData.age <= 0) {
			newErrors.age = t.participantForm.ageError
		}

		if (!formData.gender) {
			newErrors.gender = t.participantForm.genderError
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (validate()) {
			setParticipant(formData)
			onComplete?.()
		}
	}

	const updateFormData = (updates: Partial<ParticipantInfo>) => {
		setFormData((prev) => ({
			...prev,
			...updates,
		}))
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Name */}
			<div>
				<label htmlFor={nameId} className="block font-semibold text-amber-100 mb-2">
					{t.participantForm.nameLabel} <span className="text-red-400">*</span>
				</label>
				<input
					id={nameId}
					type="text"
					value={formData.name}
					onChange={(e) => updateFormData({ name: e.target.value })}
					min={0}
					max={100}
					className={`w-full px-4 py-2.5 bg-stone-950/50 border-2 ${
						errors.name ? "border-red-500" : "border-stone-700"
					} rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors`}
					placeholder={t.participantForm.namePlaceholder}
				/>
				{errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
			</div>

			{/* Age */}
			<div>
				<label htmlFor={ageId} className="block font-semibold text-amber-100 mb-2">
					{t.participantForm.ageLabel} <span className="text-red-400">*</span>
				</label>
				<input
					id={ageId}
					type="number"
					value={formData.age || ""}
					onChange={(e) => updateFormData({ age: Number(e.target.value) || 0 })}
					className={`w-full px-4 py-2.5 bg-stone-950/50 border-2 ${
						errors.age ? "border-red-500" : "border-stone-700"
					} rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors`}
					placeholder={t.participantForm.agePlaceholder}
					min="1"
					max="150"
				/>
				{errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
			</div>

			{/* Gender */}
			<div>
				<label htmlFor={genderId} className="block font-semibold text-amber-100 mb-2">
					{t.participantForm.genderLabel} <span className="text-red-400">*</span>
				</label>
				<select
					id={genderId}
					value={formData.gender}
					onChange={(e) => updateFormData({ gender: e.target.value })}
					className={`w-full px-4 py-2.5 bg-stone-950/50 border-2 ${
						errors.gender ? "border-red-500" : "border-stone-700"
					} rounded-lg text-stone-100 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer`}
				>
					<option value="">{t.participantForm.genderPlaceholder}</option>
					<option value="male">{t.participantForm.genderOptions.male}</option>
					<option value="female">{t.participantForm.genderOptions.female}</option>
					<option value="prefer-not-to-say">
						{t.participantForm.genderOptions.preferNotToSay}
					</option>
				</select>
				{errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
			</div>

			{/* Vision Correction */}
			<div className="space-y-3 bg-stone-950/30 border border-stone-700 rounded-lg p-4">
				<p className="font-semibold text-amber-100 mb-2">
					{t.participantForm.visionCorrectionLabel}
				</p>

				<label className="flex items-center space-x-3 cursor-pointer group">
					<input
						type="checkbox"
						checked={formData.wearingGlasses}
						onChange={(e) => updateFormData({ wearingGlasses: e.target.checked })}
						className="w-5 h-5 rounded border-2 border-stone-600 bg-stone-950/50 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 cursor-pointer"
					/>
					<span className="text-stone-200 group-hover:text-amber-100 transition-colors">
						{t.participantForm.wearingGlasses}
					</span>
				</label>

				<label className="flex items-center space-x-3 cursor-pointer group">
					<input
						type="checkbox"
						checked={formData.wearingContacts}
						onChange={(e) => updateFormData({ wearingContacts: e.target.checked })}
						className="w-5 h-5 rounded border-2 border-stone-600 bg-stone-950/50 text-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-stone-900 cursor-pointer"
					/>
					<span className="text-stone-200 group-hover:text-amber-100 transition-colors">
						{t.participantForm.wearingContacts}
					</span>
				</label>
			</div>

			{/* Footer Buttons */}
			<div className="flex gap-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:ring-offset-stone-900 active:scale-95"
				>
					{t.participantForm.cancelButton}
				</button>
				<button
					type="submit"
					className="flex-1 group relative overflow-hidden px-6 py-3 bg-linear-to-br from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-bold rounded-lg shadow-lg border-2 border-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
					<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
					<span className="relative z-10">{t.participantForm.continueButton}</span>
				</button>
			</div>
		</form>
	)
}
