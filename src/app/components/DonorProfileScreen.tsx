import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, User, Package, Mail, Phone, CreditCard } from 'lucide-react'
import type { Donor, ClothingItem } from '../App'

interface DonorProfileScreenProps {
  donor: Donor
  clothingItems: ClothingItem[]
  onBack: () => void
}

export function DonorProfileScreen({ donor, clothingItems, onBack }: DonorProfileScreenProps) {
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const donorDonations = clothingItems.filter(item => item.donorId === donor.id)
  const totalItems = donorDonations.reduce((total, item) => total + item.quantity, 0)

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
        <CardTitle className="text-2xl text-gray-800">Perfil do Doador</CardTitle>
        <p className="text-sm text-gray-600 mt-2">Informações completas e histórico de doações</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informações do Doador */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 text-center">
                <p className="text-sm text-gray-600">Código do Doador</p>
                <p className="text-3xl text-blue-600 font-mono">{donor.donorCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nome Completo</p>
                <p className="font-medium text-gray-800">{donor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="font-medium text-gray-800">{donor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone
                </p>
                <p className="font-medium text-gray-800">{donor.phone}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  CPF
                </p>
                <p className="font-medium text-gray-800">{formatCPF(donor.cpf)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas das Doações */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Resumo das Doações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl text-green-600">{totalItems}</p>
                <p className="text-sm text-gray-600">Total de peças</p>
              </div>
              <div>
                <p className="text-3xl text-green-600">{donorDonations.length}</p>
                <p className="text-sm text-gray-600">Tipos diferentes</p>
              </div>
              <div>
                <p className="text-3xl text-green-600">
                  {donorDonations.length > 0 ? Math.round(totalItems / donorDonations.length) : 0}
                </p>
                <p className="text-sm text-gray-600">Média por tipo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Doações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Histórico de Doações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {donorDonations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Este doador ainda não possui doações registradas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donorDonations.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">{item.type}</h4>
                        <p className="text-sm text-gray-500">Doado em {formatDate(item.donatedAt)}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {item.quantity} {item.quantity === 1 ? 'peça' : 'peças'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Tamanho</p>
                        <p className="text-sm font-medium text-gray-700">{item.size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cor</p>
                        <p className="text-sm font-medium text-gray-700">{item.color}</p>
                      </div>
                      <div className="md:col-span-1 col-span-2">
                        <p className="text-xs text-gray-500">Qualidade</p>
                        <p className="text-sm font-medium text-gray-700">{item.quality}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}