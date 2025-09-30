const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAgents() {
  try {
    console.log('Checking agents database...');

    // Get all agents with exact sort_order values
    const { data: allAgents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching agents:', error);
      return;
    }

    console.log(`\nTotal active agents: ${allAgents.length}`);
    console.log('\nAgents by sort_order:');
    allAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.title}) - sort_order: ${agent.sort_order} - slug: ${agent.slug} - ID: ${agent.id}`);
    });

  } catch (error) {
    console.error('Error during debug:', error);
  }
}

checkAgents(); 