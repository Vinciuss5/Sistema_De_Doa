import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create singleton Supabase client
let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = `https://${projectId}.supabase.co`
  
  supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })

  return supabaseInstance
}

// Get current session
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Sign up new user
export async function signUp(email: string, password: string, name: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9a2c3dfe/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      return { data: null, error: data.error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { data: null, error: 'Erro ao cadastrar usuário' }
  }
}

// Sign in user
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { session: null, error: error.message }
  }

  return { session: data.session, error: null }
}

// Sign out user
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get access token from current session
export async function getAccessToken() {
  const { session } = await getSession()
  return session?.access_token || null
}
