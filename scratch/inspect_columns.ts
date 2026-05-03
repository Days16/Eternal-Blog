
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectColumns() {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching sample row:', error)
  } else if (data && data.length > 0) {
    console.log('Columns in reactions table:', Object.keys(data[0]))
  } else {
    console.log('No rows in reactions table to inspect columns.')
    // Try to insert a dummy one to see what fails or just fetch metadata if possible
    // But select('*') usually works even if 0 rows.
  }
}

inspectColumns()
