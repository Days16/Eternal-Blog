import { requireSupabase } from '@/lib/supabase/helpers'

export async function applyAsCollaborator(userId: string, motivation: string, portfolio?: string | null) {
  const supabase = requireSupabase()

  const { data: existing } = await supabase
    .from('collaborator_applications')
    .select('id,status')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted') throw new Error('Ya eres colaborador.')
    if (existing.status === 'pending')  throw new Error('Ya tienes una solicitud pendiente de revisión.')
    // si fue rechazada, permite volver a postularse (update)
    const { error } = await supabase
      .from('collaborator_applications')
      .update({ motivation, portfolio: portfolio ?? null, status: 'pending', reviewed_by: null, reviewed_at: null })
      .eq('user_id', userId)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('collaborator_applications')
    .insert({ user_id: userId, motivation, portfolio: portfolio ?? null })
  if (error) throw error
}

export async function getCollaboratorApplications(status?: 'pending' | 'accepted' | 'rejected') {
  const supabase = requireSupabase()
  let query = supabase
    .from('collaborator_applications')
    .select('id,user_id,motivation,portfolio,status,reviewed_by,reviewed_at,created_at,users!collaborator_applications_user_id_fkey(name,username,avatar_url,email)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data } = await query
  return (data ?? []).map(row => {
    const user = row.users as unknown as { name: string | null; username: string | null; avatar_url: string | null; email: string | null } | null
    return {
      id: row.id,
      userId: row.user_id,
      motivation: row.motivation,
      portfolio: row.portfolio ?? null,
      status: row.status as 'pending' | 'accepted' | 'rejected',
      reviewedBy: row.reviewed_by ?? null,
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      user: user ? {
        name: user.name,
        username: user.username,
        avatarUrl: user.avatar_url,
        email: user.email,
      } : null,
    }
  })
}

export async function reviewCollaboratorApplication(
  appId: string,
  status: 'accepted' | 'rejected',
  reviewerId: string,
) {
  const supabase = requireSupabase()

  const { data: app, error: fetchError } = await supabase
    .from('collaborator_applications')
    .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', appId)
    .select('user_id')
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!app) throw new Error('Solicitud no encontrada.')

  if (status === 'accepted') {
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'collaborator' })
      .eq('id', app.user_id)
    if (roleError) throw roleError
  }
}

export async function getUserCollaboratorStatus(userId: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('collaborator_applications')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.status as 'pending' | 'accepted' | 'rejected' | null ?? null
}
