import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, Search, AlertCircle } from 'lucide-react'
import { createProduct } from '../utils/api'
import type { Donor } from '../App'

interface ProductRegistrationProps {
  onBack: () => void
  donors: Donor[]
  onRefresh: () => void
}

interface FormErrors {
  donorCode?: string
  type?: string
  size?: string
  color?: string
  quality?: string
  quantity?: string
}

export function ProductRegistration({ onBack, donors, onRefresh }: ProductRegistrationProps) {
  const [formData, setFormData] = useState({
    donorCode: '',
    type: '',
    size: '',
    color: '',
    quality: '',
    quantity: '',
    observations: ''
  })
  const [donorSearch, setDonorSearch] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para validar e formatar quantidade (apenas números positivos)
  const formatQuantity = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    // Remove zeros à esquerda, mas mantém um zero se for só zero
    return numbers.replace(/^0+/, '') || (numbers === '0' ? '0' : '')
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    let newErrors = { ...errors }

    if (field === 'quantity') {
      formattedValue = formatQuantity(value)
      // Remove erro de quantidade se estiver sendo digitado
      if (newErrors.quantity) {
        delete newErrors.quantity
      }
    } else {
      // Remove erro do campo específico se estiver sendo modificado
      if (newErrors[field as keyof FormErrors]) {
        delete newErrors[field as keyof FormErrors]
      }
    }

    // Se mudou o tipo de roupa, reseta o tamanho pois pode ter mudado de letra para número
    if (field === 'type') {
      setFormData(prev => ({ ...prev, [field]: formattedValue, size: '' }))
    } else {
      setFormData(prev => ({ ...prev, [field]: formattedValue }))
    }
    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Validação do doador
    if (!formData.donorCode) {
      newErrors.donorCode = 'Selecione um doador'
    }

    // Validação do tipo
    if (!formData.type) {
      newErrors.type = 'Selecione o tipo de roupa'
    }

    // Validação do tamanho
    if (!formData.size) {
      newErrors.size = 'Selecione o tamanho'
    }

    // Validação da cor
    if (!formData.color.trim()) {
      newErrors.color = 'Informe a cor'
    } else if (formData.color.trim().length < 2) {
      newErrors.color = 'Cor deve ter pelo menos 2 caracteres'
    }

    // Validação da qualidade
    if (!formData.quality) {
      newErrors.quality = 'Selecione a qualidade'
    }

    // Validação da quantidade
    if (!formData.quantity) {
      newErrors.quantity = 'Informe a quantidade'
    } else {
      const quantity = parseInt(formData.quantity)
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = 'Quantidade deve ser um número maior que zero'
      } else if (quantity > 9999) {
        newErrors.quantity = 'Quantidade não pode ser maior que 9999'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createProduct({
        donorCode: formData.donorCode,
        type: formData.type,
        size: formData.size,
        color: formData.color,
        quality: formData.quality,
        quantity: parseInt(formData.quantity),
        observations: formData.observations
      })

      if (response.success) {
        alert('Peça de roupa cadastrada com sucesso!')
        
        // Reset form
        setFormData({
          donorCode: '',
          type: '',
          size: '',
          color: '',
          quality: '',
          quantity: '',
          observations: ''
        })
        setDonorSearch('')
        setErrors({})
        onRefresh() // Refresh product list
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar roupa:', error)
      alert(error.message || 'Erro ao cadastrar roupa. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredDonors = donors.filter(donor => 
    donor.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
    donor.donorCode.toLowerCase().includes(donorSearch.toLowerCase())
  )

  const selectedDonor = formData.donorCode ? donors.find(d => d.donorCode === formData.donorCode) : null

  const clothingTypes = [
    'Camiseta', 'Camisa', 'Blusa', 'Calça Jeans', 'Calça Social', 'Short', 'Bermuda',
    'Vestido', 'Saia', 'Jaqueta', 'Casaco', 'Moletom', 'Regata', 'Polo', 'Pijama',
    'Roupa Íntima', 'Meia', 'Sapato', 'Tênis', 'Sandália', 'Chinelo', 'Outros'
  ]

  // Tipos que usam numeração ao invés de letras
  const footwearTypes = ['Sapato', 'Tênis', 'Sandália', 'Chinelo']
  
  // Verifica se o tipo selecionado é calçado
  const isFootwear = footwearTypes.includes(formData.type)

  // Tamanhos por letra (para roupas)
  const letterSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', 'Único']
  
  // Numerações (para calçados) - do 25 ao 44
  const numberSizes = Array.from({ length: 20 }, (_, i) => (25 + i).toString())

  // Define qual array de tamanhos usar
  const sizes = isFootwear ? numberSizes : letterSizes

  const qualities = [
    'Novo',
    'Usado - Excelente Estado',
    'Usado - Bom Estado',
    'Usado - Estado Regular'
  ]

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
        <h2 className="text-2xl text-gray-800">Cadastro de Roupa</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="donor-search" className="text-gray-800">Selecionar Doador *</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="donor-search"
              type="text"
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              className={`pl-10 bg-gray-50 border-gray-300 rounded-md ${errors.donorCode ? 'border-red-500' : ''}`}
              placeholder="Buscar por nome ou código (ex: DOA001)"
            />
          </div>
          
          {donorSearch && (
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {filteredDonors.length === 0 ? (
                <div className="p-3 text-gray-500 text-sm text-center">
                  Nenhum doador encontrado
                </div>
              ) : (
                filteredDonors.map(donor => (
                  <button
                    key={donor.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, donorCode: donor.donorCode }))
                      setDonorSearch('')
                      // Remove erro de doador quando selecionado
                      if (errors.donorCode) {
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.donorCode
                          return newErrors
                        })
                      }
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm">
                      <span className="text-blue-600 font-mono">{donor.donorCode}</span>
                      <span className="text-gray-600 ml-2">- {donor.name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          
          {selectedDonor && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Doador Selecionado:</strong><br />
                <span className="font-mono">{selectedDonor.donorCode}</span> - {selectedDonor.name}
              </p>
            </div>
          )}
          
          {errors.donorCode && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.donorCode}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-gray-800">Tipo de Roupa *</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger className={`bg-gray-50 border-gray-300 rounded-md ${errors.type ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {clothingTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.type}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="size" className="text-gray-800">
            {isFootwear ? 'Numeração *' : 'Tamanho *'}
          </Label>
          <Select 
            value={formData.size} 
            onValueChange={(value) => handleInputChange('size', value)}
            key={formData.type}
          >
            <SelectTrigger className={`bg-gray-50 border-gray-300 rounded-md ${errors.size ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={isFootwear ? 'Selecione a numeração' : 'Selecione o tamanho'} />
            </SelectTrigger>
            <SelectContent>
              {sizes.map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.size && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.size}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color" className="text-gray-800">Cor *</Label>
          <Input
            id="color"
            type="text"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className={`bg-gray-50 border-gray-300 rounded-md ${errors.color ? 'border-red-500' : ''}`}
            placeholder="Ex: Azul, Vermelho, Branco"
          />
          {errors.color && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.color}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quality" className="text-gray-800">Qualidade *</Label>
          <Select value={formData.quality} onValueChange={(value) => handleInputChange('quality', value)}>
            <SelectTrigger className={`bg-gray-50 border-gray-300 rounded-md ${errors.quality ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione a qualidade" />
            </SelectTrigger>
            <SelectContent>
              {qualities.map(quality => (
                <SelectItem key={quality} value={quality}>{quality}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.quality && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.quality}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-gray-800">Quantidade *</Label>
          <Input
            id="quantity"
            type="text"
            inputMode="numeric"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            className={`bg-gray-50 border-gray-300 rounded-md ${errors.quantity ? 'border-red-500' : ''}`}
            placeholder="Digite a quantidade"
            maxLength={4}
          />
          {errors.quantity && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.quantity}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-12"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Roupa'}
        </Button>
      </CardContent>
    </Card>
  )
}