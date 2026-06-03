import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, Search, User, Package, MapPin } from 'lucide-react'
import type { Beneficiary, ClothingItem } from '../App'

interface BeneficiarySearchScreenProps {
  beneficiaries: Beneficiary[]
  clothingItems: ClothingItem[]
  onBack: () => void
  onViewProfile: (beneficiary: Beneficiary) => void
}

export function BeneficiarySearchScreen({ beneficiaries, clothingItems, onBack, onViewProfile }: BeneficiarySearchScreenProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar beneficiários baseado no termo de busca
  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.beneficiaryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.cpf.includes(searchTerm.replace(/\D/g, '')) ||
    beneficiary.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular total de peças recebidas por beneficiário
  const getBeneficiaryStats = (beneficiaryId: string) => {
    const receivedItems = clothingItems.filter(item => 
      item.beneficiaryId === beneficiaryId && item.distributedAt
    )
    
    const totalItems = receivedItems.length

    const lastReceived = receivedItems.length > 0 
      ? receivedItems
          .sort((a, b) => new Date(b.distributedAt!).getTime() - new Date(a.distributedAt!).getTime())[0]?.distributedAt
      : null

    return {
      totalReceived: totalItems,
      lastReceived: lastReceived ? new Date(lastReceived).toLocaleDateString('pt-BR') : 'Nunca'
    }
  }

  // Função para formatar endereço completo
  const getFullAddress = (beneficiary: Beneficiary) => {
    const parts = [
      beneficiary.street,
      beneficiary.number,
      beneficiary.neighborhood,
      beneficiary.city,
      beneficiary.state
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-sm border border-gray-200">
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
        <h1 className="text-xl text-gray-800 mb-2">Sistema de Doação de Roupas para Instituições</h1>
        <h2 className="text-2xl text-gray-800">Buscar Beneficiários</h2>
        <p className="text-sm text-gray-600 mt-2">Encontre beneficiários cadastrados no sistema</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-gray-800">Buscar por nome, código, email, CPF ou localização</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border-gray-300 rounded-md pl-10"
              placeholder="Digite nome, código BEN001, email, CPF, cidade ou bairro..."
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Total de beneficiários:</strong> {beneficiaries.length}
            {searchTerm && (
              <span> | <strong>Encontrados:</strong> {filteredBeneficiaries.length}</span>
            )}
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Nenhum beneficiário encontrado com esse termo de busca.'
                  : 'Nenhum beneficiário cadastrado no sistema.'
                }
              </p>
            </div>
          ) : (
            filteredBeneficiaries.map((beneficiary) => {
              const stats = getBeneficiaryStats(beneficiary.id)
              return (
                <div
                  key={beneficiary.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg text-gray-800">{beneficiary.name}</h3>
                          <p className="text-sm text-purple-600 font-mono">{beneficiary.beneficiaryCode}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                        <div>
                          <p><strong>Email:</strong> {beneficiary.email}</p>
                          <p><strong>Telefone:</strong> {beneficiary.phone}</p>
                          <p><strong>CPF:</strong> {beneficiary.cpf}</p>
                        </div>
                        <div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-600">{getFullAddress(beneficiary)}</p>
                              <p className="text-xs text-gray-500">CEP: {beneficiary.zipCode}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="text-green-800">
                            <strong>{stats.totalReceived}</strong> peças recebidas
                          </span>
                        </div>
                        <div className="text-gray-600">
                          <strong>Última recepção:</strong> {stats.lastReceived}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onViewProfile(beneficiary)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {filteredBeneficiaries.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Clique em "Ver Perfil" para visualizar o histórico completo de recepções de cada beneficiário.
          </div>
        )}
      </CardContent>
    </Card>
  )
}