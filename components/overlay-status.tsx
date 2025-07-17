"use client"

import { memo } from "react"

interface OverlayStatusProps {
  status: string
  lastUpdated: string | null
  isConnected: boolean
}

export const OverlayStatus = memo(function OverlayStatus({ status, lastUpdated, isConnected }: OverlayStatusProps) {
  const overlayStyles = {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontWeight: 700,
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
  }

  return (
    <div className="text-center">
      <div className="text-white text-3xl mb-2" style={overlayStyles}>
        VS
      </div>

      {status === "live" && (
        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm animate-pulse mb-2" style={overlayStyles}>
          AO VIVO
        </div>
      )}

      {/* Connection status indicator (only visible in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-white/60 text-xs">{isConnected ? "Conectado" : "Desconectado"}</span>
          {lastUpdated && (
            <span className="text-white/40 text-xs ml-2">{new Date(lastUpdated).toLocaleTimeString("pt-BR")}</span>
          )}
        </div>
      )}
    </div>
  )
})
