import { toYearMonthKey } from './date.util';

export interface ExpenseLike {
  commerce: string;
  date: string | Date;
  amount: number;
  category: string;
}

export interface ExpenseStats {
  totalByCategory: Record<string, number>;
  totalByMonth: Record<string, number>;
  topCommerces: Array<{ commerce: string; total: number }>;
  monthlyAverage: number;
}

const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const buildExpenseStats = (expenses: ExpenseLike[]): ExpenseStats => {
  const totalByCategory: Record<string, number> = {};
  const totalByMonth: Record<string, number> = {};

  expenses.forEach((expense) => {
    totalByCategory[expense.category] =
      (totalByCategory[expense.category] || 0) + Number(expense.amount);

    const monthKey = toYearMonthKey(expense.date);
    totalByMonth[monthKey] = (totalByMonth[monthKey] || 0) + Number(expense.amount);
  });

  const monthlyTotals = Object.values(totalByMonth);
  const monthlyAverage = monthlyTotals.length
    ? round2(monthlyTotals.reduce((sum, value) => sum + value, 0) / monthlyTotals.length)
    : 0;

  const topCommerces = Object.entries(
    expenses.reduce<Record<string, number>>((acc, item) => {
      acc[item.commerce] = (acc[item.commerce] || 0) + Number(item.amount);
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([commerce, total]) => ({ commerce, total: round2(total) }));

  const sortedMonths = Object.entries(totalByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  const totalByMonthRounded = Object.fromEntries(
    sortedMonths.map(([key, value]) => [key, round2(value)]),
  );

  return {
    totalByCategory: Object.fromEntries(
      Object.entries(totalByCategory).map(([category, total]) => [category, round2(total)]),
    ),
    totalByMonth: totalByMonthRounded,
    topCommerces,
    monthlyAverage,
  };
};
