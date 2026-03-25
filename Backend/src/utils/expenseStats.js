const { toYearMonthKey } = require('./dateUtils');

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const buildExpenseStats = (expenses) => {
    const totalByCategory = {};
    const totalByMonth = {};

    expenses.forEach((expense) => {
        totalByCategory[expense.category] = (totalByCategory[expense.category] || 0) + Number(expense.amount);

        const monthKey = toYearMonthKey(expense.date);
        totalByMonth[monthKey] = (totalByMonth[monthKey] || 0) + Number(expense.amount);
    });

    const monthlyTotals = Object.values(totalByMonth);
    const monthlyAverage = monthlyTotals.length
        ? round2(monthlyTotals.reduce((sum, value) => sum + value, 0) / monthlyTotals.length)
        : 0;

    const sortedCommerces = Object.entries(
        expenses.reduce((acc, item) => {
            acc[item.commerce] = (acc[item.commerce] || 0) + Number(item.amount);
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([commerce, total]) => ({ commerce, total: round2(total) }));

    const sortedMonths = Object.entries(totalByMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6);

    const lastSixMonths = Object.fromEntries(sortedMonths.map(([key, value]) => [key, round2(value)]));

    return {
        totalByCategory: Object.fromEntries(
            Object.entries(totalByCategory).map(([category, total]) => [category, round2(total)])
        ),
        totalByMonth: lastSixMonths,
        topCommerces: sortedCommerces,
        monthlyAverage
    };
};

module.exports = {
    buildExpenseStats
};
