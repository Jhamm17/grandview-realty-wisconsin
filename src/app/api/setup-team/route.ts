import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Setting up team database...');

    // Insert sample agents data
    console.log('Inserting sample agents data...');
    const agentsData = [
      {
        slug: 'christopher-lobrillo',
        name: 'Christopher Lobrillo',
        title: 'Managing Broker & Managing Partner',
        image_url: '/agents/chris-lobrillo-logo.png',
        logo_url: '/agents/chris-lobrillo-logo.png',
        phone: '630-802-4411',
        email: 'chris@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Investors', 'REO', 'Corporate'],
        experience: '20+ years',
        service_area: 'Chicago and Surrounding Suburbs',
        description: 'Christopher Lobrillo brings over 20 years of experience in the real estate industry and serves as Owner and Managing Broker of Grandview Realty. He is actively involved in guiding the firm\'s growth, operations, and agent mentorship programs. Before co-founding Grandview Realty, Christopher was a partner on the top-performing real estate team in Kane County, Illinois, under the RE/MAX brand. Over the course of his career, he has successfully closed more than 3,700 transactions, covering residential, REO, and corporate properties. Known for his strategic insight and hands-on leadership, Christopher is passionate about business development and supporting agents as they build thriving careers.',
        sort_order: 1
      },
      {
        slug: 'lynda-werner',
        name: 'Lynda Werner',
        title: 'Operations Manager | Licensed Real Estate Agent',
        image_url: '/agents/lynda-werner-logo.png',
        logo_url: '/agents/lynda-werner-logo.png',
        phone: '630-402-6382',
        email: 'lynda@grandviewsells.com',
        specialties: ['Buyers', 'Sellers', 'Operations', 'REO'],
        experience: '20+ years',
        service_area: 'Chicago and Surrounding Suburbs',
        description: 'With over 20 years of experience in the real estate industry, Lynda Werner brings a wealth of knowledge and operational expertise to her role as Operations Manager at Grandview Realty. Her diverse background spans real estate collections, foreclosure, bankruptcy, REO management, and mortgage auditing—providing her with a comprehensive understanding of the industry from every angle. At Grandview Realty, Lynda oversees the administrative and support staff, ensuring smooth day-to-day operations and seamless service for agents and clients alike. She is deeply committed to fostering professional growth and encouraging continuous development among team members.',
        sort_order: 2
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
        description: 'Chris Clark launched his real estate career in 2003, and is passionate about helping people achieve their real estate goals by leveraging data, technology and wow service to create raving fans and customers for life. In April, 2021, Chris partnered with Grandview Realty as their Sales Manager to drive growth in the brokerage by increasing transactions, adding agents and growing his personal real estate business under the Clark Home Team banner.',
        sort_order: 3
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
        experience: null,
        service_area: 'Chicago and South Suburbs',
        description: 'Randall works primarily in the Chicagoland area, and he is extremely diligent to consistently provide his clients with the utmost transparency, professionalism, and respect.',
        sort_order: 4
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
        description: 'Yolanda has been working in real estate for over 10 years. She is diligent and hardworking and willing to do what\'s necessary to get the job done. She can work with first-time buyers and sellers, investors, renters, landlords, etc. Whether it\'s residential, investment or commercial – she is the one for the job!',
        sort_order: 5
      }
    ];

    for (const agent of agentsData) {
      const { error } = await supabase
        .from('agents')
        .upsert(agent, { onConflict: 'slug' });
      
      if (error) {
        console.error(`Error inserting agent ${agent.name}:`, error);
      } else {
        console.log(`✓ Inserted agent: ${agent.name}`);
      }
    }

    // Insert sample office staff data
    console.log('Inserting sample office staff data...');
    const officeStaffData = [
      {
        name: 'Christopher Lobrillo',
        title: 'Managing Broker & Managing Partner',
        image_url: '/agents/chris-lobrillo-logo.png',
        phone: '630-802-4411',
        email: 'chris@grandviewsells.com',
        responsibilities: ['Business Growth & Development', 'Agent Mentorship & Development', 'Brokerage Oversight & Compliance', 'REO Specialist', 'Corporate Closings'],
        experience: '20+ years',
        description: 'Christopher Lobrillo is Co-Founder and Owner of Grandview Realty, bringing over 20 years of experience and more than 3,700 closed transactions across residential, REO, and corporate real estate. A former partner on Kane County\'s top RE/MAX team, he now leads Grandview\'s growth, operations, and agent development. Known for his strategic vision and hands-on leadership, Christopher is committed to building a high-performing, agent-focused brokerage.',
        sort_order: 1
      },
      {
        name: 'Lynda Werner',
        title: 'Operations Manager | Licensed Real Estate Agent',
        image_url: '/agents/lynda-werner-logo.png',
        phone: '630-402-6382',
        email: 'lynda@grandviewsells.com',
        responsibilities: ['Real Estate Operations', 'Administrative Oversight', 'Real Estate Compliance', 'REO Management', 'Agent Support and Development', 'Office Management'],
        experience: '20+ years',
        description: 'With over 20 years in real estate, Lynda Werner serves as Operations Manager at Grandview Realty, where she brings deep expertise in collections, foreclosure, REO, and mortgage auditing. She leads the administrative team, ensuring smooth operations and top-tier support for agents and clients. A licensed real estate agent herself, Lynda bridges operations with front-line insight, all while fostering growth and development across the team.',
        sort_order: 2
      },
      {
        name: 'Christopher Clark',
        title: 'Managing Broker',
        image_url: '/agents/chris-clark.png',
        phone: '630-973-7825',
        email: 'chris@clarkhometeam.com',
        responsibilities: ['Agent Leadership & Support', 'Compliance & Contract Oversight', 'Training & Mentorship', 'Business Development', 'Recruiting & Retention'],
        experience: '20+ years',
        description: 'Chris Clark, Managing Broker at Grandview Realty, has been a driving force in the firm\'s growth since joining in 2021. With a real estate career dating back to 2003, Chris leads expansion efforts through agent development, strategic planning, and production under his Clark Home Team brand. Known for blending market expertise with tech and high-touch service, his leadership and vision continue to elevate the entire organization.',
        sort_order: 3
      },
      {
        name: 'Michael Jostes',
        title: 'Transaction Coordinator',
        image_url: '/michaeljostes.png',
        phone: '630-402-6462',
        email: 'michael@grandviewsells.com',
        responsibilities: ['Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 'File Organization & Audit Prep'],
        experience: '1+ years',
        description: 'Michael ensures all transactions progress seamlessly from contract to close. As our dedicated Transaction Coordinator, he manages timelines, coordinates with all parties involved, and ensures every document is accurate and submitted on time. His deep knowledge of real estate processes and attention to detail are invaluable to keeping our deals on track and our clients well-supported throughout every step.',
        sort_order: 4
      },
      {
        name: 'Cailida Werner',
        title: 'Senior Transaction Coordinator',
        image_url: '/cailidawerner.jpeg',
        phone: '630-480-4347',
        email: 'cailida@grandviewsells.com',
        responsibilities: ['Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 'File Organization & Audit Prep'],
        experience: '6+ years',
        description: 'Cailida is our Senior Transaction Coordinator and has been an integral part of our team for over six years. With a sharp eye for detail and a deep understanding of the real estate process, she oversees each transaction from start to finish—ensuring nothing falls through the cracks. Her experience allows her to anticipate potential issues before they arise, keeping everything on track and our clients informed every step of the way. Her dedication and expertise make her a true backbone of our operations.',
        sort_order: 5
      },
      {
        name: 'Anastasiya Voznyuk',
        title: 'Listing Coordinator & Social Media Manager',
        image_url: '/anastasiyavoznyuk.png',
        phone: '630-402-6285',
        email: 'anastasiya@grandviewsells.com',
        responsibilities: ['MLS Data Entry & Verification', 'Detailed Audits & Compliance', 'Reporting: Feedback, Scrubs, Pricing, MLS Data Reports', 'Designing and Producing Marketing Material'],
        experience: '4+ years',
        description: 'Anastasiya brings four years of experience in real estate, combining her background in transaction coordination with her expertise in managing the listing process. She ensures exceptional accuracy and compliance across all platforms, overseeing listing preparation and audits with great attention to detail. Additionally, Anastasiya leads creative digital marketing initiatives, producing engaging content that boosts brand visibility and drives meaningful lead engagement.',
        sort_order: 6
      }
    ];

    for (const staff of officeStaffData) {
      const { error } = await supabase
        .from('office_staff')
        .upsert(staff, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error inserting staff ${staff.name}:`, error);
      } else {
        console.log(`✓ Inserted staff: ${staff.name}`);
      }
    }

    console.log('Team database setup completed!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team database setup completed successfully' 
    });

  } catch (error) {
    console.error('Error setting up team database:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to set up team database' 
    }, { status: 500 });
  }
} 