if (!window.auth.checkAuth('user')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('expenses.html');

const filterCategory = document.getElementById('filterCategory');
const filterMonth = document.getElementById('filterMonth');
const filterYear = document.getElementById('filterYear');
const filterCommerce = document.getElementById('filterCommerce');
const btnFilter = document.getElementById('btnFilter');
const btnClearFilters = document.getElementById('btnClearFilters');
const resultSummary = document.getElementById('resultSummary');
const tableWrap = document.getElementById('tableExpensesWrap');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

const modalEdit = document.getElementById('modalEdit');
const editCommerce = document.getElementById('editCommerce');
const editDate = document.getElementById('editDate');
const editAmount = document.getElementById('editAmount');
const editCategory = document.getElementById('editCategory');
const editDescription = document.getElementById('editDescription');
const btnSaveEdit = document.getElementById('btnSaveEdit');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const editError = document.getElementById('editError');

const modalDeleteConfirm = document.getElementById('modalDeleteConfirm');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const deleteError = document.getElementById('deleteError');

// Cantidad de gastos por tanda. El backend filtra, ordena y pagina; el front
// solo acumula lo que va recibiendo y pide la siguiente tanda con "Ver más".
const PAGE_SIZE = 10;

const state = {
    items: [],        // gastos ya cargados (se van concatenando)
    total: 0,         // total que matchea el filtro actual (lo informa el backend)
    totalAmount: 0,   // suma de TODO lo filtrado (no solo lo cargado)
    sort: 'date',
    order: 'desc'
};

let editingId = null;
let deletingId = null;

const monthNames = ['Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const setFilterOptions = () => {
    filterCategory.innerHTML = ['<option value="">Todas</option>', ...window.ui.CATEGORIES.map((c) => `<option value="${c}">${c}</option>`)].join('');
    filterMonth.innerHTML = monthNames.map((name, index) => `<option value="${index === 0 ? '' : index}">${name}</option>`).join('');
    editCategory.innerHTML = window.ui.CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
};

// Sin traer todos los gastos no podemos derivar los años; usamos un rango fijo
// (año actual y los 5 anteriores), suficiente para filtrar.
const setYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year -= 1) {
        years.push(year);
    }
    filterYear.innerHTML = ['<option value="">Todos</option>', ...years.map((year) => `<option value="${year}">${year}</option>`)].join('');
};

const getFilters = () => ({
    category: filterCategory.value,
    month: filterMonth.value,
    year: filterYear.value,
    commerce: filterCommerce.value.trim()
});

const hasFiltersApplied = () => {
    const filters = getFilters();
    return Boolean(filters.category || filters.month || filters.year || filters.commerce);
};

const buildQuery = (offset, limit) => {
    const filters = getFilters();
    const params = new URLSearchParams();

    if (filters.category) params.set('category', filters.category);
    if (filters.month) params.set('month', filters.month);
    if (filters.year) params.set('year', filters.year);
    if (filters.commerce) params.set('commerce', filters.commerce);

    params.set('sort', state.sort);
    params.set('order', state.order);
    params.set('limit', limit);
    params.set('offset', offset);

    return params.toString();
};

const fetchPage = (offset, limit) => window.apiFetch(`/expenses?${buildQuery(offset, limit)}`);

const renderSummary = () => {
    if (!state.total) {
        resultSummary.innerHTML = '';
        return;
    }
    resultSummary.innerHTML = `Mostrando <strong>${state.items.length}</strong> de <strong>${state.total} gastos</strong> - Total: <strong>${window.ui.formatCurrency(state.totalAmount)}</strong>`;
};

const openEdit = (expense) => {
    editingId = expense.id;
    editCommerce.value = expense.commerce;
    editDate.value = expense.date;
    editAmount.value = expense.amount;
    editCategory.value = expense.category;
    editDescription.value = expense.description || '';
    window.ui.hideMessage(editError);
    modalEdit.classList.remove('hidden');
};

const openDelete = (expenseId) => {
    deletingId = expenseId;
    window.ui.hideMessage(deleteError);
    modalDeleteConfirm.classList.remove('hidden');
};

const renderTable = () => {
    if (!state.items.length) {
        tableWrap.innerHTML = hasFiltersApplied()
            ? '<p>No encontramos gastos con esos filtros.</p>'
            : '<p>Todavia no tenes gastos registrados. <a href="upload-ticket.html">Sube tu primer ticket</a>.</p>';
        renderSummary();
        return;
    }

    const indicator = (field) => (state.sort === field ? (state.order === 'asc' ? ' ▲' : ' ▼') : '');
    const remaining = state.total - state.items.length;
    const hasMore = remaining > 0;

    tableWrap.innerHTML = `
        <table id="tableExpenses">
            <thead>
                <tr>
                    <th class="sortable" data-sort="date">Fecha${indicator('date')}</th>
                    <th>Comercio</th>
                    <th>Categoria</th>
                    <th class="sortable" data-sort="amount">Monto${indicator('amount')}</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${state.items.map((expense) => `
                    <tr>
                        <td>${window.ui.formatDate(expense.date)}</td>
                        <td>${expense.commerce.length > 30 ? `${expense.commerce.slice(0, 30)}...` : expense.commerce}</td>
                        <td>${window.ui.buildBadge(expense.category)}</td>
                        <td>${window.ui.formatCurrency(expense.amount)}</td>
                        <td>
                            <button data-edit="${expense.id}" class="btn btn-secondary" type="button">Editar</button>
                            <button data-delete="${expense.id}" class="btn btn-danger" type="button">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${hasMore ? `<div style="text-align:center;margin-top:1rem;"><button id="btnLoadMore" type="button" class="btn btn-secondary">Ver más (${remaining} restantes)</button></div>` : ''}
    `;

    tableWrap.querySelectorAll('[data-edit]').forEach((button) => {
        button.addEventListener('click', () => {
            const expense = state.items.find((item) => item.id === Number(button.dataset.edit));
            if (expense) {
                openEdit(expense);
            }
        });
    });

    tableWrap.querySelectorAll('[data-delete]').forEach((button) => {
        button.addEventListener('click', () => openDelete(Number(button.dataset.delete)));
    });

    tableWrap.querySelectorAll('[data-sort]').forEach((header) => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            if (state.sort === field) {
                state.order = state.order === 'asc' ? 'desc' : 'asc';
            } else {
                state.sort = field;
                state.order = field === 'date' ? 'desc' : 'asc';
            }
            // Reordenar implica volver a pedir desde la primera tanda.
            loadFirst().catch((error) => window.ui.showMessage(errorMessage, error.message, 'error'));
        });
    });

    const btnLoadMore = document.getElementById('btnLoadMore');
    btnLoadMore?.addEventListener('click', () => {
        btnLoadMore.disabled = true;
        btnLoadMore.textContent = 'Cargando...';
        loadMore().catch((error) => window.ui.showMessage(errorMessage, error.message, 'error'));
    });

    renderSummary();
};

// Primera tanda: reemplaza lo cargado (uso al filtrar, ordenar o limpiar).
const loadFirst = async () => {
    const page = await fetchPage(0, PAGE_SIZE);
    state.items = page.items;
    state.total = page.total;
    state.totalAmount = page.totalAmount;
    renderTable();
};

// Siguiente tanda: pide desde donde quedo y concatena.
const loadMore = async () => {
    const page = await fetchPage(state.items.length, PAGE_SIZE);
    state.items = state.items.concat(page.items);
    state.total = page.total;
    state.totalAmount = page.totalAmount;
    renderTable();
};

// Tras crear/editar/borrar: recarga la misma ventana que el usuario tenia
// abierta (preserva las tandas que ya habia expandido con "Ver más").
const reloadCurrent = async () => {
    const windowSize = Math.max(state.items.length, PAGE_SIZE);
    const page = await fetchPage(0, windowSize);
    state.items = page.items;
    state.total = page.total;
    state.totalAmount = page.totalAmount;
    renderTable();
};

btnFilter.addEventListener('click', () => {
    loadFirst().catch((error) => window.ui.showMessage(errorMessage, error.message, 'error'));
});

btnClearFilters.addEventListener('click', () => {
    filterCategory.value = '';
    filterMonth.value = '';
    filterYear.value = '';
    filterCommerce.value = '';
    loadFirst().catch((error) => window.ui.showMessage(errorMessage, error.message, 'error'));
});

btnCancelEdit.addEventListener('click', () => modalEdit.classList.add('hidden'));
btnCancelDelete.addEventListener('click', () => modalDeleteConfirm.classList.add('hidden'));

btnSaveEdit.addEventListener('click', async () => {
    window.ui.hideMessage(editError);
    try {
        const payload = {
            commerce: editCommerce.value.trim(),
            date: editDate.value,
            amount: Number(editAmount.value),
            category: editCategory.value,
            description: editDescription.value.trim()
        };

        await window.apiFetch(`/expenses/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        modalEdit.classList.add('hidden');
        window.ui.showMessage(successMessage, 'Gasto actualizado correctamente.', 'success');
        await reloadCurrent();
    } catch (error) {
        window.ui.showMessage(editError, error.message, 'error');
    }
});

btnConfirmDelete.addEventListener('click', async () => {
    window.ui.hideMessage(deleteError);
    try {
        await window.apiFetch(`/expenses/${deletingId}`, { method: 'DELETE' });
        modalDeleteConfirm.classList.add('hidden');
        window.ui.showMessage(successMessage, 'Gasto eliminado correctamente.', 'success');
        await reloadCurrent();
    } catch (error) {
        window.ui.showMessage(deleteError, error.message, 'error');
    }
});

setFilterOptions();
setYearOptions();
loadFirst().catch((error) => window.ui.showMessage(errorMessage, error.message, 'error'));
