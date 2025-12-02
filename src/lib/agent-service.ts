import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
  process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
);

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
  is_active: boolean;
  sort_order: number;
}

export async function getAgentByNameOrEmail(nameOrEmail: string): Promise<Agent | null> {
  try {
    // First try to find by exact email match
    const { data: emailMatch, error: emailError } = await supabase
      .from('agents')
      .select('*')
      .eq('email', nameOrEmail)
      .single();

    if (emailMatch && !emailError) {
      return emailMatch;
    }

    // If no email match, try to find by name (case-insensitive partial match)
    const { data: nameMatches, error: nameError } = await supabase
      .from('agents')
      .select('*')
      .ilike('name', `%${nameOrEmail}%`);

    if (nameMatches && nameMatches.length > 0 && !nameError) {
      // Return the first match (most likely the best match)
      return nameMatches[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching agent:', error);
    return null;
  }
} 