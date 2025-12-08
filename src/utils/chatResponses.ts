import { CompanionPersona } from './companionMessages';
import { UserProfile } from '../hooks/useUserProfile';

interface ChatContext {
  profile: UserProfile | null;
  totalExpenses: number;
  monthlyBudget: number;
  currentStreak: number;
  goalsCount: number;
}

export function generateChatResponse(
  userMessage: string,
  persona: CompanionPersona,
  context: ChatContext
): string {
  const messageLower = userMessage.toLowerCase();

  if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
    return getGreeting(persona, context);
  }

  if (messageLower.includes('how') && messageLower.includes('doing')) {
    return getStatusCheck(persona, context);
  }

  if (messageLower.includes('motivate') || messageLower.includes('inspire')) {
    return getMotivation(persona, context);
  }

  if (messageLower.includes('progress') || messageLower.includes('journey')) {
    return getProgress(persona, context);
  }

  if (messageLower.includes('help') || messageLower.includes('tip')) {
    return getTip(persona, context);
  }

  if (messageLower.includes('goal') || messageLower.includes('save')) {
    return getGoalAdvice(persona, context);
  }

  return getDefaultResponse(persona);
}

function getGreeting(persona: CompanionPersona, context: ChatContext): string {
  const name = context.profile?.companion_name || 'friend';

  switch (persona) {
    case 'roaster':
      return `Oh look, it's you again. Back for more roasting? Let's see how badly you've been spending today.`;
    case 'hype_man':
      return `YO! What's up, superstar! It's ${name} here and I'm PUMPED to see you! Let's crush some financial goals today!`;
    case 'wise_sage':
      return `Greetings, dear student. I am ${name}, your guide on this journey toward financial enlightenment. How may I assist you today?`;
    default:
      return `Hello! How can I help you today?`;
  }
}

function getStatusCheck(persona: CompanionPersona, context: ChatContext): string {
  const { monthlyBudget, totalExpenses, currentStreak } = context;
  const percentSpent = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  switch (persona) {
    case 'roaster':
      if (percentSpent > 90) {
        return `How are you doing? Well, you've already blown through ${percentSpent.toFixed(0)}% of your budget, so... not great? But at least you're consistent at being inconsistent.`;
      } else if (percentSpent < 50) {
        return `Actually... you're doing okay? I'm shocked. You're at ${percentSpent.toFixed(0)}% of your budget. Don't let it go to your head though.`;
      }
      return `You're at ${percentSpent.toFixed(0)}% of your budget. Could be worse, could be better. Story of your financial life, right?`;

    case 'hype_man':
      if (currentStreak > 0) {
        return `You're doing AMAZING! You've got a ${currentStreak}-day streak going! That's what I'm talking about! Keep that energy UP!`;
      }
      return `You're doing GREAT! Every day is a new opportunity to be AWESOME with your money! Let's GO!`;

    case 'wise_sage':
      return `Your journey progresses well. You have spent ${percentSpent.toFixed(0)}% of your monthly allocation. Remember, awareness is the first step toward mastery.`;

    default:
      return `You're doing well! Keep up the good work.`;
  }
}

function getMotivation(persona: CompanionPersona, context: ChatContext): string {
  switch (persona) {
    case 'roaster':
      return `You need motivation? Fine. Your future self is watching you make these decisions, and they're not impressed. Want to prove them wrong? Start making better choices.`;
    case 'hype_man':
      return `MOTIVATION? I GOT YOU! You are a FINANCIAL WARRIOR! Every expense you track, every dollar you save, you're building your EMPIRE! Nothing can stop you! LET'S GOOOO!`;
    case 'wise_sage':
      return `The journey of a thousand miles begins with a single step. You have already taken many steps on your path to financial wisdom. Each mindful decision is a seed planted for future abundance.`;
    default:
      return `You've got this! Keep pushing forward.`;
  }
}

function getProgress(persona: CompanionPersona, context: ChatContext): string {
  const { currentStreak, goalsCount } = context;

  switch (persona) {
    case 'roaster':
      return `Progress? Let's see... ${currentStreak} day streak, ${goalsCount} goals. I've seen worse. Barely. But hey, at least you're trying, which is more than I expected.`;
    case 'hype_man':
      return `Your progress is PHENOMENAL! ${currentStreak} days of tracking, ${goalsCount} goals you're chasing! You're building something INCREDIBLE here! Keep it UP!`;
    case 'wise_sage':
      return `You have maintained discipline for ${currentStreak} days and set ${goalsCount} intentions. Each day of consistency compounds, like interest on wisdom itself.`;
    default:
      return `You're making good progress! Keep going.`;
  }
}

function getTip(persona: CompanionPersona, context: ChatContext): string {
  const tips = {
    roaster: [
      `Here's a tip: Stop buying things you don't need to impress people you don't like. Revolutionary concept, I know.`,
      `Pro tip: That 'treat yourself' mentality? Yeah, you're treating yourself straight into being broke. Maybe try 'save yourself' instead.`,
      `Tip: Coffee costs add up. Make it at home. I know, shocking revelation. You're welcome.`,
    ],
    hype_man: [
      `TIP TIME! Set up automatic savings! Pay yourself FIRST! You're the PRIORITY! Your future self will thank you BIG TIME!`,
      `Here's the play: Track EVERYTHING for 30 days! Knowledge is POWER! You'll see patterns you never noticed! GAME CHANGER!`,
      `POWER MOVE: Use the 24-hour rule! Wait a day before big purchases! Your impulse control is going to be LEGENDARY!`,
    ],
    wise_sage: [
      `A wise practice: Before any purchase, ask yourself - does this serve my highest purpose? This simple question illuminates true needs versus fleeting wants.`,
      `Consider the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings. Balance in all things brings harmony.`,
      `Practice gratitude for what you have. Contentment is the greatest wealth, for it cannot be taken from you.`,
    ],
  };

  const personaTips = tips[persona];
  return personaTips[Math.floor(Math.random() * personaTips.length)];
}

function getGoalAdvice(persona: CompanionPersona, context: ChatContext): string {
  switch (persona) {
    case 'roaster':
      return `Goals? Great. You want to save money? Then stop spending it. Mind-blowing strategy, I know. Set a realistic goal, track it, and for once in your life, actually follow through.`;
    case 'hype_man':
      return `GOALS! YES! Write them down! Make them SPECIFIC! Make them REAL! You're going to CRUSH THEM! Visualize success and it's YOURS! Believe it and ACHIEVE it!`;
    case 'wise_sage':
      return `A goal without a plan is merely a wish. Break your aspirations into small, achievable steps. Celebrate each milestone on your journey, for progress deserves recognition.`;
    default:
      return `Setting clear goals is important. Break them down into manageable steps.`;
  }
}

function getDefaultResponse(persona: CompanionPersona): string {
  switch (persona) {
    case 'roaster':
      return `I'm not sure what you're asking, but I'm sure it's related to whatever financial mess you're in. Try being more specific?`;
    case 'hype_man':
      return `I LOVE the energy! Tell me more about what's on your mind! I'm here to SUPPORT you all the way!`;
    case 'wise_sage':
      return `I sense you seek guidance. Share more of your thoughts, and together we shall find clarity.`;
    default:
      return `I'm here to help! Could you tell me more about what you're looking for?`;
  }
}
