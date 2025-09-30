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

async function checkOfficeStaff() {
  try {
    console.log('Checking office staff database...');

    // Get all office staff (no filters)
    const { data: allStaff, error } = await supabase
      .from('office_staff')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching office staff:', error);
      return;
    }

    console.log(`\nTotal office staff entries: ${allStaff.length}`);
    console.log('\nAll entries:');
    allStaff.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.name} (${staff.title}) - Active: ${staff.is_active} - ID: ${staff.id}`);
    });

    // Get only active office staff
    const { data: activeStaff, error: activeError } = await supabase
      .from('office_staff')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (activeError) {
      console.error('Error fetching active office staff:', activeError);
      return;
    }

    console.log(`\nActive office staff entries: ${activeStaff.length}`);
    console.log('\nActive entries:');
    activeStaff.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.name} (${staff.title}) - ID: ${staff.id}`);
    });

  } catch (error) {
    console.error('Error during check:', error);
  }
}

checkOfficeStaff(); 