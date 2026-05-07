'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export type AchievementNotification = {
  id: string
  achievementId: string
  unlockedAt: string
}

/**
 * Se suscribe a inserciones en user_achievements para el usuario actual.
 * Devuelve la lista de notificaciones pendientes; llama a dismiss(id) para eliminarlas.
 * Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el cliente.
 */
export function useRealtimeAchievements(userId: string | null | undefined) {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([])

  useEffect(() => {
    if (!userId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const channel = supabase
      .channel(`achievements:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const row = payload.new as { achievement_id: string; unlocked_at: string }
          setNotifications(prev => [
            ...prev,
            {
              id: `${row.achievement_id}-${Date.now()}`,
              achievementId: row.achievement_id,
              unlockedAt: row.unlocked_at,
            },
          ])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, dismiss }
}
