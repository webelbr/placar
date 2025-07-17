"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TournamentManager } from "@/components/tournament-manager"
import { TeamManager } from "@/components/team-manager"
import { MatchManager } from "@/components/match-manager"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matches">Partidas</TabsTrigger>
            <TabsTrigger value="teams">Times</TabsTrigger>
            <TabsTrigger value="tournaments">Torneios</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Partidas</CardTitle>
                <CardDescription>Crie e gerencie partidas, atualize placares em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <MatchManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Times</CardTitle>
                <CardDescription>Adicione e edite times, configure logos</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Torneios</CardTitle>
                <CardDescription>Crie e configure torneios, adicione logos</CardDescription>
              </CardHeader>
              <CardContent>
                <TournamentManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
