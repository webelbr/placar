"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Minus, Eye, Wifi } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

type Match = {
  id: string
  tournament_id: string | null
  team_a_id: string | null
  team_b_id: string | null
  team_a_score: number
  team_b_score: number
  status: string
  match_date: string
  tournaments?: { name: string; logo_url: string | null }
  team_a?: { name: string; logo_url: string | null }
  team_b?: { name: string; logo_url: string | null }
}

type Tournament = {
  id: string
  name: string
  logo_url: string | null
}

type Team = {
  id: string
  name: string
  logo_url: string | null
}

export function MatchManager() {
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [isUpdatingScore, setIsUpdatingScore] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tournament_id: "",
    team_a_id: "",
    team_b_id: "",
    status: "scheduled",
  })

  useEffect(() => {
    fetchMatches()
    fetchTournaments()
    fetchTeams()
  }, [])

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        tournaments (name, logo_url),
        team_a:teams!matches_team_a_id_fkey (name, logo_url),
        team_b:teams!matches_team_b_id_fkey (name, logo_url)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar partidas:", error)
      return
    }

    setMatches(data || [])
  }

  const fetchTournaments = async () => {
    const { data, error } = await supabase.from("tournaments").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Erro ao buscar torneios:", error)
      return
    }

    setTournaments(data || [])
  }

  const fetchTeams = async () => {
    const { data, error } = await supabase.from("teams").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Erro ao buscar times:", error)
      return
    }

    setTeams(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tournament_id || !formData.team_a_id || !formData.team_b_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (formData.team_a_id === formData.team_b_id) {
      toast({
        title: "Erro",
        description: "Os times devem ser diferentes",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingMatch) {
        const { error } = await supabase
          .from("matches")
          .update({
            tournament_id: formData.tournament_id,
            team_a_id: formData.team_a_id,
            team_b_id: formData.team_b_id,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMatch.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Partida atualizada com sucesso",
        })
      } else {
        const { error } = await supabase.from("matches").insert({
          tournament_id: formData.tournament_id,
          team_a_id: formData.team_a_id,
          team_b_id: formData.team_b_id,
          status: formData.status,
          team_a_score: 0,
          team_b_score: 0,
        })

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Partida criada com sucesso",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      fetchMatches()
    } catch (error) {
      console.error("Erro ao salvar partida:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar partida",
        variant: "destructive",
      })
    }
  }

  const updateScore = async (matchId: string, team: "a" | "b", increment: boolean) => {
    const match = matches.find((m) => m.id === matchId)
    if (!match) return

    setIsUpdatingScore(`${matchId}-${team}`)

    const currentScore = team === "a" ? match.team_a_score : match.team_b_score
    const newScore = increment ? currentScore + 1 : Math.max(0, currentScore - 1)

    const updateData = team === "a" ? { team_a_score: newScore } : { team_b_score: newScore }

    try {
      const { error } = await supabase
        .from("matches")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)

      if (error) throw error

      // Optimistic update
      setMatches((prevMatches) =>
        prevMatches.map((m) => (m.id === matchId ? { ...m, ...updateData, updated_at: new Date().toISOString() } : m)),
      )

      toast({
        title: "Placar Atualizado",
        description: `${team === "a" ? match.team_a?.name : match.team_b?.name}: ${newScore}`,
      })
    } catch (error) {
      console.error("Erro ao atualizar placar:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar placar",
        variant: "destructive",
      })
      // Revert optimistic update on error
      fetchMatches()
    } finally {
      setIsUpdatingScore(null)
    }
  }

  const handleEdit = (match: Match) => {
    setEditingMatch(match)
    setFormData({
      tournament_id: match.tournament_id || "",
      team_a_id: match.team_a_id || "",
      team_b_id: match.team_b_id || "",
      status: match.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta partida?")
    if (!confirmed) return

    try {
      const { error } = await supabase.from("matches").delete().eq("id", id)

      if (error) {
        console.error("Erro detalhado:", error)
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Partida excluída com sucesso",
      })

      // Atualizar a lista imediatamente
      await fetchMatches()
    } catch (error) {
      console.error("Erro ao excluir partida:", error)
      toast({
        title: "Erro",
        description: `Erro ao excluir partida: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      tournament_id: "",
      team_a_id: "",
      team_b_id: "",
      status: "scheduled",
    })
    setEditingMatch(null)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: "Agendada", variant: "secondary" as const },
      live: { label: "Ao Vivo", variant: "destructive" as const },
      finished: { label: "Finalizada", variant: "default" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.scheduled
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Partidas</h2>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Wifi className="h-4 w-4" />
            <span>Atualizações em tempo real ativas</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/overlay" target="_blank">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Overlay
            </Button>
          </Link>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Partida
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMatch ? "Editar Partida" : "Nova Partida"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tournament">Torneio</Label>
                  <Select
                    value={formData.tournament_id}
                    onValueChange={(value) => setFormData({ ...formData, tournament_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um torneio" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournaments.map((tournament) => (
                        <SelectItem key={tournament.id} value={tournament.id}>
                          {tournament.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="team_a">Time A</Label>
                  <Select
                    value={formData.team_a_id}
                    onValueChange={(value) => setFormData({ ...formData, team_a_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time A" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="team_b">Time B</Label>
                  <Select
                    value={formData.team_b_id}
                    onValueChange={(value) => setFormData({ ...formData, team_b_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time B" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="finished">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingMatch ? "Atualizar" : "Criar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{match.tournaments?.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(match.status)}
                  <Button variant="outline" size="sm" onClick={() => handleEdit(match)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(match.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {match.team_a?.logo_url && (
                    <img
                      src={match.team_a.logo_url || "/placeholder.svg"}
                      alt={match.team_a.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                  <div className="text-center">
                    <p className="font-semibold">{match.team_a?.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScore(match.id, "a", false)}
                        disabled={match.team_a_score === 0 || isUpdatingScore === `${match.id}-a`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span
                        className={`text-2xl font-bold w-8 text-center transition-all duration-300 ${
                          isUpdatingScore === `${match.id}-a` ? "scale-110 text-blue-600" : ""
                        }`}
                      >
                        {match.team_a_score}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScore(match.id, "a", true)}
                        disabled={isUpdatingScore === `${match.id}-a`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xl font-bold text-gray-500">VS</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-semibold">{match.team_b?.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScore(match.id, "b", false)}
                        disabled={match.team_b_score === 0 || isUpdatingScore === `${match.id}-b`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span
                        className={`text-2xl font-bold w-8 text-center transition-all duration-300 ${
                          isUpdatingScore === `${match.id}-b` ? "scale-110 text-blue-600" : ""
                        }`}
                      >
                        {match.team_b_score}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScore(match.id, "b", true)}
                        disabled={isUpdatingScore === `${match.id}-b`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {match.team_b?.logo_url && (
                    <img
                      src={match.team_b.logo_url || "/placeholder.svg"}
                      alt={match.team_b.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
