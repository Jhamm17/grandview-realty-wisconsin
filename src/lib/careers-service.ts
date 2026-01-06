import { createClient } from '@supabase/supabase-js';

// Lazy-initialize Supabase client to avoid build-time errors
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
    process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface Career {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_range?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export class CareersService {
  // Get all active careers (for the careers listing page)
  static async getAllCareers(): Promise<Career[]> {
    try {
      const supabase = getSupabaseClient();
      const { data: careers, error } = await supabase
        .from('careers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching careers:', error);
        return [];
      }

      return careers || [];
    } catch (error) {
      console.error('Error in getAllCareers:', error);
      return [];
    }
  }
}

