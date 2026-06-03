import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import type { Donor, ClothingItem } from '../App'

interface DonorDonationsScreenProps {
  donor: Donor | null
  donations: ClothingItem[]
  onBack: () => void
  onNext: () => void
}

export function DonorDonationsScreen({ donor, donations, onBack, onNext }: DonorDonationsScreenProps) {
  if (!donor) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white shadow-sm border border-gray-200">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Doador não encontrado</p>
          <Button onClick={onBack} className="mt-4">Voltar</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-sm border border-gray-200">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
        </div>
        <h1 className="text-xl text-gray-800 mb-6">Sistema de Doação de Roupas para Instituições</h1>
        <h2 className="text-2xl text-gray-800">Doador Cadastrado</h2>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg text-gray-800">Cadastro realizado com sucesso!</h3>
          <p className="text-gray-600">
            O doador <strong>{donor.name}</strong> foi cadastrado no sistema.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Código do doador gerado:</p>
          <p className="text-2xl text-blue-600 font-mono">{donor.donorCode}</p>
          <p className="text-xs text-gray-500 mt-2">
            Este código será usado para identificar o doador no sistema
          </p>
        </div>

        <Button 
          onClick={onNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-12"
        >
          Voltar ao Menu Principal
        </Button>
      </CardContent>
    </Card>
  )
}