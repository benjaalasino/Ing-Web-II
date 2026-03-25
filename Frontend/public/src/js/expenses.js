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

let allExpenses = [];
let filteredExpenses = [];
let sortField = 'date';
let sortDirection = 'desc';
let editingId = null;
let deletingId = null;

const monthNames = ['Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const setFilterOptions = () => {
    filterCategory.innerHTML = ['<option value="">Todas</option>', ...window.ui.CATEGORIES.map((c) => `<option value="${c}">${c}</option>`)].join('');
    filterMonth.innerHTML = monthNames.map((name, index) => `<option value="${index === 0 ? '' : index}">${name}</option>`).join('');
    editCategory.innerHTML = window.ui.CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
};

const setYearOptions = () => {
    const years = [...new Set(allExpenses.map((expense) => new Date(expense.date).getFullYear()))].sort((a, b) => b - a);
    filterYear.innerHTML = ['<option value="">Todos</option>', ...years.map((year) => `<option value="${year}">${year}</option>`)].join('');
};

const applySorting = () => {
    filteredExpenses.sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (sortField === 'amount') {
            return (Number(a.amount) - Number(b.amount)) * direction;
        }
        return (new Date(a.date) - new Date(b.date)) * direction;
    });
};

const renderSummary = () => {
    const total = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    resultSummary.innerHTML = `Mostrando <strong>${filteredExpenses.length} gastos</strong> - Total: <strong>${window.ui.formatCurrency(total)}</strong>`;
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
    if (!filteredExpenses.length) {
        const hasFilters = filterCategory.value || filterMonth.value || filterYear.value || filterCommerce.value.trim();
        tableWrap.innerHTML = hasFilters
            ? '<p>No encontramos gastos con esos filtros.</p>'
            : '<p>Todavia no tenes gastos registrados. <a href="upload-ticket.html">Sube tu primer ticket</a>.</p>';
        renderSummary();
        return;
    }

    tableWrap.innerHTML = `
        <table id="tableExpenses">
            <thead>
                <tr>
                    <th class="sortable" data-sort="date">Fecha</th>
                    <th>Comercio</th>
                    <th>Categoria</th>
                    <th class="sortable" data-sort="amount">Monto</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${filteredExpenses.map((expense) => `
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
    `;

    tableWrap.querySelectorAll('[data-edit]').forEach((button) => {
        button.addEventListener('click', () => {
            const expense = allExpenses.find((item) => item.id === Number(button.dataset.edit));
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
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = field === 'date' ? 'desc' : 'asc';
            }
            applySorting();
            renderTable();
        });
    });

    renderSummary();
};

const applyFilters = () => {
    const category = filterCategory.value;
    const month = filterMonth.value;
    const year = filterYear.value;
    const commerce = filterCommerce.value.trim().toLowerCase();

    filteredExpenses = allExpenses.filter((expense) => {
        const date = new Date(expense.date);

        if (category && expense.category !== category) {
            return false;
        }
        if (month && date.getMonth() + 1 !== Number(month)) {
            return false;
        }
        if (year && date.getFullYear() !== Number(year)) {
            return false;
        }
        if (commerce && !expense.commerce.toLowerCase().includes(commerce)) {
            return false;
        }

        return true;
    });

    applySorting();
    renderTable();
};

const loadExpenses = async () => {
    allExpenses = await window.apiFetch('/expenses');
    filteredExpenses = [...allExpenses];
    setYearOptions();
    applySorting();
    renderTable();
};

btnFilter.addEventListener('click', applyFilters);
btnClearFilters.addEventListener('click', () => {
    filterCategory.value = '';
    filterMonth.value = '';
    filterYear.value = '';
    filterCommerce.value = '';
    applyFilters();
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
        await loadExpenses();
        applyFilters();
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
        await loadExpenses();
        applyFilters();
    } catch (error) {
        window.ui.showMessage(deleteError, error.message, 'error');
    }
});

setFilterOptions();
loadExpenses().catch((error) => window.ui.showMessage(errorMessage, error.message, 'error'));
