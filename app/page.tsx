import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Settings, Monitor } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Painel Esportivo</h1>
          <p className="text-xl text-gray-600">Sistema de gerenciamento de partidas com overlay em tempo real</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Painel Administrativo
              </CardTitle>
              <CardDescription>Gerencie torneios, times e partidas. Atualize placares em tempo real.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">Acessar Painel Admin</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-6 w-6 text-green-600" />
                Overlay para OBS
              </CardTitle>
              <CardDescription>Visualize o overlay de placar para integração com OBS Studio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/overlay">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Overlay
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Como Usar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">1. Configure</h3>
                  <p className="text-sm text-blue-700">Adicione torneios e times no painel administrativo</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">2. Crie Partidas</h3>
                  <p className="text-sm text-green-700">Configure partidas e atualize placares em tempo real</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">3. Use no OBS</h3>
                  <p className="text-sm text-purple-700">Adicione o overlay como fonte de navegador no OBS Studio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
