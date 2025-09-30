const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicates() {
  try {
    console.log('Cleaning up duplicate entries...');

    // Get all office staff
    const { data: officeStaff, error } = await supabase
      .from('office_staff')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching office staff:', error);
      return;
    }

    console.log(`Found ${officeStaff.length} office staff entries`);

    // Group by name to find duplicates
    const groupedByName = {};
    officeStaff.forEach(staff => {
      if (!groupedByName[staff.name]) {
        groupedByName[staff.name] = [];
      }
      groupedByName[staff.name].push(staff);
    });

    // Find and remove duplicates
    for (const [name, entries] of Object.entries(groupedByName)) {
      if (entries.length > 1) {
        console.log(`Found ${entries.length} entries for ${name}`);
        
        // Keep the first entry (oldest), delete the rest
        const toDelete = entries.slice(1);
        
        for (const entry of toDelete) {
          console.log(`Deleting duplicate entry for ${name} (ID: ${entry.id})`);
          
          const { error: deleteError } = await supabase
            .from('office_staff')
            .delete()
            .eq('id', entry.id);
          
          if (deleteError) {
            console.error(`Error deleting entry ${entry.id}:`, deleteError);
          } else {
            console.log(`Successfully deleted entry ${entry.id}`);
          }
        }
      }
    }

    // Also remove Christopher Lobrillo from office_staff since he should only be in agents
    const { data: chrisEntries, error: chrisError } = await supabase
      .from('office_staff')
      .select('*')
      .eq('name', 'Christopher Lobrillo');

    if (chrisError) {
      console.error('Error checking for Christopher Lobrillo:', chrisError);
    } else if (chrisEntries && chrisEntries.length > 0) {
      console.log(`Found ${chrisEntries.length} Christopher Lobrillo entries in office_staff - removing them`);
      
      for (const entry of chrisEntries) {
        const { error: deleteError } = await supabase
          .from('office_staff')
          .delete()
          .eq('id', entry.id);
        
        if (deleteError) {
          console.error(`Error deleting Christopher Lobrillo entry ${entry.id}:`, deleteError);
        } else {
          console.log(`Successfully deleted Christopher Lobrillo entry ${entry.id}`);
        }
      }
    }

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupDuplicates(); 