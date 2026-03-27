if (!window.auth.checkAuth('user')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('mercadopago.html');

const mpAlert = document.getElementById('mpAlert');
const filterCategory = document.getElementById('filterCategory');
const filterMonth = document.getElementById('filterMonth');
const filterYear = document.getElementById('filterYear');
const btnFilter = document.getElementById('btnFilter');
const btnClearFilters = document.getElementById('btnClearFilters');
const resultSummary = document.getElementById('resultSummary');
const tableWrap = document.getElementById('tablePaymentsWrap');

let allPayments = [];
let filteredPayments = [];
let sortField = 'date';
let sortDirection = 'desc';

const monthNames = ['Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const showAlert = (text, type) => window.ui.showMessage(mpAlert, text, type);

/* ── Filters ── */
const setFilterOptions = () => {
    filterCategory.innerHTML = ['<option value="">Todas</option>', ...window.ui.CATEGORIES.map(c => `<option value="${c}">${c}</option>`)].join('');
    filterMonth.innerHTML = monthNames.map((name, i) => `<option value="${i === 0 ? '' : i}">${name}</option>`).join('');
};

const setYearOptions = () => {
    const years = [...new Set(allPayments.map(p => new Date(p.date).getFullYear()))].sort((a, b) => b - a);
    filterYear.innerHTML = ['<option value="">Todos</option>', ...years.map(y => `<option value="${y}">${y}</option>`)].join('');
};

const applyFilters = () => {
    filteredPayments = allPayments.filter(p => {
        const d = new Date(p.date);
        if (filterCategory.value && p.category !== filterCategory.value) return false;
        if (filterMonth.value && (d.getMonth() + 1) !== Number(filterMonth.value)) return false;
        if (filterYear.value && d.getFullYear() !== Number(filterYear.value)) return false;
        return true;
    });
    filteredPayments.sort((a, b) => {
        const dir = sortDirection === 'asc' ? 1 : -1;
        if (sortField === 'amount') return (Number(a.amount) - Number(b.amount)) * dir;
        return (new Date(a.date) - new Date(b.date)) * dir;
    });
    renderTable();
};

/* ── Table ── */
const renderTable = () => {
    const total = filteredPayments.reduce((s, p) => s + Number(p.amount), 0);
    resultSummary.textContent = `${filteredPayments.length} gasto(s) — Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    if (filteredPayments.length === 0) {
        tableWrap.innerHTML = '<p style="color:var(--muted);padding:1rem 0">No hay gastos registrados todavía. Aparecerán automáticamente cuando pagues con MercadoPago.</p>';
        return;
    }

    const sortIcon = (field) => {
        if (sortField !== field) return '';
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    tableWrap.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th class="sortable" data-field="date">Fecha${sortIcon('date')}</th>
                    <th>Descripción</th>
                    <th class="sortable" data-field="amount">Monto${sortIcon('amount')}</th>
                    <th>Categoría</th>
                    <th>Método</th>
                </tr>
            </thead>
            <tbody>
                ${filteredPayments.map(p => `
                    <tr>
                        <td>${new Date(p.date).toLocaleDateString('es-AR')}</td>
                        <td>${escapeHtml(p.description || '—')}</td>
                        <td>$${Number(p.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        <td>${escapeHtml(p.category)}</td>
                        <td>${escapeHtml(p.paymentMethod || '—')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;

    tableWrap.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.field;
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'desc';
            }
            applyFilters();
        });
    });
};

const escapeHtml = (str) => {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
};

/* ── Data ── */
const loadPayments = async () => {
    try {
        const { connected } = await window.apiFetch('/mercadopago/status');
        if (!connected) {
            tableWrap.innerHTML = '<p style="color:var(--muted);padding:1rem 0">Conectá tu cuenta de MercadoPago desde tu <a href="profile.html" style="color:var(--primary)">Perfil</a> para registrar gastos automáticamente.</p>';
            return;
        }
        allPayments = await window.apiFetch('/mercadopago/payments');
        setYearOptions();
        applyFilters();
    } catch (error) {
        showAlert(error.message, 'error');
    }
};

btnFilter.addEventListener('click', applyFilters);
btnClearFilters.addEventListener('click', () => {
    filterCategory.value = '';
    filterMonth.value = '';
    filterYear.value = '';
    applyFilters();
});

setFilterOptions();
loadPayments();
