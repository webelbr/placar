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

type Tournament = {
  id: string
  name: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export function TournamentManager() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
  })

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar torneios:", error)
      return
    }

    setTournaments(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do torneio é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingTournament) {
        const { error } = await supabase
          .from("tournaments")
          .update({
            name: formData.name,
            logo_url: formData.logo_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTournament.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Torneio atualizado com sucesso",
        })
      } else {
        const { error } = await supabase.from("tournaments").insert({
          name: formData.name,
          logo_url: formData.logo_url || null,
        })

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Torneio criado com sucesso",
        })
      }

      setFormData({ name: "", logo_url: "" })
      setEditingTournament(null)
      setIsDialogOpen(false)
      fetchTournaments()
    } catch (error) {
      console.error("Erro ao salvar torneio:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar torneio",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament)
    setFormData({
      name: tournament.name,
      logo_url: tournament.logo_url || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este torneio?")
    if (!confirmed) return

    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id)

      if (error) {
        console.error("Erro detalhado:", error)
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Torneio excluído com sucesso",
      })

      // Atualizar a lista imediatamente
      await fetchTournaments()
    } catch (error) {
      console.error("Erro ao excluir torneio:", error)
      toast({
        title: "Erro",
        description: `Erro ao excluir torneio: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", logo_url: "" })
    setEditingTournament(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Torneios</h2>
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
              Novo Torneio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTournament ? "Editar Torneio" : "Novo Torneio"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Torneio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Campeonato Brasileiro"
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
                  {editingTournament ? "Atualizar" : "Criar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tournaments.map((tournament) => (
          <Card key={tournament.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {tournament.logo_url && (
                  <img
                    src={tournament.logo_url || "/placeholder.svg"}
                    alt={tournament.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div>
                  <h3 className="font-semibold">{tournament.name}</h3>
                  <p className="text-sm text-gray-500">
                    Criado em {new Date(tournament.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(tournament)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(tournament.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
