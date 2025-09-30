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

async function addChrisBack() {
  try {
    console.log('Adding Christopher Lobrillo back to office staff...');

    // Check if he already exists in office staff
    const { data: existingStaff, error: checkError } = await supabase
      .from('office_staff')
      .select('*')
      .eq('name', 'Christopher Lobrillo');

    if (checkError) {
      console.error('Error checking for existing Christopher Lobrillo:', checkError);
      return;
    }

    if (existingStaff && existingStaff.length > 0) {
      console.log('Christopher Lobrillo already exists in office staff');
      return;
    }

    // Add Christopher Lobrillo to office staff
    const { data: newStaff, error: insertError } = await supabase
      .from('office_staff')
      .insert([
        {
          name: 'Christopher Lobrillo',
          title: 'Managing Broker & Managing Partner',
          image_url: '/agents/chris-lobrillo-logo.png',
          phone: '630-802-4411',
          email: 'chris@grandviewsells.com',
          responsibilities: [
            'Business Growth & Development',
            'Agent Mentorship & Development',
            'Brokerage Oversight & Compliance',
            'REO Specialist',
            'Corporate Closings'
          ],
          experience: '20+ years',
          description: 'Christopher Lobrillo is Co-Founder and Owner of Grandview Realty, bringing over 20 years of experience and more than 3,700 closed transactions across residential, REO, and corporate real estate. A former partner on Kane County\'s top RE/MAX team, he now leads Grandview\'s growth, operations, and agent development. Known for his strategic vision and hands-on leadership, Christopher is committed to building a high-performing, agent-focused brokerage.',
          is_active: true,
          sort_order: 1
        }
      ])
      .select();

    if (insertError) {
      console.error('Error adding Christopher Lobrillo:', insertError);
      return;
    }

    console.log('Successfully added Christopher Lobrillo back to office staff');
    console.log('New staff member:', newStaff[0]);

  } catch (error) {
    console.error('Error during operation:', error);
  }
}

addChrisBack(); 