import { getSupabaseServerClient } from '../lib/supabase/server'

async function inspect() {
  const supabase = getSupabaseServerClient()
  if (!supabase) {
    console.error('No supabase client')
    return
  }

  console.log('Inspecting reactions table...')
  const { data, error } = await supabase.from('reactions').select('kind')
  
  if (error) {
    console.error('Error selecting from reactions:', error)
  } else {
    console.log('Existing reaction kinds:', [...new Set(data.map(r => r.kind))])
  }

  // Verificar si un usuario existe
  const kinds = ['magic', 'dreamy', 'shine', 'glow', 'void', 'hollow', 'light', 'dark']
  const devId = '1bb60a30-8e3a-40d2-9495-ecfbe5c21d4b'
  const entryId = '3671f11b-7033-4781-9952-4592a8e8f810' // Necesito un ID de entrada real
  
  // Buscar una entrada real
  const { data: entries } = await supabase.from('entries').select('id').limit(1)
  const realEntryId = entries?.[0]?.id

  for (const k of kinds) {
    const trial = await supabase.from('reactions').insert({
      entry_id: realEntryId,
      user_id: devId,
      kind: k
    })
    if (trial.error) {
      console.log(`Kind "${k}" FAILED:`, trial.error.message)
    } else {
      console.log(`Kind "${k}" SUCCESS`)
      await supabase.from('reactions').delete().eq('kind', k).eq('user_id', devId).eq('entry_id', realEntryId)
    }
  }
}

inspect()
