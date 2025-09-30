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

async function fixImagePaths() {
  try {
    console.log('Fixing image paths in database...');

    // Fix agents image paths
    const agentUpdates = [
      {
        slug: 'christopher-lobrillo',
        image_url: '/agents/chris-lobrillo-logo.png', // Use logo instead of missing image
        logo_url: '/agents/chris-lobrillo-logo.png'
      },
      {
        slug: 'lynda-werner',
        image_url: '/agents/lynda-werner-logo.png', // Use logo instead of missing image
        logo_url: '/agents/lynda-werner-logo.png'
      }
    ];

    for (const update of agentUpdates) {
      const { error } = await supabase
        .from('agents')
        .update(update)
        .eq('slug', update.slug);
      
      if (error) {
        console.error(`Error updating agent ${update.slug}:`, error);
      } else {
        console.log(`✓ Updated agent: ${update.slug}`);
      }
    }

    // Fix office staff image paths
    const staffUpdates = [
      {
        name: 'Christopher Lobrillo',
        image_url: '/agents/chris-lobrillo-logo.png'
      },
      {
        name: 'Lynda Werner',
        image_url: '/agents/lynda-werner-logo.png'
      },
      {
        name: 'Christopher Clark',
        image_url: '/agents/chris-clark.png'
      },
      {
        name: 'Michael Jostes',
        image_url: '/michaeljostes.png'
      },
      {
        name: 'Cailida Werner',
        image_url: '/cailidawerner.jpeg'
      },
      {
        name: 'Anastasiya Voznyuk',
        image_url: '/anastasiyavoznyuk.png'
      }
    ];

    for (const update of staffUpdates) {
      const { error } = await supabase
        .from('office_staff')
        .update(update)
        .eq('name', update.name);
      
      if (error) {
        console.error(`Error updating staff ${update.name}:`, error);
      } else {
        console.log(`✓ Updated staff: ${update.name}`);
      }
    }

    console.log('Image paths fixed successfully!');

  } catch (error) {
    console.error('Error fixing image paths:', error);
    process.exit(1);
  }
}

// Run the fix
fixImagePaths(); 