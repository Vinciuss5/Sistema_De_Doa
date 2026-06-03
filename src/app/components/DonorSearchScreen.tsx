import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, Search, User, Mail, Phone, CreditCard, Eye, Users } from 'lucide-react'
import type { Donor, ClothingItem } from '../App'

interface DonorSearchScreenProps {
  donors: Donor[]
  clothingItems: ClothingItem[]
  onBack: () => void
  onViewProfile: (donor: Donor) => void
}

export function DonorSearchScreen({ donors, clothingItems, onBack, onViewProfile }: DonorSearchScreenProps) {
  const [searchCode, setSearchCode] = useState('')
  const [foundDonor, setFoundDonor] = useState<Donor | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSearch = () => {
    setSearchPerformed(true)
    const donor = donors.find(d => d.donorCode.toLowerCase() === searchCode.toLowerCase())
    setFoundDonor(donor || null)
  }

  const getDonorDonations = (donorId: string) => {
    return clothingItems.filter(item => item.donorId === donorId)
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Ordenar doadores por código (mais recentes primeiro)
  const sortedDonors = [...donors].sort((a, b) => b.donorCode.localeCompare(a.donorCode))

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
        <CardTitle className="text-2xl text-gray-800">Pesquisar Doador</CardTitle>
        <p className="text-sm text-gray-600 mt-2">Digite o código do doador ou selecione na lista abaixo</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search-code">Código do Doador</Label>
          <div className="flex gap-2">
            <Input
              id="search-code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Ex: DOA001"
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {searchPerformed && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg text-gray-800">Resultado da Busca</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchPerformed(false)
                  setFoundDonor(null)
                  setSearchCode('')
                }}
                className="text-sm"
              >
                Limpar Busca
              </Button>
            </div>
            
            {foundDonor ? (
              <div className="space-y-6">
                {/* Informações do Doador Encontrado */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Doador Encontrado
                      </CardTitle>
                      <Button
                        onClick={() => onViewProfile(foundDonor)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Perfil Completo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Código</p>
                        <p className="font-medium text-gray-800">{foundDonor.donorCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nome</p>
                        <p className="font-medium text-gray-800">{foundDonor.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </p>
                        <p className="font-medium text-gray-800">{foundDonor.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Telefone
                        </p>
                        <p className="font-medium text-gray-800">{foundDonor.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          CPF
                        </p>
                        <p className="font-medium text-gray-800">{formatCPF(foundDonor.cpf)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo das Doações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">
                      Resumo das Doações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const donorDonations = getDonorDonations(foundDonor.id)
                      if (donorDonations.length === 0) {
                        return (
                          <p className="text-gray-600 text-center py-4">
                            Este doador ainda não possui doações registradas.
                          </p>
                        )
                      }

                      const totalDonations = donorDonations.reduce((total, item) => total + item.quantity, 0)
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-2xl text-blue-600">{totalDonations}</p>
                              <p className="text-sm text-gray-600">Total de peças</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-2xl text-green-600">{donorDonations.length}</p>
                              <p className="text-sm text-gray-600">Tipos diferentes</p>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Últimas doações:</p>
                            <div className="space-y-2">
                              {donorDonations.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                  <span className="text-sm">{item.type} ({item.size})</span>
                                  <span className="text-xs text-gray-500">{item.quantity} peças</span>
                                </div>
                              ))}
                              {donorDonations.length > 3 && (
                                <p className="text-xs text-gray-500">+ {donorDonations.length - 3} outros itens</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="text-center py-8">
                  <p className="text-red-700">
                    Nenhum doador encontrado com o código "{searchCode}".
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Verifique se o código foi digitado corretamente ou selecione um doador da lista abaixo.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Lista de Doadores Disponíveis */}
        {!searchPerformed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Doadores Cadastrados ({donors.length})
              </CardTitle>
              <p className="text-sm text-gray-600">
                Clique em "Ver Perfil" para acessar as informações completas do doador
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedDonors.map((donor) => {
                  const donorDonations = getDonorDonations(donor.id)
                  const totalDonations = donorDonations.reduce((total, item) => total + item.quantity, 0)
                  
                  return (
                    <div key={donor.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg text-blue-600 font-mono">{donor.donorCode}</span>
                            <span className="text-lg text-gray-800">{donor.name}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {donor.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {donor.phone}
                            </div>
                          </div>
                          
                          <div className="flex gap-4 text-sm">
                            <div className="bg-blue-50 px-2 py-1 rounded">
                              <span className="text-blue-600">{totalDonations} peças doadas</span>
                            </div>
                            <div className="bg-green-50 px-2 py-1 rounded">
                              <span className="text-green-600">{donorDonations.length} tipos diferentes</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onViewProfile(donor)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 ml-4"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  )
                })}
                
                {donors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum doador cadastrado no sistema ainda.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}