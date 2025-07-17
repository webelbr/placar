"use client"

import { memo } from "react"

interface ScoreDisplayProps {
  score: number
  isAnimating?: boolean
}

export const ScoreDisplay = memo(function ScoreDisplay({ score, isAnimating = false }: ScoreDisplayProps) {
  const overlayStyles = {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontWeight: 700,
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
  }

  return (
    <div className="bg-white/20 rounded-lg px-4 py-2 relative overflow-hidden">
      <span
        className={`text-white text-4xl transition-all duration-300 ${
          isAnimating ? "scale-110 text-yellow-300" : "scale-100"
        }`}
        style={overlayStyles}
      >
        {score}
      </span>
      {isAnimating && <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-pulse" />}
    </div>
  )
})
