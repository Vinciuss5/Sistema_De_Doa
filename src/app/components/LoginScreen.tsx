import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { signIn } from '../utils/supabase/client'
import { AlertCircle, Loader2 } from 'lucide-react'

interface LoginScreenProps {
  onNavigateToPasswordRecovery: () => void
  onNavigateToMenu: () => void
  onNavigateToSignup?: () => void
}

export function LoginScreen({ onNavigateToPasswordRecovery, onNavigateToMenu, onNavigateToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // Validar email enquanto digita (apenas se tiver conteúdo)
    if (value && !validateEmail(value)) {
      setEmailError('Digite um email válido (ex: email@dominio.com)')
    } else {
      setEmailError('')
    }
  }

  const handleLogin = async () => {
    // Reset errors
    setLoginError('')
    
    // Validar campos vazios
    if (!email || !password) {
      setLoginError('Por favor, preencha email e senha')
      return
    }
    
    // Validar formato do email
    if (!validateEmail(email)) {
      setEmailError('Digite um email válido (ex: email@dominio.com)')
      setLoginError('Email inválido')
      return
    }

    setIsLoading(true)
    
    try {
      // Attempt to sign in
      const { session, error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        setLoginError('Email ou senha incorretos')
        setIsLoading(false)
        return
      }

      if (session) {
        console.log('Login successful:', session.user.email)
        onNavigateToMenu()
      }
    } catch (error) {
      console.error('Login exception:', error)
      setLoginError('Erro ao fazer login. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-sm border border-gray-200">
      <CardHeader className="text-center pb-6">
        <h1 className="text-2xl text-gray-800 mb-6">Sistema de Doação de Roupas</h1>
      </CardHeader>
      <CardContent className="space-y-6">
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{loginError}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-800">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`bg-gray-50 border-gray-300 rounded-md ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
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
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 border-gray-300 rounded-md"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md h-12"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </div>
          ) : (
            'Logar'
          )}
        </Button>
        
        <div className="text-center space-y-2">
          <button 
            onClick={onNavigateToPasswordRecovery}
            className="text-blue-600 hover:text-blue-700 underline text-sm block w-full"
          >
            Esqueceu sua senha?
          </button>
          {onNavigateToSignup && (
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button
                onClick={onNavigateToSignup}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Cadastre-se
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}