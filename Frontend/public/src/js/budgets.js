if (!window.auth.checkAuth('user')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('budgets.html');

const selectBudgetMonth = document.getElementById('selectBudgetMonth');
const selectBudgetYear = document.getElementById('selectBudgetYear');
const budgetsProgressContainer = document.getElementById('budgetsProgressContainer');
const budgetMessage = document.getElementById('budgetMessage');

const budgetFormTitle = document.getElementById('budgetFormTitle');
const selectBudgetCategory = document.getElementById('selectBudgetCategory');
const inputBudgetAmount = document.getElementById('inputBudgetAmount');
const btnSaveBudget = document.getElementById('btnSaveBudget');
const btnCancelBudget = document.getElementById('btnCancelBudget');
const budgetFormMessage = document.getElementById('budgetFormMessage');

let editingBudgetId = null;
let currentProgress = [];

const getSelectedMonthYear = () => ({
    month: Number(selectBudgetMonth.value),
    year: Number(selectBudgetYear.value)
});

const monthLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const setSelectors = () => {
    const now = new Date();
    const year = now.getFullYear();

    selectBudgetMonth.innerHTML = monthLabels
        .map((label, index) => `<option value="${index + 1}">${label}</option>`)
        .join('');
    selectBudgetYear.innerHTML = `<option value="${year}">${year}</option><option value="${year + 1}">${year + 1}</option>`;

    selectBudgetMonth.value = String(now.getMonth() + 1);
    selectBudgetYear.value = String(year);
};

const progressColor = (percentage) => {
    if (percentage < 70) return '#16a34a';
    if (percentage < 90) return '#d97706';
    if (percentage <= 100) return '#dc2626';
    return '#991b1b';
};

const renderCategoryOptions = () => {
    const used = new Set(currentProgress.map((item) => item.category));
    const available = window.ui.CATEGORIES.filter((category) => !used.has(category));

    if (editingBudgetId) {
        selectBudgetCategory.disabled = true;
        return;
    }

    selectBudgetCategory.disabled = false;
    selectBudgetCategory.innerHTML = available.map((category) => `<option value="${category}">${category}</option>`).join('');

    if (!available.length) {
        selectBudgetCategory.innerHTML = '<option value="">Todas las categorias ya tienen presupuesto</option>';
        selectBudgetCategory.disabled = true;
    }
};

const setEditMode = (budget) => {
    editingBudgetId = budget.budgetId;
    budgetFormTitle.textContent = 'Editar presupuesto';
    btnCancelBudget.classList.remove('hidden');
    selectBudgetCategory.innerHTML = `<option value="${budget.category}">${budget.category}</option>`;
    selectBudgetCategory.disabled = true;
    inputBudgetAmount.value = budget.budgetAmount;
};

const resetFormMode = () => {
    editingBudgetId = null;
    budgetFormTitle.textContent = 'Nuevo presupuesto';
    btnCancelBudget.classList.add('hidden');
    inputBudgetAmount.value = '';
    renderCategoryOptions();
};

const renderProgress = () => {
    if (!currentProgress.length) {
        budgetsProgressContainer.innerHTML = '<p>No definiste presupuestos para este mes. Crea uno.</p>';
        return;
    }

    budgetsProgressContainer.innerHTML = currentProgress.map((item) => {
        const color = progressColor(item.percentage);
        const limited = Math.min(item.percentage, 100);
        return `
            <article class="card" style="margin-bottom:.6rem;box-shadow:none;">
                <h3 class="section-title" style="font-size:1rem;">${item.category}</h3>
                <div class="progress-track"><div class="progress-bar" style="width:${limited}%;background:${color}"></div></div>
                <p class="section-subtitle">Gastaste ${window.ui.formatCurrency(item.spent)} de ${window.ui.formatCurrency(item.budgetAmount)} (${Math.round(item.percentage)}%)</p>
                ${item.percentage > 100 ? '<p style="color:#991b1b;font-weight:700;">Superaste el presupuesto.</p>' : ''}
                <div style="display:flex;gap:.4rem;">
                    <button class="btn btn-secondary" type="button" data-edit-budget="${item.budgetId}">Editar</button>
                    <button class="btn btn-danger" type="button" data-delete-budget="${item.budgetId}">Eliminar</button>
                </div>
            </article>
        `;
    }).join('');

    budgetsProgressContainer.querySelectorAll('[data-edit-budget]').forEach((button) => {
        button.addEventListener('click', () => {
            const budget = currentProgress.find((item) => item.budgetId === Number(button.dataset.editBudget));
            if (budget) {
                setEditMode(budget);
            }
        });
    });

    budgetsProgressContainer.querySelectorAll('[data-delete-budget]').forEach((button) => {
        button.addEventListener('click', async () => {
            const ok = window.confirm('Eliminar este presupuesto?');
            if (!ok) {
                return;
            }

            try {
                await window.apiFetch(`/budgets/${button.dataset.deleteBudget}`, { method: 'DELETE' });
                await loadBudgetData();
                resetFormMode();
                window.ui.showMessage(budgetMessage, 'Presupuesto eliminado.', 'success');
            } catch (error) {
                window.ui.showMessage(budgetMessage, error.message, 'error');
            }
        });
    });
};

const loadBudgetData = async () => {
    const { month, year } = getSelectedMonthYear();
    currentProgress = await window.apiFetch(`/budgets/progress?month=${month}&year=${year}`);
    renderProgress();
    renderCategoryOptions();
};

btnSaveBudget.addEventListener('click', async () => {
    window.ui.hideMessage(budgetFormMessage);

    const amount = Number(inputBudgetAmount.value);
    if (!Number.isFinite(amount) || amount <= 0) {
        window.ui.showMessage(budgetFormMessage, 'El monto debe ser mayor a cero.', 'error');
        return;
    }

    const { month, year } = getSelectedMonthYear();

    try {
        if (editingBudgetId) {
            await window.apiFetch(`/budgets/${editingBudgetId}`, {
                method: 'PUT',
                body: JSON.stringify({ amount })
            });
            window.ui.showMessage(budgetFormMessage, 'Presupuesto actualizado.', 'success');
        } else {
            await window.apiFetch('/budgets', {
                method: 'POST',
                body: JSON.stringify({
                    category: selectBudgetCategory.value,
                    amount,
                    month,
                    year
                })
            });
            window.ui.showMessage(budgetFormMessage, 'Presupuesto creado.', 'success');
        }

        await loadBudgetData();
        resetFormMode();
    } catch (error) {
        window.ui.showMessage(budgetFormMessage, error.message, 'error');
    }
});

btnCancelBudget.addEventListener('click', resetFormMode);
selectBudgetMonth.addEventListener('change', async () => {
    await loadBudgetData();
    resetFormMode();
});
selectBudgetYear.addEventListener('change', async () => {
    await loadBudgetData();
    resetFormMode();
});

setSelectors();
loadBudgetData().catch((error) => window.ui.showMessage(budgetMessage, error.message, 'error'));
