export type CompanionPersona = 'roaster' | 'hype_man' | 'wise_sage';

interface CompanionMessages {
  [context: string]: {
    roaster: string[];
    hype_man: string[];
    wise_sage: string[];
  };
}

export const companionMessages: CompanionMessages = {
  expense_added: {
    roaster: [
      "Oh great, another expense. At this rate, your wallet will file for bankruptcy before you do.",
      "Spending money again? Your bank account called, it wants to break up with you.",
      "That purchase was so necessary... said no one ever. Track it though, at least you're consistent.",
      "Another expense logged! I'd be impressed if this wasn't the 10th one today."
    ],
    hype_man: [
      "YES! You logged that expense! Tracking is the first step to mastery!",
      "Look at you being financially responsible! You're doing AMAZING!",
      "That's what I'm talking about! Every tracked expense is a win for future you!",
      "Absolutely crushing it with that expense tracking! You're unstoppable!"
    ],
    wise_sage: [
      "Awareness precedes change. You've taken the first step on the path to financial wisdom.",
      "Every expense tracked is a lesson learned. The journey of a thousand miles begins with a single step.",
      "In the garden of financial growth, tracking is the water that nourishes understanding.",
      "Mindful spending begins with awareness. You're cultivating financial consciousness."
    ]
  },
  overspending: {
    roaster: [
      "Overspending AGAIN? Your budget is more like a suggestion to you, isn't it?",
      "Wow, you really showed that budget who's boss. Spoiler: it wasn't you.",
      "I've seen better financial decisions from a toddler with a credit card.",
      "Your budget called. It's filing a restraining order against your spending habits."
    ],
    hype_man: [
      "Hey, you noticed you're over budget! That's actually progress! Now let's get back on track!",
      "Okay, we went over a bit, but you're AWARE of it! That's the power right there!",
      "Every champion has setbacks! But you're tracking it, and that means you're winning!",
      "You've got this! One day over budget doesn't define you. Let's bounce back stronger!"
    ],
    wise_sage: [
      "In moments of excess, we find the clearest lessons. What wisdom does this imbalance offer?",
      "The river sometimes overflows its banks, teaching us the value of boundaries.",
      "Financial harmony requires balance. This moment invites reflection and gentle course correction.",
      "Every challenge is an opportunity to deepen our understanding of needs versus wants."
    ]
  },
  saving_well: {
    roaster: [
      "Look at you, actually saving money! Did hell freeze over? Keep it up before you blow it all.",
      "Saving money? Who are you and what did you do with the spender I know?",
      "Okay, I'll admit it. You're doing... not terrible. Don't let it go to your head.",
      "You're under budget! I'm shocked. Genuinely shocked. Don't make me regret this compliment."
    ],
    hype_man: [
      "LEGEND! You're crushing those savings goals! THIS IS YOUR MOMENT!",
      "Under budget! You absolute financial ROCKSTAR! Keep this energy going!",
      "YES YES YES! You're building wealth like a champion! I BELIEVE IN YOU!",
      "You're not just saving money, you're building your DREAM FUTURE! Let's GO!"
    ],
    wise_sage: [
      "Like a river that flows steadily, your savings grow with patience and discipline.",
      "The wealth you build today becomes the freedom you enjoy tomorrow. Well done.",
      "In the art of saving, you've found the balance between present and future. This is wisdom.",
      "Your financial garden flourishes. Continue nurturing it with mindful choices."
    ]
  },
  streak: {
    roaster: [
      "Wow, a streak! Too bad your spending habits aren't as consistent as your logging.",
      "Impressive streak. Now if only you could streak-save instead of streak-spend.",
      "You've got a streak going! Finally some commitment. Where was this energy when making that impulse purchase?",
      "Logging consistently but still broke? At least you'll have detailed records of where it all went."
    ],
    hype_man: [
      "STREAK FIRE! You're on an absolute ROLL! Nothing can stop you now!",
      "Day after day, you show up! That's what WINNERS do! Keep that streak alive!",
      "Your consistency is INCREDIBLE! This streak proves you're built different!",
      "UNSTOPPABLE! Your streak is proof that you're committed to greatness!"
    ],
    wise_sage: [
      "Consistency is the path to mastery. Your dedication to daily practice speaks volumes.",
      "Like the sun that rises each day, your commitment illuminates the path to financial peace.",
      "The longest journey is completed through daily steps. Your streak reflects deep wisdom.",
      "In the discipline of daily practice, we find the seeds of lasting transformation."
    ]
  }
};

export function getCompanionMessage(
  persona: CompanionPersona,
  context: string
): string {
  const messages = companionMessages[context];

  if (!messages || !messages[persona]) {
    return "Keep up the great work!";
  }

  const personaMessages = messages[persona];
  const randomIndex = Math.floor(Math.random() * personaMessages.length);

  return personaMessages[randomIndex];
}
