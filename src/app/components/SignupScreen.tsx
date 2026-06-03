import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { signUp, signIn } from '../utils/supabase/client'
import { AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

interface SignupScreenProps {
  onBack: () => void
  onSuccess: () => void
}

export function SignupScreen({ onBack, onSuccess }: SignupScreenProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    if (value && !validateEmail(value)) {
      setEmailError('Digite um email válido')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    if (value && value.length < 6) {
      setPasswordError('Senha deve ter no mínimo 6 caracteres')
    } else {
      setPasswordError('')
    }
  }

  const handleSignup = async () => {
    setSignupError('')
    
    // Validações
    if (!name || !email || !password || !confirmPassword) {
      setSignupError('Preencha todos os campos')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Email inválido')
      setSignupError('Email inválido')
      return
    }

    if (password.length < 6) {
      setPasswordError('Senha muito curta')
      setSignupError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setSignupError('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      // Create user account
      const { data, error } = await signUp(email, password, name)

      if (error) {
        console.error('Signup error:', error)
        setSignupError(error)
        setIsLoading(false)
        return
      }

      // Auto login after signup
      const { session, error: loginError } = await signIn(email, password)

      if (loginError) {
        console.error('Auto-login error:', loginError)
        setIsSuccess(true)
        setIsLoading(false)
        return
      }

      if (session) {
        console.log('Signup and login successful')
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (error) {
      console.error('Signup exception:', error)
      setSignupError('Erro ao criar conta. Tente novamente.')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white shadow-sm border border-gray-200">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl text-gray-800">Conta Criada!</h2>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Sua conta foi criada com sucesso.
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando para o sistema...
          </p>
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
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
        </div>
        <h1 className="text-xl text-gray-800 mb-6">Sistema de Doação de Roupas para Instituições</h1>
        <h2 className="text-2xl text-gray-800">Criar Conta</h2>
        <p className="text-sm text-gray-600 mt-2">Cadastre-se para acessar o sistema</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {signupError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{signupError}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-800">Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border-gray-300 rounded-md"
            placeholder="Seu nome completo"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-800">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`bg-gray-50 border-gray-300 rounded-md ${emailError ? 'border-red-500' : ''}`}
            placeholder="seu.email@instituicao.org"
            disabled={isLoading}
          />
          {emailError && (
            <p className="text-red-600 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-800">Senha *</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`bg-gray-50 border-gray-300 rounded-md ${passwordError ? 'border-red-500' : ''}`}
            placeholder="Mínimo 6 caracteres"
            disabled={isLoading}
          />
          {passwordError && (
            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-800">Confirmar Senha *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-gray-50 border-gray-300 rounded-md"
            placeholder="Digite a senha novamente"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSignup}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md h-12"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando conta...
            </div>
          ) : (
            'Criar Conta'
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{' '}
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 underline"
              disabled={isLoading}
            >
              Fazer login
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
