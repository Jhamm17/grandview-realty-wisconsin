const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeMarthaTorres() {
  try {
    console.log('Removing Martha Torres from agents database...');
    
    // Delete Martha Torres by ID
    const { data, error } = await supabase
      .from('agents')
      .delete()
      .eq('id', 'ae9539e6-20f3-4ab9-970d-062027208a44');
    
    if (error) {
      console.error('Error removing Martha Torres:', error);
      return;
    }
    
    console.log('✅ Martha Torres successfully removed from agents database');
    console.log('Deleted record:', data);
    
    // Verify removal
    const { data: remainingAgents, error: checkError } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (checkError) {
      console.error('Error checking remaining agents:', checkError);
      return;
    }
    
    console.log(`\nRemaining active agents: ${remainingAgents.length}`);
    remainingAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.title}) - sort_order: ${agent.sort_order}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

removeMarthaTorres(); 