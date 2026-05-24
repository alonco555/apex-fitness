'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && requireAuth) {
        router.push('/login')
        return
      }
      if (data.session) setUser(data.session.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session && requireAuth) router.push('/login')
      else if (session) { setUser(session.user); setLoading(false) }
    })

    return () => sub.subscription.unsubscribe()
  }, [router, requireAuth])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const profile = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Athlete',
    email: user.email || '',
    goal: user.user_metadata?.fitness_goal || 'fat_loss',
    weight: user.user_metadata?.weight || 80,
    height: user.user_metadata?.height || 175,
    age: user.user_metadata?.age || 25,
    gender: user.user_metadata?.gender || 'male',
    activity: user.user_metadata?.activity_level || 'moderately_active',
    targetCalories: user.user_metadata?.target_calories || 2200,
    targetProtein: user.user_metadata?.target_protein || 160,
    goalWeight: user.user_metadata?.goal_weight || 75,
  } : null

  return { user, loading, logout, profile }
}