"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"

type Match = {
  id: string
  tournament_id: string | null
  team_a_id: string | null
  team_b_id: string | null
  team_a_score: number
  team_b_score: number
  status: string
  updated_at: string
  tournaments?: { name: string; logo_url: string | null }
  team_a?: { name: string; logo_url: string | null }
  team_b?: { name: string; logo_url: string | null }
}

interface UseMatchPollingOptions {
  pollingInterval?: number
  enableRealtime?: boolean
}

export function useMatchPolling(options: UseMatchPollingOptions = {}) {
  const { pollingInterval = 2000, enableRealtime = true } = options

  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchTimeRef = useRef<number>(0)
  const isPollingRef = useRef(false)

  const fetchCurrentMatch = useCallback(async (showLoading = false) => {
    // Prevent concurrent requests
    if (isPollingRef.current) return

    const now = Date.now()
    // Throttle requests to prevent excessive API calls
    if (now - lastFetchTimeRef.current < 1000) return

    isPollingRef.current = true
    lastFetchTimeRef.current = now

    try {
      if (showLoading) setIsLoading(true)
      setError(null)

      // First try to get live matches
      const { data: liveMatch, error: liveError } = await supabase
        .from("matches")
        .select(`
          *,
          tournaments (name, logo_url),
          team_a:teams!matches_team_a_id_fkey (name, logo_url),
          team_b:teams!matches_team_b_id_fkey (name, logo_url)
        `)
        .eq("status", "live")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (liveError && liveError.code !== "PGRST116") {
        throw liveError
      }

      if (liveMatch) {
        // Only update if the match data has actually changed
        setCurrentMatch((prevMatch) => {
          if (
            !prevMatch ||
            prevMatch.id !== liveMatch.id ||
            prevMatch.team_a_score !== liveMatch.team_a_score ||
            prevMatch.team_b_score !== liveMatch.team_b_score ||
            prevMatch.status !== liveMatch.status ||
            prevMatch.updated_at !== liveMatch.updated_at
          ) {
            setLastUpdated(new Date().toISOString())
            return liveMatch
          }
          return prevMatch
        })
        return
      }

      // If no live match, get the most recent match
      const { data: recentMatch, error: recentError } = await supabase
        .from("matches")
        .select(`
          *,
          tournaments (name, logo_url),
          team_a:teams!matches_team_a_id_fkey (name, logo_url),
          team_b:teams!matches_team_b_id_fkey (name, logo_url)
        `)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (recentError && recentError.code !== "PGRST116") {
        throw recentError
      }

      if (recentMatch) {
        setCurrentMatch((prevMatch) => {
          if (
            !prevMatch ||
            prevMatch.id !== recentMatch.id ||
            prevMatch.team_a_score !== recentMatch.team_a_score ||
            prevMatch.team_b_score !== recentMatch.team_b_score ||
            prevMatch.status !== recentMatch.status ||
            prevMatch.updated_at !== recentMatch.updated_at
          ) {
            setLastUpdated(new Date().toISOString())
            return recentMatch
          }
          return prevMatch
        })
      } else {
        setCurrentMatch(null)
      }
    } catch (err) {
      console.error("Erro ao buscar partida:", err)
      setError("Erro ao carregar dados da partida")
    } finally {
      setIsLoading(false)
      isPollingRef.current = false
    }
  }, [])

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return

    pollingIntervalRef.current = setInterval(() => {
      fetchCurrentMatch(false)
    }, pollingInterval)
  }, [fetchCurrentMatch, pollingInterval])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Setup real-time subscription
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          console.log("Real-time update received:", payload)
          // Fetch fresh data when real-time event is received
          fetchCurrentMatch(false)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealtime, fetchCurrentMatch])

  // Setup polling and initial fetch
  useEffect(() => {
    fetchCurrentMatch(true)
    startPolling()

    return () => {
      stopPolling()
    }
  }, [fetchCurrentMatch, startPolling, stopPolling])

  // Handle visibility change to optimize performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchCurrentMatch(false)
        startPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [fetchCurrentMatch, startPolling, stopPolling])

  return {
    currentMatch,
    isLoading,
    error,
    lastUpdated,
    refetch: () => fetchCurrentMatch(true),
    startPolling,
    stopPolling,
  }
}
