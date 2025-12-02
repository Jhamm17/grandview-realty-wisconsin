// Supabase Edge Function to refresh cache
// This can be called by pg_cron or external services

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vercelUrl = Deno.env.get('VERCEL_URL') || Deno.env.get('NEXT_PUBLIC_WISCONSIN_BASE_URL') || 'https://grandviewwisconsin.com'
    
    console.log('🔄 Starting cache refresh from Supabase Edge Function...')
    
    // Call your Next.js API endpoint to refresh cache
    const response = await fetch(`${vercelUrl}/api/admin/refresh-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('CRON_SECRET') || 'supabase-cron'}`,
      },
      body: JSON.stringify({
        triggeredBy: 'supabase-cron',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Cache refresh failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    console.log('✅ Cache refresh completed:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cache refresh triggered successfully',
        result 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )
  } catch (error) {
    console.error('❌ Error in cache refresh:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      },
    )
  }
})

