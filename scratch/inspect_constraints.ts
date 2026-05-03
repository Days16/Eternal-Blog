import { getSupabaseServerClient } from '../lib/supabase/server'

async function inspect() {
  const supabase = getSupabaseServerClient()
  if (!supabase) return

  // Querying pg_constraint which is more reliable in Postgres
  const { data, error } = await supabase.rpc('get_table_constraints', { t_name: 'reactions' })
  
  if (error) {
    // If RPC doesn't exist, try a direct query on pg_catalog if allowed
    const { data: pgData, error: pgError } = await supabase.from('pg_constraint').select('*').limit(1)
    console.log('Direct pg_constraint query:', pgData || pgError)
  } else {
    console.log('Table constraints:', data)
  }
}

inspect()
