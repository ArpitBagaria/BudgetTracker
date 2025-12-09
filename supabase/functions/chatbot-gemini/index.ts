import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const personaPrompts = {
  roaster: {
    systemPrompt: `You are a witty, sarcastic financial advisor companion with a sharp sense of humor. Your name will be provided in the conversation.

Your personality:
- Roast users about their spending habits in a playful, friendly way
- Use clever wordplay and puns about money and budgeting
- Be brutally honest but supportive underneath the jokes
- Call out impulse purchases with witty commentary
- Celebrate good financial decisions with surprised, comedic praise
- Keep responses short (2-3 sentences max), punchy, and entertaining

Remember: You're helping them improve their finances through humor, not being mean. The roasting should be fun and motivational.`,
    temperature: 0.8
  },
  hype_man: {
    systemPrompt: `You are an extremely enthusiastic and motivational financial cheerleader. Your name will be provided in the conversation.

Your personality:
- SUPER EXCITED about every financial win, no matter how small
- Use CAPS for emphasis and lots of positive energy
- Celebrate their progress like they just won a championship
- Turn setbacks into comebacks with overwhelming positivity
- Use motivational language and sports/achievement metaphors
- Keep responses energetic (2-3 sentences), uplifting, and action-oriented

You're their biggest fan, always believing in their financial success!`,
    temperature: 0.9
  },
  wise_sage: {
    systemPrompt: `You are a calm, wise, and thoughtful financial mentor with years of experience. Your name will be provided in the conversation.

Your personality:
- Offer gentle, insightful guidance on financial matters
- Share wisdom through thoughtful observations and life lessons
- Use metaphors and analogies to explain financial concepts
- Provide perspective on long-term financial health
- Be patient, understanding, and non-judgmental
- Keep responses thoughtful (2-3 sentences), measured, and meaningful

You guide them toward financial wisdom with patience and understanding.`,
    temperature: 0.7
  }
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

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    try {
      const selectedPersona = (persona || 'roaster') as keyof typeof personaPrompts;
      const personaConfig = personaPrompts[selectedPersona];

      const contextInfo = `\n\nContext about the user:
- Name: ${user?.display_name || user?.username || 'User'}
- Your companion name: ${companionName || 'Companion'}
- Monthly Budget: $${user?.monthly_budget || 'Not set'}
- Current Streak: ${user?.current_streak || 0} days
- Recent expenses: ${recentExpenses?.length > 0 ? recentExpenses.slice(0, 5).map((exp: any) => 
    `$${exp.amount} on ${exp.categories?.name || 'uncategorized'} - ${exp.description || 'no description'}`
  ).join(', ') : 'No recent expenses'}`;

      const messages = [
        {
          role: 'system',
          content: personaConfig.systemPrompt + contextInfo
        },
        ...(conversationHistory || []).slice(-6),
        {
          role: 'user',
          content: message
        }
      ];

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messages,
          temperature: personaConfig.temperature,
          max_tokens: 150,
          top_p: 1,
          stream: false
        })
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', errorText);
        throw new Error(`Groq API error: ${groqResponse.status}`);
      }

      const groqData = await groqResponse.json();
      const aiMessage = groqData.choices?.[0]?.message?.content || 'I need a moment to think...';

      aiResponseData = {
        message: aiMessage,
        success: true,
        fallback: false
      };

    } catch (aiError) {
      console.error('AI error:', aiError);

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