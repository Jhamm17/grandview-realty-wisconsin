import { NextRequest, NextResponse } from 'next/server';

// Mark this route as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getAgentListings } from '@/lib/agent-listings';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Convert agent ID to name (this is a simple mapping for now)
    const agentNameMap: { [key: string]: string } = {
      'christopher-lobrillo': 'Christopher Lobrillo',
      'lynda-werner': 'Lynda Werner',
      'chris-clark': 'Chris Clark',
      'randall-glenn': 'Randall Glenn',
      'yolanda-weathers': 'Yolanda Weathers',
      'laura-cook': 'Laura Cook',
      'elias-mondragon': 'Elias Mondragon',
      'david-rodriguez': 'David Rodriguez',
      'stephen-zidek': 'Stephen Zidek',
      'alberto-monarrez': 'Alberto Monarrez',
      'jim-karner': 'Jim Karner',
      'shaun-israel': 'Shaun Israel',
      'katherine-alderfer': 'Katherine Alderfer',
      'adam-turner': 'Adam Turner',
      'sam-tousi': 'Sam Tousi'
    };

    const agentName = agentNameMap[agentId] || agentId;
    const listings = await getAgentListings(agentName);
    
    return NextResponse.json({
      success: true,
      data: listings,
      count: listings.length
    });

  } catch (error) {
    console.error('Error fetching agent listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent listings' },
      { status: 500 }
    );
  }
} 