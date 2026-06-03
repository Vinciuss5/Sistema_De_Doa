import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, CheckCircle, Copy, AlertCircle, MapPin } from 'lucide-react'
import { createBeneficiary } from '../utils/api'
import type { Beneficiary } from '../App'

interface BeneficiaryRegistrationProps {
  onBack: () => void
  onRefresh: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
  cpf: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

export function BeneficiaryRegistration({ onBack, onRefresh }: BeneficiaryRegistrationProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [registeredBeneficiary, setRegisteredBeneficiary] = useState<Beneficiary | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [beneficiaryCodeAttempts, setBeneficiaryCodeAttempts] = useState(1)

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    
    const limitedNumbers = numbers.slice(0, 11)
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
  }

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
    }
    
    const limitedNumbers = numbers.slice(0, 11)
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`
  }

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 5) {
      return numbers
    } else {
      const limitedNumbers = numbers.slice(0, 8)
      return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`
    }
  }

  // Função para buscar endereço por CEP
  const searchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    
    if (cleanCEP.length !== 8) {
      return
    }

    setIsLoadingCep(true)
    
    try {
      // Simulação de busca por CEP (em produção, usar API real como ViaCEP)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados simulados baseados no CEP
      const mockAddressData: { [key: string]: any } = {
        '05421001': {
          street: 'Rua das Flores',
          neighborhood: 'Vila Madalena',
          city: 'São Paulo',
          state: 'SP'
        },
        '01310100': {
          street: 'Avenida Paulista',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP'
        },
        '22071900': {
          street: 'Rua do Sol',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        '20040020': {
          street: 'Rua da Assembleia',
          neighborhood: 'Centro',
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        '30112000': {
          street: 'Rua da Bahia',
          neighborhood: 'Centro',
          city: 'Belo Horizonte',
          state: 'MG'
        }
      }

      const addressData = mockAddressData[cleanCEP]
      
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          street: addressData.street,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state
        }))
        
        // Remove erros dos campos preenchidos automaticamente
        const newErrors = { ...errors }
        delete newErrors.street
        delete newErrors.neighborhood
        delete newErrors.city
        delete newErrors.state
        setErrors(newErrors)
      } else {
        // CEP não encontrado - limpa os campos
        setFormData(prev => ({
          ...prev,
          street: '',
          neighborhood: '',
          city: '',
          state: ''
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setIsLoadingCep(false)
    }
  }

  // Função para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Função para validar CPF
  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '')
    
    if (numbers.length !== 11) return false
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    let sum = 0
    let remainder
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.substring(9, 10))) return false
    
    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.substring(10, 11))) return false
    
    return true
  }

  // Função para validar telefone
  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length === 10 || numbers.length === 11
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value
    let newErrors = { ...errors }

    if (field === 'phone') {
      formattedValue = formatPhone(value)
      if (newErrors.phone) delete newErrors.phone
    } else if (field === 'cpf') {
      formattedValue = formatCPF(value)
      if (newErrors.cpf) delete newErrors.cpf
    } else if (field === 'zipCode') {
      formattedValue = formatCEP(value)
      if (newErrors.zipCode) delete newErrors.zipCode
      
      // Buscar endereço quando CEP estiver completo
      const cleanCEP = formattedValue.replace(/\D/g, '')
      if (cleanCEP.length === 8) {
        searchAddressByCEP(formattedValue)
      }
    } else if (field === 'email') {
      if (newErrors.email) delete newErrors.email
    } else {
      if (newErrors[field]) delete newErrors[field]
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos'
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF deve ser válido'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório'
    } else if (formData.zipCode.replace(/\D/g, '').length !== 8) {
      newErrors.zipCode = 'CEP deve ter 8 dígitos'
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Rua é obrigatória'
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório'
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório'
    } else if (formData.state.length !== 2) {
      newErrors.state = 'Estado deve ter 2 caracteres (ex: SP)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    let attempts = beneficiaryCodeAttempts
    let success = false
    
    // Try up to 10 times to find an available code
    while (attempts <= beneficiaryCodeAttempts + 10 && !success) {
      try {
        const beneficiaryCode = `BEN${String(attempts).padStart(3, '0')}`
        
        const address = `${formData.street}, ${formData.number}${formData.complement ? ` - ${formData.complement}` : ''}, ${formData.neighborhood}, ${formData.city}, ${formData.state}, CEP: ${formData.zipCode}`
        
        // Create beneficiary via API
        const response = await createBeneficiary({
          code: beneficiaryCode,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          address
        })

        if (response.success && response.beneficiary) {
          const beneficiary: Beneficiary = {
            id: response.beneficiary.code,
            beneficiaryCode: response.beneficiary.code,
            name: response.beneficiary.name,
            email: response.beneficiary.email,
            phone: response.beneficiary.phone,
            cpf: response.beneficiary.cpf,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }
          
          setRegisteredBeneficiary(beneficiary)
          setShowSuccess(true)
          setBeneficiaryCodeAttempts(attempts + 1)
          onRefresh() // Refresh beneficiary list
          console.log('Cadastro de beneficiário:', beneficiary)
          success = true
        }
      } catch (error: any) {
        console.error(`Attempt ${attempts} failed:`, error.message)
        // If it's a duplicate code error, try the next number
        if (error.message.includes('já existe')) {
          attempts++
          continue
        }
        // For other errors, show message and stop
        alert(error.message || 'Erro ao cadastrar beneficiário. Por favor, tente novamente.')
        break
      }
    }
    
    setIsSubmitting(false)
  }

  const copyBeneficiaryCode = () => {
    if (registeredBeneficiary) {
      navigator.clipboard.writeText(registeredBeneficiary.beneficiaryCode)
      alert('Código do beneficiário copiado!')
    }
  }

  const handleContinue = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    })
    setShowSuccess(false)
    setRegisteredBeneficiary(null)
    setErrors({})
    onBack()
  }

  const getFullAddress = (beneficiary: Beneficiary) => {
    const parts = [
      beneficiary.street,
      beneficiary.number,
      beneficiary.complement && `(${beneficiary.complement})`,
      beneficiary.neighborhood,
      beneficiary.city,
      beneficiary.state,
      `CEP: ${beneficiary.zipCode}`
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  if (showSuccess && registeredBeneficiary) {
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
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl text-gray-800">Beneficiário Cadastrado!</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Beneficiário cadastrado com sucesso no sistema.
            </p>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-800 mb-2">Código de Identificação:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl text-indigo-600 font-mono">
                  {registeredBeneficiary.beneficiaryCode}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBeneficiaryCode}
                  className="p-2"
                  title="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-indigo-600 mt-2">
                Use este código para distribuir roupas para este beneficiário
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-sm text-gray-600 mb-1"><strong>Nome:</strong> {registeredBeneficiary.name}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {registeredBeneficiary.email}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Telefone:</strong> {registeredBeneficiary.phone}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>CPF:</strong> {registeredBeneficiary.cpf}</p>
              <p className="text-sm text-gray-600"><strong>Endereço:</strong> {getFullAddress(registeredBeneficiary)}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md h-12"
          >
            Voltar ao Menu
          </Button>
          
          <div className="text-center">
            <button 
              onClick={() => {
                setShowSuccess(false)
                setRegisteredBeneficiary(null)
                setErrors({})
              }}
              className="text-indigo-600 hover:text-indigo-700 underline text-sm"
            >
              Cadastrar outro beneficiário
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-sm border border-gray-200">
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
        <h2 className="text-2xl text-gray-800">Cadastro de Beneficiário</h2>
        <p className="text-sm text-gray-600 mt-2">Registre os dados do beneficiário no sistema</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dados Pessoais */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg text-blue-800 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-800">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`bg-white border-gray-300 rounded-md ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Nome completo do beneficiário"
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`bg-white border-gray-300 rounded-md ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-800">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`bg-white border-gray-300 rounded-md ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              {errors.phone && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.phone}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-800">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                className={`bg-white border-gray-300 rounded-md ${errors.cpf ? 'border-red-500' : ''}`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.cpf}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg text-green-800 mb-4">Endereço</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-gray-800">CEP *</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    id="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`bg-white border-gray-300 rounded-md ${errors.zipCode ? 'border-red-500' : ''}`}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                {isLoadingCep && (
                  <div className="flex items-center gap-2 text-green-600">
                    <MapPin className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Buscando...</span>
                  </div>
                )}
              </div>
              {errors.zipCode && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.zipCode}
                </div>
              )}
              <p className="text-sm text-green-700">Digite o CEP para preenchimento automático do endereço</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street" className="text-gray-800">Rua *</Label>
                <Input
                  id="street"
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className={`bg-white border-gray-300 rounded-md ${errors.street ? 'border-red-500' : ''}`}
                  placeholder="Nome da rua"
                />
                {errors.street && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.street}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="number" className="text-gray-800">Número *</Label>
                <Input
                  id="number"
                  type="text"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  className={`bg-white border-gray-300 rounded-md ${errors.number ? 'border-red-500' : ''}`}
                  placeholder="123"
                />
                {errors.number && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.number}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement" className="text-gray-800">Complemento</Label>
              <Input
                id="complement"
                type="text"
                value={formData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                className="bg-white border-gray-300 rounded-md"
                placeholder="Apartamento, bloco, etc. (opcional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-gray-800">Bairro *</Label>
                <Input
                  id="neighborhood"
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  className={`bg-white border-gray-300 rounded-md ${errors.neighborhood ? 'border-red-500' : ''}`}
                  placeholder="Nome do bairro"
                />
                {errors.neighborhood && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.neighborhood}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-800">Cidade *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`bg-white border-gray-300 rounded-md ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="Nome da cidade"
                />
                {errors.city && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.city}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-800">Estado *</Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  className={`bg-white border-gray-300 rounded-md ${errors.state ? 'border-red-500' : ''}`}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.state && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200">
          <p className="text-sm text-indigo-800">
            <strong>Informação:</strong> Após o cadastro, será gerado um código único para identificar o beneficiário no sistema.
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md h-12"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Beneficiário'}
        </Button>
      </CardContent>
    </Card>
  )
}