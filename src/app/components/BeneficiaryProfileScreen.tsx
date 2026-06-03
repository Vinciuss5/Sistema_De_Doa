import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, User, Package, Calendar, Shirt, MapPin } from 'lucide-react'
import type { Beneficiary, ClothingItem } from '../App'

interface BeneficiaryProfileScreenProps {
  beneficiary: Beneficiary
  clothingItems: ClothingItem[]
  onBack: () => void
}

export function BeneficiaryProfileScreen({ beneficiary, clothingItems, onBack }: BeneficiaryProfileScreenProps) {
  
  // Filtrar roupas recebidas por este beneficiário
  const receivedItems = clothingItems.filter(item => 
    item.beneficiaryId === beneficiary.id && item.distributedAt
  )

  // Calcular estatísticas
  const totalReceived = receivedItems.length
  const itemsByType = receivedItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const itemsByQuality = receivedItems.reduce((acc, item) => {
    acc[item.quality] = (acc[item.quality] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Ordenar por data mais recente
  const sortedReceivedItems = receivedItems.sort((a, b) => 
    new Date(b.distributedAt!).getTime() - new Date(a.distributedAt!).getTime()
  )

  // Função para formatar endereço completo
  const getFullAddress = (beneficiary: Beneficiary) => {
    const parts = []
    
    // Rua e número
    if (beneficiary.street && beneficiary.number) {
      parts.push(`${beneficiary.street}, ${beneficiary.number}`)
    }
    
    // Complemento
    if (beneficiary.complement) {
      parts.push(beneficiary.complement)
    }
    
    // Bairro
    if (beneficiary.neighborhood) {
      parts.push(beneficiary.neighborhood)
    }
    
    // Cidade e Estado
    if (beneficiary.city && beneficiary.state) {
      parts.push(`${beneficiary.city} - ${beneficiary.state}`)
    }
    
    // CEP
    if (beneficiary.zipCode) {
      parts.push(`CEP: ${beneficiary.zipCode}`)
    }
    
    return parts.join(', ')
  }

  return (
    <Card className="w-full max-w-5xl mx-auto bg-white shadow-sm border border-gray-200">
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
        <h2 className="text-2xl text-gray-800">Perfil do Beneficiário</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações do Beneficiário */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl text-gray-800">{beneficiary.name}</h3>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-mono">
                  {beneficiary.beneficiaryCode}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Email:</strong></p>
                    <p className="text-gray-700">{beneficiary.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>Telefone:</strong></p>
                    <p className="text-gray-700">{beneficiary.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>CPF:</strong></p>
                    <p className="text-gray-700">{beneficiary.cpf}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1"><strong>Endereço completo:</strong></p>
                      <p className="text-gray-700 leading-relaxed">{getFullAddress(beneficiary)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl text-green-800">{totalReceived}</p>
            <p className="text-sm text-green-600">Peças Recebidas</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
            <Shirt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl text-blue-800">{Object.keys(itemsByType).length}</p>
            <p className="text-sm text-blue-600">Tipos Diferentes</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
            <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl text-yellow-800">
              {sortedReceivedItems.length > 0 
                ? new Date(sortedReceivedItems[0].distributedAt!).toLocaleDateString('pt-BR')
                : 'N/A'
              }
            </p>
            <p className="text-sm text-yellow-600">Última Recepção</p>
          </div>
        </div>

        {/* Resumo por Tipo */}
        {Object.keys(itemsByType).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg text-gray-800 mb-3">Resumo por Tipo de Roupa</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(itemsByType).map(([type, count]) => (
                <div key={type} className="bg-white p-3 rounded border text-center">
                  <p className="text-lg text-gray-800">{count}</p>
                  <p className="text-sm text-gray-600">{type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo por Qualidade */}
        {Object.keys(itemsByQuality).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg text-gray-800 mb-3">Resumo por Qualidade</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(itemsByQuality).map(([quality, count]) => (
                <div key={quality} className="bg-white p-3 rounded border text-center">
                  <p className="text-lg text-gray-800">{count}</p>
                  <p className="text-sm text-gray-600">{quality}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de Recepções */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg text-gray-800">Histórico de Recepções</h4>
            <p className="text-sm text-gray-600">Todas as roupas recebidas por este beneficiário</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {sortedReceivedItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Este beneficiário ainda não recebeu nenhuma roupa.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sortedReceivedItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-indigo-100 p-2 rounded">
                            <Shirt className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <h5 className="text-gray-800">{item.type}</h5>
                            <p className="text-sm text-gray-600">
                              {item.size} • {item.color} • {item.quality}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-600">
                        <p className="text-indigo-600 font-mono">
                          {new Date(item.distributedAt!).toLocaleDateString('pt-BR')}
                        </p>
                        <p>Recebido</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botão de Voltar */}
        <div className="text-center">
          <Button 
            onClick={onBack}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
          >
            Voltar à Busca
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}