import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, CheckCircle, Copy, AlertCircle } from 'lucide-react'
import { createDonor } from '../utils/api'
import type { Donor } from '../App'

interface DonorRegistrationProps {
  onBack: () => void
  onNext: (donor: Donor) => void
  onRefresh: () => void
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  cpf?: string
}

export function DonorRegistration({ onBack, onNext, onRefresh }: DonorRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  })
  const [registeredDonor, setRegisteredDonor] = useState<Donor | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [donorCodeAttempts, setDonorCodeAttempts] = useState(1)

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a formatação (11) 99999-9999
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
  }

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a formatação 000.000.000-00
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
    }
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`
  }

  // Função para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Função para validar CPF
  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '')
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false
    
    // Verifica se não são todos iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Validação dos dígitos verificadores
    let sum = 0
    let remainder
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.substring(9, 10))) return false
    
    // Segundo dígito verificador
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

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    let newErrors = { ...errors }

    if (field === 'phone') {
      formattedValue = formatPhone(value)
      // Remove erro de telefone se estiver sendo digitado
      if (newErrors.phone) {
        delete newErrors.phone
      }
    } else if (field === 'cpf') {
      formattedValue = formatCPF(value)
      // Remove erro de CPF se estiver sendo digitado
      if (newErrors.cpf) {
        delete newErrors.cpf
      }
    } else if (field === 'email') {
      // Remove erro de email se estiver sendo digitado
      if (newErrors.email) {
        delete newErrors.email
      }
    } else if (field === 'name') {
      // Remove erro de nome se estiver sendo digitado
      if (newErrors.name) {
        delete newErrors.name
      }
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Validação do nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    // Validação do telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos'
    }

    // Validação do CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF deve ser válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    let attempts = donorCodeAttempts
    let success = false
    
    // Try up to 10 times to find an available code
    while (attempts <= donorCodeAttempts + 10 && !success) {
      try {
        const donorCode = `DOA${String(attempts).padStart(3, '0')}`
        
        // Create donor via API
        const response = await createDonor({
          code: donorCode,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          address: '' // Not used in this form
        })

        if (response.success && response.donor) {
          const donor: Donor = {
            id: response.donor.code,
            donorCode: response.donor.code,
            name: response.donor.name,
            email: response.donor.email,
            phone: response.donor.phone,
            cpf: response.donor.cpf
          }
          
          setRegisteredDonor(donor)
          setShowSuccess(true)
          setDonorCodeAttempts(attempts + 1)
          onRefresh() // Refresh donor list
          console.log('Cadastro de doador:', donor)
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
        alert(error.message || 'Erro ao cadastrar doador. Por favor, tente novamente.')
        break
      }
    }
    
    setIsSubmitting(false)
  }

  const copyDonorCode = () => {
    if (registeredDonor) {
      navigator.clipboard.writeText(registeredDonor.donorCode)
      alert('Código do doador copiado!')
    }
  }

  const handleContinue = () => {
    if (registeredDonor) {
      onNext(registeredDonor)
    }
  }

  if (showSuccess && registeredDonor) {
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
            <h2 className="text-2xl text-gray-800">Doador Cadastrado!</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Doador cadastrado com sucesso no sistema.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">Código de Identificação:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl text-blue-600 font-mono">
                  {registeredDonor.donorCode}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDonorCode}
                  className="p-2"
                  title="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Use este código para vincular as doações deste doador
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-sm text-gray-600 mb-1"><strong>Nome:</strong> {registeredDonor.name}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {registeredDonor.email}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Telefone:</strong> {registeredDonor.phone}</p>
              <p className="text-sm text-gray-600"><strong>CPF:</strong> {registeredDonor.cpf}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-12"
          >
            Ver Perfil do Doador
          </Button>
          
          <div className="text-center">
            <button 
              onClick={() => {
                setShowSuccess(false)
                setRegisteredDonor(null)
                setErrors({})
              }}
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Cadastrar outro doador
            </button>
          </div>
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
        <h2 className="text-2xl text-gray-800">Cadastro de Doador</h2>
        <p className="text-sm text-gray-600 mt-2">Registre os dados do doador no sistema</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-800">Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`bg-gray-50 border-gray-300 rounded-md ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Nome completo do doador"
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
            className={`bg-gray-50 border-gray-300 rounded-md ${errors.email ? 'border-red-500' : ''}`}
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
            className={`bg-gray-50 border-gray-300 rounded-md ${errors.phone ? 'border-red-500' : ''}`}
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
            className={`bg-gray-50 border-gray-300 rounded-md ${errors.cpf ? 'border-red-500' : ''}`}
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
        
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Informação:</strong> Após o cadastro, será gerado um código único para identificar o doador no sistema.
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-12"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Doador'}
        </Button>
      </CardContent>
    </Card>
  )
}