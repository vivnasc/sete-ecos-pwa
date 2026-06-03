'use client'

import { getSupabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb) return { error: 'Supabase não configurado' }
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return {}
}

export async function signUp(email: string, password: string): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb) return { error: 'Supabase não configurado' }
  const { error } = await sb.auth.signUp({ email, password })
  if (error) return { error: error.message }
  return {}
}

export async function signOut(): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  await sb.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb) return { error: 'Supabase não configurado' }
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
  })
  if (error) return { error: error.message }
  return {}
}
