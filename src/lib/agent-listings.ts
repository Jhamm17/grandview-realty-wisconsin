import { createClient } from '@supabase/supabase-js';
import { Property } from './mred/types';

// Lazy-initialize Supabase client to avoid build-time errors
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
    process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface AgentListing {
  property: Property;
  agentId: string;
  agentName: string;
}

export async function getAgentListings(agentName: string): Promise<Property[]> {
  try {
    const supabase = getSupabaseClient();
    console.log(`[AgentListings] Searching for agent: ${agentName}`);
    
    // Get all active properties from cache
    const { data: properties, error: propertiesError } = await supabase
      .from('property_cache')
      .select('property_data')
      .eq('is_active', true);

    if (propertiesError || !properties) {
      console.error('Error fetching properties:', propertiesError);
      return [];
    }

    console.log(`[AgentListings] Found ${properties.length} active properties in cache`);

    // Parse the cached property data and filter by agent name
    const agentListings: Property[] = [];
    let propertiesWithAgentInfo = 0;
    
    // Create name variations for better matching
    const nameVariations = [
      agentName.toLowerCase(),
      agentName.toLowerCase().replace('chris', 'christopher'),
      agentName.toLowerCase().replace('christopher', 'chris'),
      agentName.toLowerCase().replace('steve', 'stephen'),
      agentName.toLowerCase().replace('stephen', 'steve')
    ];
    
    for (const cacheEntry of properties) {
      try {
        const property: Property = cacheEntry.property_data;
        
        // Count properties with agent info for debugging
        if (property.ListAgentFullName || property.ListAgentEmail) {
          propertiesWithAgentInfo++;
        }
        
        // Match agent by name variations (case-insensitive)
        if (property.ListAgentFullName) {
          const propertyAgentName = property.ListAgentFullName.toLowerCase();
          const nameMatch = nameVariations.some(variation => 
            propertyAgentName.includes(variation) || variation.includes(propertyAgentName)
          );
          
          if (nameMatch) {
            console.log(`[AgentListings] Found name match: ${property.ListAgentFullName} for ${agentName}`);
            agentListings.push(property);
            continue; // Skip email check if name already matched
          }
        }
        
        // Also try matching by email if available
        if (property.ListAgentEmail) {
          const propertyEmail = property.ListAgentEmail.toLowerCase();
          const emailMatch = nameVariations.some(variation => 
            propertyEmail.includes(variation) || propertyEmail.includes(agentName.toLowerCase())
          );
          
          if (emailMatch) {
            console.log(`[AgentListings] Found email match: ${property.ListAgentEmail} for ${agentName}`);
            agentListings.push(property);
          }
        }
      } catch (parseError) {
        console.error('Error parsing property data:', parseError);
        continue;
      }
    }

    console.log(`[AgentListings] Properties with agent info: ${propertiesWithAgentInfo}`);
    console.log(`[AgentListings] Found ${agentListings.length} listings for ${agentName}`);

    // Remove duplicates (in case both name and email matched)
    const uniqueListings = agentListings.filter((listing, index, self) => 
      index === self.findIndex(l => l.ListingId === listing.ListingId)
    );

    console.log(`[AgentListings] After deduplication: ${uniqueListings.length} listings`);

    // Sort by modification timestamp (newest first)
    return uniqueListings.sort((a, b) => 
      new Date(b.ModificationTimestamp).getTime() - new Date(a.ModificationTimestamp).getTime()
    );

  } catch (error) {
    console.error('Error in getAgentListings:', error);
    return [];
  }
}

export async function getAllAgentListings(): Promise<Map<string, Property[]>> {
  try {
    const supabase = getSupabaseClient();
    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, email');

    if (agentsError || !agents) {
      console.error('Error fetching agents:', agentsError);
      return new Map();
    }

    // Get all active properties
    const { data: properties, error: propertiesError } = await supabase
      .from('property_cache')
      .select('property_data')
      .eq('is_active', true);

    if (propertiesError || !properties) {
      console.error('Error fetching properties:', propertiesError);
      return new Map();
    }

    const agentListingsMap = new Map<string, Property[]>();

    // Initialize empty arrays for all agents
    agents.forEach(agent => {
      agentListingsMap.set(agent.id, []);
    });

    // Parse properties and match to agents
    for (const cacheEntry of properties) {
      try {
        const property: Property = cacheEntry.property_data;
        
        if (!property.ListAgentFullName) continue;

        // Find matching agent
        for (const agent of agents) {
          const agentNameMatch = property.ListAgentFullName.toLowerCase().includes(agent.name.toLowerCase());
          const agentEmailMatch = property.ListAgentEmail && 
            property.ListAgentEmail.toLowerCase() === agent.email.toLowerCase();

          if (agentNameMatch || agentEmailMatch) {
            const currentListings = agentListingsMap.get(agent.id) || [];
            currentListings.push(property);
            agentListingsMap.set(agent.id, currentListings);
            break; // Only assign to first matching agent
          }
        }
      } catch (parseError) {
        console.error('Error parsing property data:', parseError);
        continue;
      }
    }

    // Sort listings for each agent by modification timestamp
    for (const [agentId, listings] of agentListingsMap) {
      const sortedListings = listings.sort((a, b) => 
        new Date(b.ModificationTimestamp).getTime() - new Date(a.ModificationTimestamp).getTime()
      );
      agentListingsMap.set(agentId, sortedListings);
    }

    return agentListingsMap;

  } catch (error) {
    console.error('Error in getAllAgentListings:', error);
    return new Map();
  }
} 