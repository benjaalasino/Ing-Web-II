if (!window.auth.checkAuth('user')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('dashboard.html');

const welcomeTitle = document.getElementById('welcomeTitle');
const welcomeSubtitle = document.getElementById('welcomeSubtitle');
const cardTotalMonth = document.getElementById('cardTotalMonth');
const cardTopCategory = document.getElementById('cardTopCategory');
const cardExpenseCount = document.getElementById('cardExpenseCount');
const cardBudgetStatus = document.getElementById('cardBudgetStatus');
const recentExpensesContainer = document.getElementById('recentExpensesContainer');
const recommendationsContainer = document.getElementById('recommendationsContainer');

const chartCategoryEl = document.getElementById('chartCategory');
const chartMonthlyEl = document.getElementById('chartMonthly');
const chartCategoryEmpty = document.getElementById('chartCategoryEmpty');
const chartMonthlyEmpty = document.getElementById('chartMonthlyEmpty');

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

welcomeTitle.textContent = `Bienvenido/a, ${window.auth.getUserName() || 'Usuario'}`;
welcomeSubtitle.textContent = `Resumen de ${window.ui.monthName(month)} ${year}`;

const sum = (arr) => arr.reduce((acc, value) => acc + Number(value), 0);

const renderCards = (stats, expenses, budgetProgress) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const totalMonth = Number(stats.totalByMonth?.[key] || 0);

    const topCategory = Object.entries(stats.totalByCategory || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';

    const budgetTotal = sum((budgetProgress || []).map((item) => item.budgetAmount));
    const budgetSpent = sum((budgetProgress || []).map((item) => item.spent));

    cardTotalMonth.textContent = totalMonth ? window.ui.formatCurrency(totalMonth) : 'Sin datos';
    cardTopCategory.textContent = topCategory;
    cardExpenseCount.textContent = `${(expenses || []).length} gastos`;
    cardBudgetStatus.textContent = budgetTotal > 0
        ? `${Math.round((budgetSpent / budgetTotal) * 100)}% usado`
        : 'Sin datos';
};

const renderCategoryChart = (stats) => {
    const chart = window.ui.renderDoughnutChart(chartCategoryEl, stats.totalByCategory);
    chartCategoryEl.classList.toggle('hidden', !chart);
    chartCategoryEmpty.classList.toggle('hidden', !!chart);
};

const renderMonthlyChart = (stats) => {
    const chart = window.ui.renderBarChart(chartMonthlyEl, stats.totalByMonth);
    chartMonthlyEl.classList.toggle('hidden', !chart);
    chartMonthlyEmpty.classList.toggle('hidden', !!chart);
};

const renderRecentExpenses = (recentExpenses) => {
    if (!recentExpenses.length) {
        recentExpensesContainer.innerHTML = `
            <p>Aun no cargaste ningun gasto.</p>
            <a class="btn btn-primary" href="upload-ticket.html">Subir ticket</a>
        `;
        return;
    }

    recentExpensesContainer.innerHTML = `
        <table id="tableRecentExpenses">
            <thead>
                <tr><th>Fecha</th><th>Comercio</th><th>Categoria</th><th>Monto</th></tr>
            </thead>
            <tbody>
                ${recentExpenses.map((expense) => `
                    <tr data-row-id="${expense.id}" style="cursor:pointer;">
                        <td>${window.ui.formatDate(expense.date)}</td>
                        <td>${expense.commerce}</td>
                        <td>${window.ui.buildBadge(expense.category)}</td>
                        <td>${window.ui.formatCurrency(expense.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    recentExpensesContainer.querySelectorAll('[data-row-id]').forEach((row) => {
        row.addEventListener('click', () => {
            window.location.href = 'expenses.html';
        });
    });
};

const renderRecommendations = (recommendations) => {
    if (!recommendations.length) {
        recommendationsContainer.innerHTML = '<p class="section-subtitle">Aun no tenes recomendaciones.</p>';
        return;
    }

    recommendationsContainer.innerHTML = recommendations.map((item) => `
        <article style="border:1px solid var(--border);border-radius:10px;padding:.7rem;margin-bottom:.6rem;background:var(--surface-soft)">
            <p style="margin:0 0 .35rem;">${item.text}</p>
            <small class="section-subtitle">${window.ui.formatDate(item.createdAt)} - ${item.advisorId ? 'Del asesor' : 'Del sistema'}</small>
        </article>
    `).join('');
};

const loadDashboard = async () => {
    const [stats, recentExpenses, budgetProgress, recommendations] = await Promise.all([
        window.apiFetch('/expenses/stats'),
        window.apiFetch('/expenses?limit=5'),
        window.apiFetch('/budgets/progress'),
        window.apiFetch('/recommendations?limit=3')
    ]);

    renderCards(stats, recentExpenses, budgetProgress);
    renderCategoryChart(stats);
    renderMonthlyChart(stats);
    renderRecentExpenses(recentExpenses);
    renderRecommendations(recommendations);
};

loadDashboard().catch((error) => {
    recommendationsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
});
