import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RoastRequest {
  amount: number;
  description: string;
  category: string;
  persona: string;
  monthlyIncome?: number;
  monthlySpent?: number;
}

const roasterMessages = {
  highSpend: [
    "Bro, ${amount} on ${category}? That's like ${percentage}% of your monthly income gone. Wild.",
    "${amount} for ${description}? Your future self just unfriended you.",
    "Not you spending ${amount} when your savings goal is crying in the corner...",
    "${amount}?! That's rent money behavior. But okay, live your truth.",
    "Tell me you're treating yourself without telling me... oh wait, you just spent ${amount}.",
  ],
  lowSpend: [
    "${amount} on ${category}? Respectable. Your wallet thanks you.",
    "Only ${amount}? Look at you being responsible and stuff.",
    "${amount} is giving 'I have self-control' energy. Keep it up.",
  ],
  lateMight: [
    "${amount} at ${time}? The late-night munchies are NOT your friend.",
    "2 AM spending hits different... and by different I mean expensive.",
    "Midnight ${category} run? Your bank account was sleeping, unlike you.",
  ],
  coffeeAddict: [
    "Another coffee? That's your ${count} this week. At this rate, you're funding their retirement.",
    "${amount} on coffee AGAIN? Bro, buy a French press.",
    "That's ${weeklyTotal} on coffee this week. Just saying.",
  ],
};

const hypeManMessages = {
  goodChoice: [
    "YESSS! ${amount} on ${category}? That's what I'm talking about! Smart money moves!",
    "Look at you out here making responsible decisions! ${amount} well spent!",
    "${amount}? That's the energy! Keep this up and you'll hit your goals in no time!",
    "RESPONSIBLE KING/QUEEN BEHAVIOR! ${amount} on ${category} is a W!",
  ],
  saving: [
    "You DIDN'T spend on ${category}? LEGENDARY! Your savings just did a happy dance!",
    "Look at you choosing your future over instant gratification! ICONIC!",
    "Your willpower is INSANE! Keep this up!",
  ],
  streak: [
    "${days} DAY STREAK! You're literally unstoppable!",
    "Consistency is KEY and you're NAILING IT! ${days} days strong!",
    "Your dedication is inspiring! ${days} days of tracking = CHAMPION ENERGY!",
  ],
};

const wiseSageMessages = {
  guidance: [
    "Consider this: ${amount} today or ${futureValue} in 5 years with compound interest?",
    "${amount} on ${category} brings joy now. Would saving bring more joy later?",
    "Every spending choice is a vote for the life you want to live.",
    "${amount} spent wisely is an investment. Spent carelessly, it's just gone.",
  ],
  warning: [
    "You've spent ${percentage}% of your monthly income. Perhaps it's time to pause and reflect.",
    "Small leaks sink great ships. This ${amount} might seem small, but they add up.",
    "The path of discipline and the path of regret both require sacrifice. Choose wisely.",
  ],
};

function generateRoast(request: RoastRequest): { message: string; type: string } {
  const { amount, description, category, persona, monthlyIncome, monthlySpent } = request;
  
  const percentage = monthlyIncome ? ((amount / monthlyIncome) * 100).toFixed(1) : 0;
  const spentPercentage = monthlyIncome && monthlySpent ? ((monthlySpent / monthlyIncome) * 100).toFixed(0) : 0;
  
  const isHighSpend = monthlyIncome && amount > monthlyIncome * 0.1;
  const isOverBudget = monthlyIncome && monthlySpent && monthlySpent > monthlyIncome * 0.7;
  
  const isCoffee = category.toLowerCase().includes('coffee') || description.toLowerCase().includes('coffee') || description.toLowerCase().includes('starbucks');
  
  const hour = new Date().getHours();
  const isLateNight = hour >= 22 || hour <= 4;
  
  if (persona === 'roaster') {
    let messages = [];
    
    if (isLateNight && (category.includes('Food') || category.includes('Snacks'))) {
      messages = roasterMessages.lateMight;
    } else if (isCoffee) {
      messages = roasterMessages.coffeeAddict;
    } else if (isHighSpend) {
      messages = roasterMessages.highSpend;
    } else {
      messages = roasterMessages.lowSpend;
    }
    
    const template = messages[Math.floor(Math.random() * messages.length)];
    const message = template
      .replace('${amount}', `$${amount.toFixed(2)}`)
      .replace('${category}', category)
      .replace('${description}', description)
      .replace('${percentage}', percentage.toString())
      .replace('${time}', `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`);
    
    return { 
      message, 
      type: isHighSpend || isLateNight ? 'roast' : 'neutral' 
    };
  }
  
  if (persona === 'hype_man') {
    const messages = amount < (monthlyIncome || 1000) * 0.05 
      ? hypeManMessages.goodChoice 
      : hypeManMessages.goodChoice;
    
    const template = messages[Math.floor(Math.random() * messages.length)];
    const message = template
      .replace('${amount}', `$${amount.toFixed(2)}`)
      .replace('${category}', category);
    
    return { message, type: 'hype' };
  }
  
  if (persona === 'wise_sage') {
    const messages = isOverBudget ? wiseSageMessages.warning : wiseSageMessages.guidance;
    const template = messages[Math.floor(Math.random() * messages.length)];
    const futureValue = (amount * 12 * 1.05 * 5).toFixed(0);
    
    const message = template
      .replace('${amount}', `$${amount.toFixed(2)}`)
      .replace('${category}', category)
      .replace('${percentage}', spentPercentage.toString())
      .replace('${futureValue}', `$${futureValue}`);
    
    return { message, type: isOverBudget ? 'warning' : 'guidance' };
  }
  
  return { 
    message: `Noted: $${amount.toFixed(2)} on ${category}`, 
    type: 'neutral' 
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const request: RoastRequest = await req.json();

    if (!request.amount || !request.description) {
      return new Response(
        JSON.stringify({ error: "Amount and description are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = generateRoast(request);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
