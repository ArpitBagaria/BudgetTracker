export interface ExpenseCategory {
  name: string;
  amount: number;
  category: 'necessity' | 'discretionary';
}

export interface BudgetAnalysis {
  totalExpenses: number;
  actualSavings: number;
  savingsShortfall: number;
  suggestions: string[];
}

export function analyzeBudget(
  monthlyIncome: number,
  weekdayExpenses: ExpenseCategory[],
  weekendExpenses: ExpenseCategory[],
  targetSavings: number
): BudgetAnalysis {
  const weekdayTotal = weekdayExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 5 * 4;
  const weekendTotal = weekendExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 2 * 4;
  const totalExpenses = weekdayTotal + weekendTotal;
  const actualSavings = monthlyIncome - totalExpenses;
  const savingsShortfall = targetSavings - actualSavings;

  const suggestions: string[] = [];

  if (savingsShortfall > 0) {
    const discretionaryWeekday = weekdayExpenses.filter(e => e.category === 'discretionary');
    const discretionaryWeekend = weekendExpenses.filter(e => e.category === 'discretionary');

    if (discretionaryWeekday.length > 0) {
      const largest = discretionaryWeekday.sort((a, b) => b.amount - a.amount)[0];
      const reduction = Math.min(largest.amount * 0.3, savingsShortfall / 20);
      suggestions.push(
        `Consider reducing ${largest.name} spending by $${(reduction * 20).toFixed(0)}/month. Try cutting back 1-2 times per week.`
      );
    }

    if (discretionaryWeekend.length > 0) {
      const largest = discretionaryWeekend.sort((a, b) => b.amount - a.amount)[0];
      const reduction = Math.min(largest.amount * 0.25, savingsShortfall / 8);
      suggestions.push(
        `Try reducing ${largest.name} by $${(reduction * 8).toFixed(0)}/month. Every little bit helps!`
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        'Consider finding additional income sources or reviewing your fixed expenses.',
        'Look for subscription services you can cancel or reduce.',
        'Try the 30-day rule: wait 30 days before making non-essential purchases.'
      );
    }
  } else {
    suggestions.push(
      "You're on track! Keep up the great work.",
      'Consider investing your extra savings for long-term growth.',
      'Build an emergency fund if you haven\'t already (3-6 months of expenses).'
    );
  }

  return {
    totalExpenses,
    actualSavings,
    savingsShortfall,
    suggestions,
  };
}

export function calculateCompoundInterest(
  monthlySavings: number,
  years: number,
  annualRate: number
): Array<{ year: number; amount: number }> {
  const monthlyRate = annualRate / 12;
  const results = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;
    let total = 0;

    for (let month = 1; month <= months; month++) {
      total = (total + monthlySavings) * (1 + monthlyRate);
    }

    results.push({ year, amount: total });
  }

  return results;
}

export function getFinancialWisdom(situation: 'good' | 'tight' | 'struggling'): string {
  const wisdom = {
    good: [
      "You're doing great! Your budget looks healthy and sustainable.",
      "Excellent work! You have room to breathe and save for your goals.",
      "Well done! Your finances are balanced and you're building wealth.",
    ],
    tight: [
      "Your budget is workable, but there's little room for error. Let's find some cushion.",
      "You're on the right track, but small adjustments could make a big difference.",
      "Your plan is doable with discipline. Here are some ways to make it easier:",
    ],
    struggling: [
      "Let's work together to find realistic ways to reach your savings goal.",
      "Your goal is ambitious. Here are some practical adjustments to consider:",
      "Building wealth takes time. Let's start with achievable changes:",
    ],
  };

  const options = wisdom[situation];
  return options[Math.floor(Math.random() * options.length)];
}
