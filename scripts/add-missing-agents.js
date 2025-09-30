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

async function addMissingAgents() {
  try {
    console.log('Adding missing agents to database...');

    // All agents data based on available images
    const allAgentsData = [
      {
        slug: 'christopher-lobrillo',
        name: 'Christopher Lobrillo',
        title: 'Managing Broker & Managing Partner',
        image_url: '/agents/chris-lobrillo-logo.png',
        logo_url: '/agents/chris-lobrillo-logo.png',
        phone: '630-802-4411',
        email: 'chris@grandviewsells.com',
        specialties: ['Business Growth & Development', 'Agent Mentorship & Development', 'Brokerage Oversight & Compliance', 'REO Specialist', 'Corporate Closings'],
        experience: '20+ years',
        service_area: 'Chicagoland',
        description: 'Christopher Lobrillo is Co-Founder and Owner of Grandview Realty, bringing over 20 years of experience and more than 3,700 closed transactions across residential, REO, and corporate real estate.',
        sort_order: 1,
        is_active: true
      },
      {
        slug: 'lynda-werner',
        name: 'Lynda Werner',
        title: 'Operations Manager | Licensed Real Estate Agent',
        image_url: '/agents/lynda-werner-logo.png',
        logo_url: '/agents/lynda-werner-logo.png',
        phone: '630-402-6382',
        email: 'lynda@grandviewsells.com',
        specialties: ['Real Estate Operations', 'Administrative Oversight', 'Real Estate Compliance', 'REO Management', 'Agent Support and Development', 'Office Management'],
        experience: '20+ years',
        service_area: 'Chicagoland',
        description: 'With over 20 years in real estate, Lynda Werner serves as Operations Manager at Grandview Realty, where she brings deep expertise in collections, foreclosure, REO, and mortgage auditing.',
        sort_order: 2,
        is_active: true
      },
      {
        slug: 'chris-clark',
        name: 'Chris Clark',
        title: 'Managing Broker',
        image_url: '/agents/chris-clark.png',
        logo_url: '/agents/chris-clark-logo.png',
        phone: '630-973-7825',
        email: 'chris.clark@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Investors'],
        experience: '20+ years',
        service_area: 'Chicagoland and West Suburbs',
        description: 'Chris Clark launched his real estate career in 2003, and is passionate about helping people achieve their real estate goals by leveraging data, technology and wow service.',
        sort_order: 3,
        is_active: true
      },
      {
        slug: 'randall-glenn',
        name: 'Randall Glenn',
        title: 'Agent',
        image_url: '/agents/randall-glenn.png',
        logo_url: '/agents/randall-glenn-logo.png',
        phone: '312-752-7415',
        email: 'randall@grandviewsells.com',
        specialties: ['Sellers', 'Investors'],
        experience: '5+ years',
        service_area: 'Chicago and South Suburbs',
        description: 'Randall works primarily in the Chicagoland area, and he is extremely diligent to consistently provide his clients with the utmost transparency, professionalism, and respect.',
        sort_order: 4,
        is_active: true
      },
      {
        slug: 'yolanda-weathers',
        name: 'Yolanda Weathers',
        title: 'Agent',
        image_url: '/agents/yolanda-weathers.png',
        logo_url: '/agents/yolanda-weathers-logo.png',
        phone: '773-817-6829',
        email: 'yolanda@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Investors'],
        experience: '10+ years',
        service_area: 'Chicago and West Suburbs',
        description: 'Yolanda has been working in real estate for over 10 years. She is diligent and hardworking and willing to do what\'s necessary to get the job done.',
        sort_order: 5,
        is_active: true
      },
      {
        slug: 'adam-turner',
        name: 'Adam Turner',
        title: 'Agent',
        image_url: '/agents/adam-turner.jpeg',
        logo_url: '/agents/adam-turner-logo.png',
        phone: '630-555-0123',
        email: 'adam@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'First-Time Homebuyers'],
        experience: '8+ years',
        service_area: 'West Suburbs',
        description: 'Adam specializes in helping first-time homebuyers navigate the complex real estate market with patience and expertise.',
        sort_order: 6,
        is_active: true
      },
      {
        slug: 'sam-tousi',
        name: 'Sam Tousi',
        title: 'Agent',
        image_url: '/agents/sam-tousi.png',
        logo_url: '/agents/sam-tousi-logo.png',
        phone: '630-555-0124',
        email: 'sam@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Luxury Homes'],
        experience: '12+ years',
        service_area: 'North Suburbs',
        description: 'Sam specializes in luxury properties and provides exceptional service to high-end clients.',
        sort_order: 7,
        is_active: true
      },
      {
        slug: 'elias-mondragon',
        name: 'Elias Mondragon',
        title: 'Agent',
        image_url: '/agents/elias-mondragon.png',
        logo_url: '/agents/elias-mondragon-logo.png',
        phone: '630-555-0125',
        email: 'elias@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Investment Properties'],
        experience: '6+ years',
        service_area: 'South Suburbs',
        description: 'Elias focuses on investment properties and helps clients build their real estate portfolios.',
        sort_order: 8,
        is_active: true
      },
      {
        slug: 'laura-cook',
        name: 'Laura Cook',
        title: 'Agent',
        image_url: '/agents/laura-cook.png',
        logo_url: '/agents/laura-cook-logo.png',
        phone: '630-555-0126',
        email: 'laura@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Relocation'],
        experience: '15+ years',
        service_area: 'Chicagoland',
        description: 'Laura specializes in relocation services and helps families transition smoothly to new homes.',
        sort_order: 9,
        is_active: true
      },
      {
        slug: 'katherine-alderfer',
        name: 'Katherine Alderfer',
        title: 'Agent',
        image_url: '/agents/katherine-alderfer.png',
        logo_url: '/agents/katherine-alderfer-logo.png',
        phone: '630-555-0127',
        email: 'katherine@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'New Construction'],
        experience: '9+ years',
        service_area: 'West Suburbs',
        description: 'Katherine specializes in new construction and helps clients navigate the building process.',
        sort_order: 10,
        is_active: true
      },
      {
        slug: 'david-rodriguez',
        name: 'David Rodriguez',
        title: 'Agent',
        image_url: '/agents/david-rodriguez.png',
        logo_url: '/agents/david-rodriguez-logo.png',
        phone: '630-555-0128',
        email: 'david@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Commercial'],
        experience: '11+ years',
        service_area: 'Chicagoland',
        description: 'David specializes in commercial real estate and helps businesses find their perfect location.',
        sort_order: 11,
        is_active: true
      },
      {
        slug: 'shaun-israel',
        name: 'Shaun Israel',
        title: 'Agent',
        image_url: '/agents/shaun-israel.png',
        logo_url: '/agents/shaun-israel-logo.png',
        phone: '630-555-0129',
        email: 'shaun@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Short Sales'],
        experience: '7+ years',
        service_area: 'South Suburbs',
        description: 'Shaun specializes in short sales and helps clients navigate difficult financial situations.',
        sort_order: 12,
        is_active: true
      },
      {
        slug: 'martha-torres',
        name: 'Martha Torres',
        title: 'Agent',
        image_url: '/agents/martha-torres.png',
        logo_url: '/agents/martha-torres-logo.png',
        phone: '630-555-0130',
        email: 'martha@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Multilingual'],
        experience: '13+ years',
        service_area: 'Chicagoland',
        description: 'Martha provides bilingual services and helps Spanish-speaking clients achieve their real estate goals.',
        sort_order: 13,
        is_active: true
      },
      {
        slug: 'jim-karner',
        name: 'Jim Karner',
        title: 'Agent',
        image_url: '/agents/jim-karner.png',
        logo_url: '/agents/jim-karner-logo.png',
        phone: '630-555-0131',
        email: 'jim@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Senior Housing'],
        experience: '18+ years',
        service_area: 'North Suburbs',
        description: 'Jim specializes in senior housing and helps families find the perfect home for their loved ones.',
        sort_order: 14,
        is_active: true
      },
      {
        slug: 'alberto-monarrez',
        name: 'Alberto Monarrez',
        title: 'Agent',
        image_url: '/agents/alberto-monarrez.png',
        logo_url: '/agents/alberto-monarrez-logo.png',
        phone: '630-555-0132',
        email: 'alberto@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Investment Properties'],
        experience: '5+ years',
        service_area: 'West Suburbs',
        description: 'Alberto focuses on investment properties and helps clients build wealth through real estate.',
        sort_order: 15,
        is_active: true
      },
      {
        slug: 'stephen-zidek',
        name: 'Stephen Zidek',
        title: 'Agent',
        image_url: '/agents/stephen-zidek.png',
        logo_url: '/agents/stephen-zidek-logo.png',
        phone: '630-555-0133',
        email: 'stephen@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Luxury Homes'],
        experience: '14+ years',
        service_area: 'North Suburbs',
        description: 'Stephen specializes in luxury properties and provides exceptional service to discerning clients.',
        sort_order: 16,
        is_active: true
      }
    ];

    for (const agent of allAgentsData) {
      const { error } = await supabase
        .from('agents')
        .upsert(agent, { onConflict: 'slug' });
      
      if (error) {
        console.error(`Error inserting agent ${agent.name}:`, error);
      } else {
        console.log(`✓ Inserted/Updated agent: ${agent.name} (${agent.slug})`);
      }
    }

    console.log('\nAll agents have been added to the database!');

  } catch (error) {
    console.error('Error during operation:', error);
  }
}

addMissingAgents(); 