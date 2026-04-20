if (!window.auth.checkAuth('advisor')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('advisor-user-detail.html');

const params = new URLSearchParams(window.location.search);
const userId = params.get('userId');
if (!userId) {
    window.location.href = 'advisor-panel.html';
}

const userTitle = document.getElementById('userTitle');
const userSubtitle = document.getElementById('userSubtitle');
const userCardMonth = document.getElementById('userCardMonth');
const userCardAverage = document.getElementById('userCardAverage');
const userCardTopCategory = document.getElementById('userCardTopCategory');
const userCardUnusual = document.getElementById('userCardUnusual');
const userExpensesTable = document.getElementById('userExpensesTable');
const patternsContent = document.getElementById('patternsContent');
const recommendationsList = document.getElementById('recommendationsList');
const inputRecommendationText = document.getElementById('inputRecommendationText');
const btnSendRecommendation = document.getElementById('btnSendRecommendation');
const recommendationMessage = document.getElementById('recommendationMessage');

const chartCategory = document.getElementById('userChartCategory');
const chartMonthly = document.getElementById('userChartMonthly');

let cachedData = {
    user: null,
    stats: null,
    expenses: [],
    recommendations: []
};

const getUnusualExpenses = () => {
    const average = Number(cachedData.stats.monthlyAverage || 0);
    return cachedData.expenses.filter((expense) => Number(expense.amount) > average * 3);
};

const renderHeaderData = () => {
    userTitle.textContent = cachedData.user.name;
    userSubtitle.textContent = `${cachedData.user.email} - Usuario desde ${window.ui.formatDate(cachedData.user.createdAt)}`;
};

const renderCards = () => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTotal = Number(cachedData.stats.totalByMonth?.[monthKey] || 0);

    const topCategory = Object.entries(cachedData.stats.totalByCategory || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';

    const average = Number(cachedData.stats.monthlyAverage || 0);

    userCardMonth.textContent = window.ui.formatCurrency(monthTotal);
    userCardAverage.textContent = window.ui.formatCurrency(average);
    userCardTopCategory.textContent = topCategory;
    userCardUnusual.textContent = String(getUnusualExpenses().length);
};

const renderCharts = () => {
    window.ui.renderDoughnutChart(chartCategory, cachedData.stats.totalByCategory);
    window.ui.renderBarChart(chartMonthly, cachedData.stats.totalByMonth);
};

const renderExpenses = () => {
    userExpensesTable.innerHTML = `
        <table id="tableUserExpenses">
            <thead><tr><th>Fecha</th><th>Comercio</th><th>Categoria</th><th>Monto</th></tr></thead>
            <tbody>
                ${cachedData.expenses.map((expense) => `
                    <tr>
                        <td>${window.ui.formatDate(expense.date)}</td>
                        <td>${expense.commerce}</td>
                        <td>${window.ui.buildBadge(expense.category)}</td>
                        <td>${window.ui.formatCurrency(expense.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

const renderPatterns = () => {
    const totalByMonth = cachedData.stats.totalByMonth || {};
    const totalByCategory = cachedData.stats.totalByCategory || {};
    const monthTop = Object.entries(totalByMonth).sort((a, b) => b[1] - a[1])[0];
    const categoryTop = Object.entries(totalByCategory).sort((a, b) => b[1] - a[1])[0];
    const average = Number(cachedData.stats.monthlyAverage || 0);
    const unusual = getUnusualExpenses();

    const unusualRows = unusual.length
        ? `<table><thead><tr><th>Fecha</th><th>Comercio</th><th>Monto</th><th>Estado</th></tr></thead><tbody>${unusual.map((item) => `<tr><td>${window.ui.formatDate(item.date)}</td><td>${item.commerce}</td><td>${window.ui.formatCurrency(item.amount)}</td><td>Gasto inusual</td></tr>`).join('')}</tbody></table>`
        : '<p>No se detectaron gastos inusuales.</p>';

    patternsContent.innerHTML = `
        <p>Gasto promedio mensual: ${window.ui.formatCurrency(average)}</p>
        <p>Categoria donde mas gasta: ${categoryTop?.[0] || 'Sin datos'}</p>
        <p>Mes con mayor gasto: ${monthTop ? `${monthTop[0]} (${window.ui.formatCurrency(monthTop[1])})` : 'Sin datos'}</p>
        <h3 class="section-title" style="font-size:1rem;">Gastos inusuales</h3>
        ${unusualRows}
    `;
};

const renderRecommendations = () => {
    if (!cachedData.recommendations.length) {
        recommendationsList.innerHTML = '<p>Aun no hay recomendaciones para este usuario.</p>';
        return;
    }

    recommendationsList.innerHTML = cachedData.recommendations.map((item) => `
        <article style="border:1px solid var(--border);padding:.65rem;border-radius:10px;margin-bottom:.5rem;">
            <p style="margin:0 0 .35rem;">${item.text}</p>
            <small class="section-subtitle">${window.ui.formatDate(item.createdAt)} - ${item.advisorId ? 'Del asesor' : 'Del sistema'}</small>
        </article>
    `).join('');
};

const refreshData = async () => {
    const [userData, statsData, recommendationsData] = await Promise.all([
        window.apiFetch(`/users/${userId}`),
        window.apiFetch(`/users/${userId}/stats`),
        window.apiFetch(`/recommendations?userId=${userId}`)
    ]);

    cachedData = {
        user: userData,
        stats: statsData.stats,
        expenses: statsData.expenses,
        recommendations: recommendationsData
    };

    renderHeaderData();
    renderCards();
    renderCharts();
    renderExpenses();
    renderPatterns();
    renderRecommendations();
};

btnSendRecommendation.addEventListener('click', async () => {
    const text = inputRecommendationText.value.trim();
    if (text.length < 10) {
        window.ui.showMessage(recommendationMessage, 'La recomendacion debe tener al menos 10 caracteres.', 'error');
        return;
    }

    try {
        await window.apiFetch('/recommendations', {
            method: 'POST',
            body: JSON.stringify({ userId: Number(userId), text })
        });

        inputRecommendationText.value = '';
        window.ui.showMessage(recommendationMessage, 'Recomendacion enviada.', 'success');
        cachedData.recommendations = await window.apiFetch(`/recommendations?userId=${userId}`);
        renderRecommendations();
    } catch (error) {
        window.ui.showMessage(recommendationMessage, error.message, 'error');
    }
});

refreshData().catch((error) => {
    window.ui.showMessage(recommendationMessage, error.message, 'error');
});
