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

async function fixOfficeStaffOrder() {
  try {
    console.log('Fixing office staff order and removing test entry...');

    // Remove the test entry
    const { error: deleteError } = await supabase
      .from('office_staff')
      .delete()
      .eq('name', 'Test');

    if (deleteError) {
      console.error('Error deleting test entry:', deleteError);
    } else {
      console.log('Successfully removed test entry');
    }

    // Update sort orders for proper display
    const sortOrderUpdates = [
      { name: 'Christopher Lobrillo', sort_order: 1 },
      { name: 'Lynda Werner', sort_order: 2 },
      { name: 'Christopher Clark', sort_order: 3 },
      { name: 'Michael Jostes', sort_order: 4 },
      { name: 'Cailida Werner', sort_order: 5 },
      { name: 'Anastasiya Voznyuk', sort_order: 6 }
    ];

    for (const update of sortOrderUpdates) {
      const { error: updateError } = await supabase
        .from('office_staff')
        .update({ sort_order: update.sort_order })
        .eq('name', update.name);

      if (updateError) {
        console.error(`Error updating ${update.name}:`, updateError);
      } else {
        console.log(`Updated ${update.name} sort order to ${update.sort_order}`);
      }
    }

    console.log('Office staff order fixed successfully!');

  } catch (error) {
    console.error('Error during operation:', error);
  }
}

fixOfficeStaffOrder(); 