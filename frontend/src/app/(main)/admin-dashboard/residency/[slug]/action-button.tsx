"use client"

import { Play, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ActionButtonsProps {
	onResidencyMatch: () => Promise<void>
	onInterviewMatch: () => Promise<void>
}

export function ActionButtons({
	onResidencyMatch,
	onInterviewMatch
}: ActionButtonsProps) {
	const [isInterviewLoading, setIsInterviewLoading] = useState(false)
	const [isResidencyLoading, setIsResidencyLoading] = useState(false)

	const router = useRouter()

	const handleInterviewMatch = async () => {
		setIsInterviewLoading(true)
		try {
			await onInterviewMatch()
		} catch (error) {
			console.error("Interview match failed:", error)
		} finally {
			setIsInterviewLoading(false)
			router.refresh()
		}
	}

	const handleResidencyMatch = async () => {
		setIsResidencyLoading(true)
		try {
			await onResidencyMatch()
		} catch (error) {
			console.error("Residency match failed:", error)
		} finally {
			setIsResidencyLoading(false)
			router.refresh()
		}
	}

	return (
		<div className="flex gap-3">
			<Button
				variant="default"
				onClick={handleInterviewMatch}
				disabled={isInterviewLoading || isResidencyLoading}
			>
				{isInterviewLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Play className="mr-2 h-4 w-4" />
				)}
				Run Interview Assignment
			</Button>
			<Button
				variant="secondary"
				onClick={handleResidencyMatch}
				disabled={isResidencyLoading || isInterviewLoading}
			>
				{isResidencyLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Zap className="mr-2 h-4 w-4" />
				)}
				Run Final Matching
			</Button>
		</div>
	)
}
