import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface PasswordRecoveryScreenProps {
  onBack: () => void
}

export function PasswordRecoveryScreen({ onBack }: PasswordRecoveryScreenProps) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Função para validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    // Remove erro quando usuário começa a digitar
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    if (!validateEmail(email)) {
      setError('Email deve ter um formato válido')
      return
    }

    setIsLoading(true)
    setError('')
    
    // Mock API call - in real app would call recovery endpoint
    setTimeout(() => {
      console.log('Password recovery for:', email)
      setIsLoading(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
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
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl text-gray-800">Email Enviado!</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-gray-600">
              Enviamos as instruções para recuperação de senha para o email:
            </p>
            <p className="text-gray-800 bg-blue-50 p-2 rounded-md break-all">
              {email}
            </p>
            <p className="text-sm text-gray-500">
              Verifique sua caixa de entrada e também a pasta de spam.
            </p>
            <p className="text-sm text-gray-500">
              O link de recuperação expira em 24 horas.
            </p>
          </div>
          
          <Button 
            onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-12"
          >
            Voltar ao Login
          </Button>
          
          <div className="text-center">
            <button 
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
                setError('')
              }}
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Não recebeu o email? Tentar novamente
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
        <div className="flex flex-col items-center">
          <Mail className="h-16 w-16 text-blue-600 mb-4" />
          <h2 className="text-2xl text-gray-800">Recuperar Senha</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Digite seu email institucional para receber as instruções de recuperação de senha.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="recovery-email" className="text-gray-800">Email Institucional *</Label>
          <Input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`bg-gray-50 border-gray-300 rounded-md ${error ? 'border-red-500' : ''}`}
            placeholder="seu.email@instituicao.org"
            disabled={isLoading}
          />
          {error && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md h-12"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </div>
          ) : (
            'Enviar Instruções'
          )}
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Lembrou da senha?{' '}
            <button 
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Voltar ao login
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}