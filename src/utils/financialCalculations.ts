export interface ExpenseCategory {
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly';
}

export interface BudgetPlan {
  monthlyIncome: number;
  totalExpenses: number;
  weekdayExpenses: number;
  weekendExpenses: number;
  targetSavings: number;
  actualSavings: number;
  savingsShortfall: number;
  necessities: ExpenseCategory[];
  discretionary: ExpenseCategory[];
  suggestions: string[];
}

export function calculateMonthlyExpenses(
  weekdayCategories: ExpenseCategory[],
  weekendCategories: ExpenseCategory[]
): { weekday: number; weekend: number; total: number } {
  const weekdayTotal = weekdayCategories.reduce((sum, cat) => {
    return sum + (cat.amount * 5 * 4.33);
  }, 0);

  const weekendTotal = weekendCategories.reduce((sum, cat) => {
    return sum + (cat.amount * 2 * 4.33);
  }, 0);

  return {
    weekday: weekdayTotal,
    weekend: weekendTotal,
    total: weekdayTotal + weekendTotal,
  };
}

export function analyzeBudget(
  monthlyIncome: number,
  weekdayCategories: ExpenseCategory[],
  weekendCategories: ExpenseCategory[],
  targetSavings: number
): BudgetPlan {
  const expenses = calculateMonthlyExpenses(weekdayCategories, weekendCategories);
  const actualSavings = monthlyIncome - expenses.total;
  const savingsShortfall = targetSavings - actualSavings;

  const necessityKeywords = ['commute', 'grocery', 'groceries', 'rent', 'bills'];
  const necessities = [...weekdayCategories, ...weekendCategories].filter(cat =>
    necessityKeywords.some(keyword => cat.name.toLowerCase().includes(keyword))
  );

  const discretionary = [...weekdayCategories, ...weekendCategories].filter(cat =>
    !necessityKeywords.some(keyword => cat.name.toLowerCase().includes(keyword))
  );

  const suggestions: string[] = [];

  if (savingsShortfall > 0) {
    const sortedDiscretionary = [...discretionary].sort((a, b) => {
      const aMonthly = a.amount * (a.frequency === 'daily' ? 5 : 2) * 4.33;
      const bMonthly = b.amount * (b.frequency === 'daily' ? 5 : 2) * 4.33;
      return bMonthly - aMonthly;
    });

    sortedDiscretionary.forEach(cat => {
      const monthlySpend = cat.amount * (cat.frequency === 'daily' ? 5 : 2) * 4.33;

      if (monthlySpend > 100) {
        const reduction = Math.min(monthlySpend * 0.3, savingsShortfall);
        suggestions.push(
          `Consider reducing ${cat.name} spending by $${reduction.toFixed(0)}/month. Try cutting back 1-2 times per week.`
        );
      } else if (monthlySpend > 50) {
        suggestions.push(
          `${cat.name} could be optimized. Small changes here add up to big savings!`
        );
      }
    });

    if (suggestions.length === 0) {
      suggestions.push(
        'Look for small wins: pack lunch twice a week, find free entertainment, or split ride costs with friends.'
      );
    }

    suggestions.push(
      `You're $${savingsShortfall.toFixed(0)} short of your goal. Every small cut counts!`
    );
  } else {
    suggestions.push(
      `Great job! You're on track to save $${actualSavings.toFixed(0)}/month. Keep it up!`
    );
  }

  return {
    monthlyIncome,
    totalExpenses: expenses.total,
    weekdayExpenses: expenses.weekday,
    weekendExpenses: expenses.weekend,
    targetSavings,
    actualSavings,
    savingsShortfall,
    necessities,
    discretionary,
    suggestions,
  };
}

export function calculateCompoundInterest(
  monthlyContribution: number,
  years: number,
  annualRate: number = 0.05
): Array<{ year: number; amount: number }> {
  const monthlyRate = annualRate / 12;
  const results: Array<{ year: number; amount: number }> = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;
    const futureValue =
      monthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    results.push({
      year,
      amount: futureValue,
    });
  }

  return results;
}

export function getFinancialWisdom(situation: 'good' | 'tight' | 'struggling'): string {
  const wisdom = {
    good: [
      "You're in a strong position! Consider automating your savings to make it effortless.",
      "With this plan, you're building real wealth. Your future self will thank you.",
      "You've got breathing room. Use it wisely to build an emergency fund too.",
    ],
    tight: [
      "It's close, but doable. Stay focused and track every expense.",
      "You're walking the line. Small optimizations will make a big difference.",
      "Challenge yourself to find one expense you can reduce this week.",
    ],
    struggling: [
      "Don't worry - awareness is the first step. Let's find areas to adjust.",
      "Your goal is ambitious, but we can work together to get closer.",
      "Remember: saving something is better than saving nothing. Start small.",
    ],
  };

  const messages = wisdom[situation];
  return messages[Math.floor(Math.random() * messages.length)];
}
