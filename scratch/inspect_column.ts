import { getSupabaseServerClient } from '../lib/supabase/server'

async function inspect() {
  const supabase = getSupabaseServerClient()
  if (!supabase) return

  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, udt_name')
    .eq('table_name', 'reactions')
    .eq('column_name', 'kind')

  console.log('Column info:', data || error)
}

inspect()
