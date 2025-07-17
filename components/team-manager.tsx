"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type Team = {
  id: string
  name: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
  })

  useEffect(() => {
    fetchTeams()
  }, [])

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

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do time é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingTeam) {
        const { error } = await supabase
          .from("teams")
          .update({
            name: formData.name,
            logo_url: formData.logo_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTeam.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Time atualizado com sucesso",
        })
      } else {
        const { error } = await supabase.from("teams").insert({
          name: formData.name,
          logo_url: formData.logo_url || null,
        })

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Time criado com sucesso",
        })
      }

      setFormData({ name: "", logo_url: "" })
      setEditingTeam(null)
      setIsDialogOpen(false)
      fetchTeams()
    } catch (error) {
      console.error("Erro ao salvar time:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar time",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      logo_url: team.logo_url || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este time?")
    if (!confirmed) return

    try {
      const { error } = await supabase.from("teams").delete().eq("id", id)

      if (error) {
        console.error("Erro detalhado:", error)
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Time excluído com sucesso",
      })

      // Atualizar a lista imediatamente
      await fetchTeams()
    } catch (error) {
      console.error("Erro ao excluir time:", error)
      toast({
        title: "Erro",
        description: `Erro ao excluir time: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", logo_url: "" })
    setEditingTeam(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Times</h2>
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
              Novo Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Editar Time" : "Novo Time"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Time</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Flamengo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                  type="url"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTeam ? "Atualizar" : "Criar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{team.name}</h3>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(team)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(team.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {team.logo_url && (
                <div className="flex justify-center">
                  <img
                    src={team.logo_url || "/placeholder.svg"}
                    alt={team.name}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
