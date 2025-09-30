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

async function debugOfficeStaff() {
  try {
    console.log('Debugging office staff database...');

    // Get all office staff with exact sort_order values
    const { data: allStaff, error } = await supabase
      .from('office_staff')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching office staff:', error);
      return;
    }

    console.log(`\nTotal active office staff: ${allStaff.length}`);
    console.log('\nOffice staff by sort_order:');
    allStaff.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.name} - sort_order: ${staff.sort_order} - ID: ${staff.id}`);
    });

    // Check if Christopher Lobrillo exists
    const { data: chris, error: chrisError } = await supabase
      .from('office_staff')
      .select('*')
      .eq('name', 'Christopher Lobrillo');

    if (chrisError) {
      console.error('Error checking for Christopher Lobrillo:', chrisError);
    } else {
      console.log(`\nChristopher Lobrillo entries: ${chris.length}`);
      chris.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.name} - sort_order: ${entry.sort_order} - is_active: ${entry.is_active} - ID: ${entry.id}`);
      });
    }

  } catch (error) {
    console.error('Error during debug:', error);
  }
}

debugOfficeStaff(); 