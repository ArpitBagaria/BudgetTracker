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
    const { message, userId, conversationHistory, persona, companionName } = await req.json();

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

    const userResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=username,display_name,monthly_budget,current_streak`, {
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

    let aiResponseData;
    const n8nWebhookUrl = 'https://arpitbagaria.app.n8n.cloud/webhook/budget-chatbot-gemini';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: message,
          userId: userId,
          userName: user?.display_name || user?.username || 'User',
          companionName: companionName || 'Companion',
          persona: persona || 'roaster',
          conversationHistory: conversationHistory || [],
          userData: {
            username: user?.username,
            displayName: user?.display_name,
            recentExpenses: recentExpenses || [],
            monthlyBudget: user?.monthly_budget,
            currentStreak: user?.current_streak
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (webhookResponse.ok) {
        aiResponseData = await webhookResponse.json();
      } else {
        throw new Error('Webhook returned error status');
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);

      const fallbackResponses = {
        roaster: [
          "Look, the AI service is taking a break (unlike your spending habits). But seriously, you're doing great! Keep tracking those expenses.",
          "My fancy AI brain is offline, but I can still tell you're crushing it with your budgeting!",
          "The AI gods are temporarily unavailable. But hey, you logged an expense - that's what matters!"
        ],
        hype_man: [
          "YES! Even though my AI connection is down, YOU'RE STILL A BUDGETING SUPERSTAR!",
          "The system might be having issues, but YOUR dedication to tracking expenses is UNSTOPPABLE!",
          "Technical difficulties can't stop YOUR AMAZING financial journey!"
        ],
        wise_sage: [
          "While the AI service rests, remember: the true wisdom comes from your consistent effort in tracking your finances.",
          "A temporary setback in technology does not diminish your progress on the path to financial wellness.",
          "The AI may be unavailable, but your commitment to financial mindfulness remains strong."
        ]
      };

      const personaKey = (persona || 'roaster') as keyof typeof fallbackResponses;
      const responses = fallbackResponses[personaKey] || fallbackResponses.roaster;
      const fallbackMessage = responses[Math.floor(Math.random() * responses.length)];

      aiResponseData = {
        message: fallbackMessage,
        success: true,
        fallback: true
      };
    }

    try {
      await fetch(`${supabaseUrl}/rest/v1/chat_logs`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          user_id: userId,
          message: message,
          response: aiResponseData.message || aiResponseData.response || JSON.stringify(aiResponseData),
          created_at: new Date().toISOString()
        })
      });
    } catch (logError) {
      console.error('Error logging chat:', logError);
    }

    return new Response(
      JSON.stringify(aiResponseData),
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
        message: "I'm having a moment here, but don't let that stop your budgeting momentum!",
        success: true
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    );
  }
});