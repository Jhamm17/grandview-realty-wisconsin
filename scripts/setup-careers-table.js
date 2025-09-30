const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCareersTable() {
  try {
    console.log('Setting up careers table...');
    
    // Insert sample data directly (table will be created via SQL file)
    const sampleCareers = [
      {
        title: "Real Estate Agent",
        type: "Full-time",
        location: "Chicago Metropolitan Area",
        description: "Join our team of dedicated real estate professionals. We're looking for motivated agents who are passionate about helping clients find their perfect home.",
        requirements: ["Real Estate License", "2+ years experience", "Strong communication skills"],
        benefits: ["Competitive commission", "Training & mentorship", "Marketing support"],
        salary_range: "Commission-based",
        sort_order: 1
      },
      {
        title: "Marketing Coordinator",
        type: "Full-time",
        location: "Geneva, IL",
        description: "Support our marketing initiatives across digital and traditional channels. Help showcase our properties and build our brand presence.",
        requirements: ["Bachelor's degree in Marketing", "1+ years experience", "Social media expertise"],
        benefits: ["Health insurance", "Paid time off", "Professional development"],
        salary_range: "$40,000 - $50,000",
        sort_order: 2
      },
      {
        title: "Transaction Coordinator",
        type: "Full-time",
        location: "Geneva, IL",
        description: "Manage real estate transactions from contract to closing. Ensure smooth processes and excellent client communication.",
        requirements: ["Real Estate experience", "Attention to detail", "Customer service skills"],
        benefits: ["Health insurance", "401(k)", "Flexible schedule"],
        salary_range: "$35,000 - $45,000",
        sort_order: 3
      }
    ];
    
    const { data: insertData, error: insertError } = await supabase
      .from('careers')
      .upsert(sampleCareers, { onConflict: 'title' });
    
    if (insertError) {
      console.error('Error inserting sample careers:', insertError);
      console.log('This might be because the table doesn\'t exist yet. Please run the SQL setup first.');
      return;
    }
    
    console.log('✅ Sample careers data inserted successfully');
    console.log('Inserted careers:', insertData);
    
    // Verify the data
    const { data: careers, error: selectError } = await supabase
      .from('careers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (selectError) {
      console.error('Error fetching careers:', selectError);
      return;
    }
    
    console.log(`\nTotal active careers: ${careers.length}`);
    careers.forEach((career, index) => {
      console.log(`${index + 1}. ${career.title} (${career.type}) - ${career.location} - sort_order: ${career.sort_order}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupCareersTable(); 