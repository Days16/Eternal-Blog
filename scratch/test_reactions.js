
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testReactions() {
  const kinds = ['magic', 'bright', 'uneasy', 'dreamer']
  const entryId = '00000000-0000-0000-0000-000000000000' 
  const userId = '00000000-0000-0000-0000-000000000000'

  for (const kind of kinds) {
    console.log(`Testing kind: ${kind}...`)
    const { error } = await supabase.from('reactions').insert({
      entry_id: entryId,
      user_id: userId,
      kind
    })
    if (error) {
      console.error(`FAILED for ${kind}:`, error.message)
    } else {
      console.log(`SUCCESS for ${kind}`)
      await supabase.from('reactions').delete().eq('kind', kind).eq('entry_id', entryId)
    }
  }
}

testReactions()
