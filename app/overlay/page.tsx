"use client"

import { useState, useEffect } from "react"
import { useMatchPolling } from "@/hooks/use-match-polling"

export default function OverlayPage() {
  const { currentMatch, isLoading, error, lastUpdated } = useMatchPolling({
    pollingInterval: 2000,
    enableRealtime: true,
  })

  const [scoreAnimations, setScoreAnimations] = useState({
    teamA: false,
    teamB: false,
  })

  const [prevScores, setPrevScores] = useState({
    teamA: 0,
    teamB: 0,
  })

  // Handle score change animations
  useEffect(() => {
    if (!currentMatch) return

    const newScores = {
      teamA: currentMatch.team_a_score,
      teamB: currentMatch.team_b_score,
    }

    if (newScores.teamA !== prevScores.teamA) {
      setScoreAnimations((prev) => ({ ...prev, teamA: true }))
      setTimeout(() => {
        setScoreAnimations((prev) => ({ ...prev, teamA: false }))
      }, 1000)
    }

    if (newScores.teamB !== prevScores.teamB) {
      setScoreAnimations((prev) => ({ ...prev, teamB: true }))
      setTimeout(() => {
        setScoreAnimations((prev) => ({ ...prev, teamB: false }))
      }, 1000)
    }

    setPrevScores(newScores)
  }, [currentMatch])

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-red-400 text-2xl font-bold">Erro: {error}</div>
      </div>
    )
  }

  if (isLoading && !currentMatch) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Carregando partida...</div>
      </div>
    )
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Nenhuma partida encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex items-start justify-center pt-6">
      <div className="relative">
        {/* Main Scoreboard Container */}
        <div className="overlay-container">
          <div className="flex items-center justify-center gap-3">
            {/* Team A Section */}
            <div className="team-section">
              <div className="team-logo-container">
                {currentMatch.team_a?.logo_url && (
                  <img
                    src={currentMatch.team_a.logo_url || "/placeholder.svg"}
                    alt={currentMatch.team_a.name}
                    className="team-logo animate-pulse-scale"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
              </div>
              <div className="team-info">
                <h2 className="team-name">{currentMatch.team_a?.name}</h2>
                <div className="score-container">
                  <span className={`score ${scoreAnimations.teamA ? "score-animate" : ""}`}>
                    {currentMatch.team_a_score}
                  </span>
                </div>
              </div>
            </div>

            {/* Center Section - Tournament Logo and VS */}
            <div className="center-section">
              {/* Tournament Logo */}
              {currentMatch.tournaments?.logo_url && (
                <div className="tournament-logo-container">
                  <img
                    src={currentMatch.tournaments.logo_url || "/placeholder.svg"}
                    alt={currentMatch.tournaments.name}
                    className="tournament-logo"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}

              {/* VS Text */}
              <div className="vs-text">VS</div>

              {/* Live Status */}
              {currentMatch.status === "live" && (
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  <span>AO VIVO</span>
                </div>
              )}

              {/* Development status */}
              {process.env.NODE_ENV === "development" && (
                <div className="dev-status">
                  <div className={`status-dot ${!error ? "online" : "offline"}`}></div>
                  {lastUpdated && (
                    <span className="last-update">{new Date(lastUpdated).toLocaleTimeString("pt-BR")}</span>
                  )}
                </div>
              )}
            </div>

            {/* Team B Section */}
            <div className="team-section">
              <div className="team-info">
                <h2 className="team-name">{currentMatch.team_b?.name}</h2>
                <div className="score-container">
                  <span className={`score ${scoreAnimations.teamB ? "score-animate" : ""}`}>
                    {currentMatch.team_b_score}
                  </span>
                </div>
              </div>
              <div className="team-logo-container">
                {currentMatch.team_b?.logo_url && (
                  <img
                    src={currentMatch.team_b.logo_url || "/placeholder.svg"}
                    alt={currentMatch.team_b.name}
                    className="team-logo animate-pulse-scale"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay-container {
          background: linear-gradient(135deg, #002c69 0%, #003d7a 50%, #002c69 100%);
          border: 2px solid #ddaa1b;
          border-radius: 16px;
          padding: 16px 24px;
          box-shadow: 
            0 8px 32px rgba(0, 44, 105, 0.4),
            0 0 0 1px rgba(221, 170, 27, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .overlay-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(221, 170, 27, 0.05) 50%, transparent 70%);
          pointer-events: none;
        }

        .team-section {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .team-logo-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid #ddaa1b;
          border-radius: 50%;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .team-logo {
          width: 64px;
          height: 64px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
        }

        .animate-pulse-scale {
          animation: pulseScale 3s ease-in-out infinite;
        }

        @keyframes pulseScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .team-info {
          text-align: center;
          min-width: 120px;
        }

        .team-name {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.8),
            0 0 8px rgba(221, 170, 27, 0.3);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .score-container {
          background: linear-gradient(135deg, rgba(221, 170, 27, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%);
          border: 2px solid #ffffff;
          border-radius: 12px;
          padding: 8px 16px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .score-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .score {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 32px;
          font-weight: 900;
          color: #002c69;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .score-animate {
          transform: scale(1.2);
          color: #ffffff;
          text-shadow: 
            0 0 16px #ddaa1b,
            0 2px 4px rgba(0, 0, 0, 0.8);
        }

        .center-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          position: relative;
        }

        .tournament-logo-container {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(221, 170, 27, 0.1) 100%);
          border: 3px solid #ddaa1b;
          border-radius: 50%;
          box-shadow: 
            0 6px 24px rgba(0, 0, 0, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(221, 170, 27, 0.5);
          position: relative;
          overflow: hidden;
        }

        .tournament-logo-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(221, 170, 27, 0.1), transparent);
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tournament-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          filter: drop-shadow(0 3px 12px rgba(0, 0, 0, 0.6));
          position: relative;
          z-index: 1;
        }

        .vs-text {
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 20px;
          font-weight: 900;
          color: #ddaa1b;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.8),
            0 0 12px rgba(221, 170, 27, 0.6);
          letter-spacing: 2px;
          margin: 4px 0;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          box-shadow: 
            0 2px 8px rgba(255, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          animation: blink 1s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes blink {
          0% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        .dev-status {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #00ff00;
          box-shadow: 0 0 6px #00ff00;
        }

        .status-dot.offline {
          background: #ff0000;
          box-shadow: 0 0 6px #ff0000;
        }

        .last-update {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Roboto', monospace;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .overlay-container {
            padding: 12px 16px;
          }
          
          .team-section {
            min-width: 150px;
            gap: 8px;
          }
          
          .team-logo-container {
            width: 60px;
            height: 60px;
          }
          
          .team-logo {
            width: 48px;
            height: 48px;
          }
          
          .tournament-logo-container {
            width: 80px;
            height: 80px;
          }
          
          .tournament-logo {
            width: 64px;
            height: 64px;
          }
          
          .team-name {
            font-size: 16px;
          }
          
          .score {
            font-size: 28px;
          }
          
          .vs-text {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
