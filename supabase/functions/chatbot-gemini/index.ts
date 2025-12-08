import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, userId, conversationHistory } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabaseHeaders = {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json',
    };

    const userResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=username,display_name`, {
      headers: supabaseHeaders,
    });

    const userData = await userResponse.json();
    const user = userData?.[0];

    const expensesResponse = await fetch(
      `${supabaseUrl}/rest/v1/expenses?user_id=eq.${userId}&order=created_at.desc&limit=10&select=*,categories(name)`,
      {
        headers: supabaseHeaders,
      }
    );

    const recentExpenses = await expensesResponse.json();

    const n8nWebhookUrl = 'https://arpitbagaria.app.n8n.cloud/webhook/budget-chatbot-gemini';

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: message,
        userId: userId,
        userName: user?.display_name || user?.username || 'User',
        conversationHistory: conversationHistory || [],
        userData: {
          username: user?.username,
          displayName: user?.display_name,
          recentExpenses: recentExpenses || []
        }
      })
    });

    const aiResponse = await webhookResponse.json();

    await fetch(`${supabaseUrl}/rest/v1/chat_logs`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify({
        user_id: userId,
        message: message,
        response: aiResponse.message || aiResponse.response || JSON.stringify(aiResponse),
        created_at: new Date().toISOString()
      })
    });

    return new Response(
      JSON.stringify(aiResponse),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred',
        message: "Sorry, I'm having trouble processing that right now. Please try again!",
        success: false
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400
      }
    );
  }
});
