if (!window.auth.checkAuth('advisor')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('advisor-panel.html');

const cardTotalUsers = document.getElementById('cardTotalUsers');
const cardAvgExpense = document.getElementById('cardAvgExpense');
const cardTopSpender = document.getElementById('cardTopSpender');
const cardTopCategory = document.getElementById('cardTopCategory');
const searchUsers = document.getElementById('searchUsers');
const usersTableWrap = document.getElementById('usersTableWrap');
const advisorError = document.getElementById('advisorError');

let users = [];
let userStatsMap = new Map();

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const renderTable = (rows) => {
    if (!rows.length) {
        usersTableWrap.innerHTML = '<p>No hay usuarios registrados en la plataforma.</p>';
        return;
    }

    usersTableWrap.innerHTML = `
        <table id="tableUsers">
            <thead><tr><th>Nombre</th><th>Email</th><th>Fecha de registro</th><th>Gastos este mes</th><th>Acciones</th></tr></thead>
            <tbody>
                ${rows.map((user) => {
                    const stats = userStatsMap.get(user.id);
                    return `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${window.ui.formatDate(user.createdAt)}</td>
                            <td>${stats?.monthTotal ? window.ui.formatCurrency(stats.monthTotal) : 'Cargando...'}</td>
                            <td><a class="btn btn-secondary" href="advisor-user-detail.html?userId=${user.id}">Ver detalle</a></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
};

const renderGlobalCards = () => {
    cardTotalUsers.textContent = String(users.length);

    const statRows = [...userStatsMap.values()];
    if (!statRows.length) {
        cardAvgExpense.textContent = 'Cargando...';
        cardTopSpender.textContent = 'Cargando...';
        cardTopCategory.textContent = 'Cargando...';
        return;
    }

    const avg = statRows.reduce((sum, item) => sum + item.monthTotal, 0) / statRows.length;
    const topSpender = statRows.sort((a, b) => b.monthTotal - a.monthTotal)[0];

    const categoryTotals = {};
    statRows.forEach((row) => {
        Object.entries(row.totalByCategory).forEach(([category, amount]) => {
            categoryTotals[category] = (categoryTotals[category] || 0) + Number(amount);
        });
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';

    cardAvgExpense.textContent = window.ui.formatCurrency(avg || 0);
    cardTopSpender.textContent = topSpender?.name || 'Sin datos';
    cardTopCategory.textContent = topCategory;
};

const filterUsers = () => {
    const term = searchUsers.value.trim().toLowerCase();
    const rows = users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
    renderTable(rows);
};

const loadStats = async () => {
    await Promise.all(users.map(async (user) => {
        const data = await window.apiFetch(`/users/${user.id}/stats`);
        const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
        userStatsMap.set(user.id, {
            name: user.name,
            totalByCategory: data.stats.totalByCategory || {},
            monthTotal: Number(data.stats.totalByMonth?.[monthKey] || 0)
        });
        renderTable(users);
        renderGlobalCards();
    }));
};

const loadPanel = async () => {
    users = await window.apiFetch('/users');
    renderTable(users);
    renderGlobalCards();
    await loadStats();
};

searchUsers.addEventListener('input', filterUsers);
loadPanel().catch((error) => window.ui.showMessage(advisorError, error.message, 'error'));
