const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function test() {
  console.log("Fetching schema info for forum_threads...");
  const { data: threadCols, error: err1 } = await supabase
    .from('forum_threads')
    .select('id,title,author_id')
    .limit(1);

  if (err1) {
    console.error("Error fetching forum_threads:", err1);
  } else {
    console.log("forum_threads sample keys:", threadCols);
  }

  // Let's see if we can query pg_tables or information_schema
  const { data: info, error: err2 } = await supabase
    .from('follows')
    .select('follower_id,following_id')
    .limit(1);

  if (err2) {
    console.error("Error fetching follows:", err2);
  } else {
    console.log("follows sample keys:", info);
  }
}

test();
