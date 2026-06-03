import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { ArrowLeft, Minus, Plus, Package, User, Gift } from 'lucide-react'
import type { ClothingItem, Donor, Beneficiary } from '../App'

interface StockScreenProps {
  clothingItems: ClothingItem[]
  onUpdateQuantity: (id: string, newQuantity: number) => void
  onDistributeClothing: (clothingId: string, beneficiaryId: string, quantity: number) => void
  beneficiaries: Beneficiary[]
  onBack: () => void
  getDonorById: (id: string) => Donor | undefined
  getBeneficiaryById: (id: string) => Beneficiary | undefined
}

export function StockScreen({ clothingItems, onUpdateQuantity, onDistributeClothing, beneficiaries, onBack, getDonorById, getBeneficiaryById }: StockScreenProps) {
  const [distributionData, setDistributionData] = useState<{[key: string]: {beneficiaryId: string, quantity: string}}>({})
  const [showDistribution, setShowDistribution] = useState<{[key: string]: boolean}>({})

  const handleDistributionChange = (itemId: string, field: 'beneficiaryId' | 'quantity', value: string) => {
    setDistributionData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleDistribute = (item: ClothingItem) => {
    const data = distributionData[item.id]
    if (!data?.beneficiaryId || !data?.quantity) return
    
    const quantityToDistribute = parseInt(data.quantity)
    if (quantityToDistribute <= 0 || quantityToDistribute > item.quantity) return
    
    onDistributeClothing(item.id, data.beneficiaryId, quantityToDistribute)
    
    // Reset distribution data for this item
    setDistributionData(prev => {
      const newData = { ...prev }
      delete newData[item.id]
      return newData
    })
    
    // Hide distribution form
    setShowDistribution(prev => ({
      ...prev,
      [item.id]: false
    }))
  }

  const toggleDistribution = (itemId: string) => {
    setShowDistribution(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleDecrease = (item: ClothingItem) => {
    if (item.quantity > 0) {
      onUpdateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleIncrease = (item: ClothingItem) => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  const totalItems = clothingItems.reduce((total, item) => total + item.quantity, 0)

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Novo':
        return 'text-green-600 bg-green-50'
      case 'Usado - Excelente Estado':
        return 'text-blue-600 bg-blue-50'
      case 'Usado - Bom Estado':
        return 'text-yellow-600 bg-yellow-50'
      case 'Usado - Estado Regular':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const groupedByType = clothingItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, ClothingItem[]>)

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
        <h1 className="text-xl text-gray-800 mb-6">Sistema de Doação de Roupas para Instituições</h1>
        <h2 className="text-2xl text-gray-800">Estoque de Roupas</h2>
        <div className="text-lg text-gray-600 mt-2">
          Total de peças: <span className="text-blue-600">{totalItems}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {clothingItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            Nenhuma roupa cadastrada no estoque
          </div>
        ) : (
          Object.entries(groupedByType).map(([type, items]) => (
            <div key={type} className="space-y-3">
              <h3 className="text-lg text-gray-800 border-b border-gray-200 pb-2">
                {type} ({items.reduce((sum, item) => sum + item.quantity, 0)} peças)
              </h3>
              <div className="grid gap-4">
                {items.map((item) => {
                  const donor = getDonorById(item.donorId)
                  const beneficiary = item.beneficiaryId ? getBeneficiaryById(item.beneficiaryId) : null
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-800">Tamanho: {item.size}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-800">Cor: {item.color}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getQualityColor(item.quality)}`}>
                              {item.quality}
                            </span>
                          </div>
                          {donor && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              <span className="font-mono text-blue-600">{donor.donorCode}</span>
                              <span>- {donor.name}</span>
                            </div>
                          )}
                          {beneficiary && item.distributedAt && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <Gift className="h-3 w-3" />
                              <span className="font-mono">{beneficiary.beneficiaryCode}</span>
                              <span>- Distribuído para {beneficiary.name} em {new Date(item.distributedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecrease(item)}
                              disabled={item.quantity === 0}
                              className="h-8 w-8 p-0"
                              title="Diminuir quantidade (doação realizada)"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <span className="text-lg text-gray-800 min-w-12 text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleIncrease(item)}
                              className="h-8 w-8 p-0"
                              title="Aumentar quantidade (nova doação)"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-gray-600 text-sm">Disponível</div>
                            <div className="text-lg text-blue-600">
                              {item.quantity} peça{item.quantity !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {item.quantity > 0 && (
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm text-gray-700">Distribuir para Beneficiário</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleDistribution(item.id)}
                                className="h-8"
                              >
                                <Gift className="h-4 w-4 mr-1" />
                                {showDistribution[item.id] ? 'Cancelar' : 'Distribuir'}
                              </Button>
                            </div>
                            
                            {showDistribution[item.id] && (
                              <div className="space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="space-y-2">
                                  <label className="text-sm text-gray-700">Selecionar Beneficiário:</label>
                                  <Select
                                    value={distributionData[item.id]?.beneficiaryId || ''}
                                    onValueChange={(value) => handleDistributionChange(item.id, 'beneficiaryId', value)}
                                  >
                                    <SelectTrigger className="w-full bg-white">
                                      <SelectValue placeholder="Escolha um beneficiário" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {beneficiaries.map((beneficiary) => (
                                        <SelectItem key={beneficiary.id} value={beneficiary.id}>
                                          {beneficiary.beneficiaryCode} - {beneficiary.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm text-gray-700">Quantidade a distribuir:</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.quantity}
                                    value={distributionData[item.id]?.quantity || ''}
                                    onChange={(e) => handleDistributionChange(item.id, 'quantity', e.target.value)}
                                    placeholder="1"
                                    className="w-20 bg-white"
                                  />
                                  <p className="text-xs text-gray-600">Máximo: {item.quantity} peça{item.quantity !== 1 ? 's' : ''}</p>
                                </div>
                                
                                <Button
                                  onClick={() => handleDistribute(item)}
                                  disabled={!distributionData[item.id]?.beneficiaryId || !distributionData[item.id]?.quantity}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Confirmar Distribuição
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {item.quantity === 0 && (
                        <div className="mt-2 text-red-600 text-sm">
                          ⚠️ Sem peças disponíveis no estoque
                        </div>
                      )}
                      
                      {item.quantity <= 2 && item.quantity > 0 && (
                        <div className="mt-2 text-orange-600 text-sm">
                          ⚠️ Estoque baixo
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}