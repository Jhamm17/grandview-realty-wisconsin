import { createClient } from '@supabase/supabase-js';
import { Property } from './mred/types';

// Lazy-initialize Supabase client to avoid build-time errors
function getSupabaseClient() {
  return createClient(
  process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
  process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
);
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  title: string;
  image_url?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  specialties: string[];
  experience?: string;
  service_area?: string;
  description?: string;
  languages?: string[];
  service_areas?: string[];
  bio?: string;
  achievements?: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CachedAgent {
  agent: Agent;
  listings: Property[];
  last_updated: string;
}

export class AgentCacheService {
  private static CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Get a single agent with their listings from cache
  static async getAgentWithListings(slug: string): Promise<CachedAgent | null> {
    try {
      // For now, always fetch fresh data to debug the listings issue
      console.log(`[AgentCache] Fetching fresh data for agent: ${slug}`);
      return await this.fetchAndCacheAgent(slug);

    } catch (error) {
      console.error('Error in getAgentWithListings:', error);
      return null;
    }
  }

  // Fetch agent data and their listings, then cache it
  private static async fetchAndCacheAgent(slug: string): Promise<CachedAgent | null> {
    try {
      const supabase = getSupabaseClient();
      // Get agent data
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (agentError || !agent) {
        console.error('Error fetching agent:', agentError);
        return null;
      }

      // Get agent's listings
      const listings = await this.getAgentListings(agent.name);

      // Cache the data
      const cacheData = {
        agent_slug: slug,
        agent_data: agent,
        listings_data: listings,
        last_updated: new Date().toISOString()
      };

      // Upsert cache entry
      const { error: cacheError } = await supabase
        .from('agent_cache')
        .upsert(cacheData, { onConflict: 'agent_slug' });

      if (cacheError) {
        console.error('Error caching agent data:', cacheError);
      } else {
        console.log(`[AgentCache] Cached agent data for: ${slug}`);
      }

      return {
        agent,
        listings,
        last_updated: cacheData.last_updated
      };

    } catch (error) {
      console.error('Error in fetchAndCacheAgent:', error);
      return null;
    }
  }

  // Get agent listings from property cache
  private static async getAgentListings(agentName: string): Promise<Property[]> {
    try {
      const supabase = getSupabaseClient();
      console.log(`[AgentCache] Searching for agent: ${agentName}`);
      
      // Get all active properties from cache
      const { data: properties, error: propertiesError } = await supabase
        .from('property_cache')
        .select('property_data')
        .eq('is_active', true);

      if (propertiesError || !properties) {
        console.error('Error fetching properties for agent listings:', propertiesError);
        return [];
      }

      console.log(`[AgentCache] Found ${properties.length} active properties in cache`);

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
              console.log(`[AgentCache] Found name match: ${property.ListAgentFullName} for ${agentName}`);
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
              console.log(`[AgentCache] Found email match: ${property.ListAgentEmail} for ${agentName}`);
              agentListings.push(property);
            }
          }
        } catch (parseError) {
          console.error('Error parsing property data:', parseError);
          continue;
        }
      }

      console.log(`[AgentCache] Properties with agent info: ${propertiesWithAgentInfo}`);
      console.log(`[AgentCache] Found ${agentListings.length} listings for ${agentName}`);

      // Remove duplicates (in case both name and email matched)
      const uniqueListings = agentListings.filter((listing, index, self) => 
        index === self.findIndex(l => l.ListingId === listing.ListingId)
      );

      console.log(`[AgentCache] After deduplication: ${uniqueListings.length} listings`);

      // Sort by modification timestamp (newest first)
      return uniqueListings.sort((a, b) => 
        new Date(b.ModificationTimestamp).getTime() - new Date(a.ModificationTimestamp).getTime()
      );

    } catch (error) {
      console.error('Error in getAgentListings:', error);
      return [];
    }
  }

  // Get all agents (for the agents listing page)
  static async getAllAgents(): Promise<Agent[]> {
    try {
      const supabase = getSupabaseClient();
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }

      return agents || [];
    } catch (error) {
      console.error('Error in getAllAgents:', error);
      return [];
    }
  }

  // Invalidate cache for a specific agent
  static async invalidateAgentCache(slug: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('agent_cache')
        .delete()
        .eq('agent_slug', slug);

      if (error) {
        console.error('Error invalidating agent cache:', error);
      } else {
        console.log(`[AgentCache] Invalidated cache for agent: ${slug}`);
      }
    } catch (error) {
      console.error('Error in invalidateAgentCache:', error);
    }
  }

  // Clear all agent cache
  static async clearAllAgentCache(): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('agent_cache')
        .delete()
        .neq('agent_slug', ''); // Delete all entries

      if (error) {
        console.error('Error clearing agent cache:', error);
      } else {
        console.log('[AgentCache] Cleared all agent cache');
      }
    } catch (error) {
      console.error('Error in clearAllAgentCache:', error);
    }
  }
} 