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
    // Parse request body
    const { message, userId, conversationHistory } = await req.json()

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user data from database
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    // Get recent transactions (last 10)
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Call n8n webhook with context
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured')
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: message,
        userId: userId,
        userName: userData?.name || 'User',
        conversationHistory: conversationHistory || [],
        userData: {
          email: userData?.email,
          recentTransactions: recentTransactions || []
        }
      })
    })

    const aiResponse = await response.json()

    // Log the conversation to database
    await supabase.from('chat_logs').insert({
      user_id: userId,
      message: message,
      response: aiResponse.message,
      created_at: new Date().toISOString()
    })

    // Return AI response to frontend
    return new Response(
      JSON.stringify(aiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
