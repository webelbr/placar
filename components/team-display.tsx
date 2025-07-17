"use client"

import { memo } from "react"
import { ScoreDisplay } from "./score-display"

interface TeamDisplayProps {
  name: string
  logoUrl: string | null
  score: number
  isScoreAnimating?: boolean
  side: "left" | "right"
}

export const TeamDisplay = memo(function TeamDisplay({
  name,
  logoUrl,
  score,
  isScoreAnimating = false,
  side,
}: TeamDisplayProps) {
  const overlayStyles = {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontWeight: 700,
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
  }

  const flexDirection = side === "left" ? "flex-row" : "flex-row-reverse"

  return (
    <div className={`flex items-center gap-6 ${flexDirection}`}>
      {logoUrl && (
        <img
          src={logoUrl || "/placeholder.svg"}
          alt={name}
          className="w-20 h-20 object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      )}
      <div className="text-center">
        <h2 className="text-white text-2xl mb-2" style={overlayStyles}>
          {name}
        </h2>
        <ScoreDisplay score={score} isAnimating={isScoreAnimating} />
      </div>
    </div>
  )
})
