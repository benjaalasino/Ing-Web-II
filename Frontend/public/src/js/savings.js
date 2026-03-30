if (!window.auth.checkAuth('user')) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('savings.html');

const savingsGoalsContainer = document.getElementById('savingsGoalsContainer');
const savingsMessage = document.getElementById('savingsMessage');
const savingsFormTitle = document.getElementById('savingsFormTitle');
const inputSavingsTitle = document.getElementById('inputSavingsTitle');
const inputSavingsTarget = document.getElementById('inputSavingsTarget');
const inputSavingsDeadline = document.getElementById('inputSavingsDeadline');
const btnSaveSavings = document.getElementById('btnSaveSavings');
const btnCancelSavings = document.getElementById('btnCancelSavings');
const savingsFormMessage = document.getElementById('savingsFormMessage');
const depositSection = document.getElementById('depositSection');
const inputDepositAmount = document.getElementById('inputDepositAmount');
const btnDeposit = document.getElementById('btnDeposit');
const depositMessage = document.getElementById('depositMessage');

let editingGoalId = null;
let depositingGoalId = null;

const progressColor = (percentage) => {
    if (percentage >= 100) return '#16a34a';
    if (percentage >= 60) return '#059669';
    if (percentage >= 30) return '#d97706';
    return '#6b7280';
};

const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const weeksUntil = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadline + 'T00:00:00');
    const diffMs = target - today;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
};

const monthsUntil = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const target = new Date(deadline + 'T00:00:00');
    const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    return Math.max(0, months);
};

const buildTimeHint = (goal) => {
    if (!goal.deadline) return '';
    const remaining = goal.targetAmount - goal.currentAmount;
    const months = monthsUntil(goal.deadline);
    if (months <= 0) {
        return `<span style="color:#991b1b;font-size:.78rem;">Fecha limite vencida</span>`;
    }
    if (remaining <= 0) {
        return `<span style="color:#16a34a;font-size:.78rem;">Meta alcanzada 🎉</span>`;
    }
    const perMonth = Math.ceil(remaining / months);
    return `<span style="color:#4a5f4d;font-size:.78rem;">Ahorrá ${window.ui.formatCurrency(perMonth)}/mes para llegar a tiempo</span>`;
};

const renderGoals = (goals) => {
    if (!goals.length) {
        savingsGoalsContainer.innerHTML = '<p>No tenés metas creadas. Creá una para empezar a ahorrar.</p>';
        return;
    }

    savingsGoalsContainer.innerHTML = goals.map((goal) => {
        const percentage = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
        const color = progressColor(percentage);
        const deadlineText = goal.deadline ? `<span style="font-size:.75rem;color:#4a5f4d;">📅 ${formatDeadline(goal.deadline)}</span>` : '';
        const timeHint = buildTimeHint(goal);
        const completed = goal.currentAmount >= goal.targetAmount;

        return `
            <article class="card" style="margin-bottom:.6rem;box-shadow:none;${completed ? 'border-color:#86efac;' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;flex-wrap:wrap;">
                    <h3 class="section-title" style="font-size:1rem;margin:0;">${goal.title}${completed ? ' ✅' : ''}</h3>
                    <span style="font-weight:800;color:#142315;white-space:nowrap;">${window.ui.formatCurrency(goal.currentAmount)} <span style="font-weight:400;color:#4a5f4d;">/ ${window.ui.formatCurrency(goal.targetAmount)}</span></span>
                </div>
                <div class="progress-track" style="margin-top:.5rem;"><div class="progress-bar" style="width:${percentage}%;background:${color};transition:width .4s ease;"></div></div>
                <p class="section-subtitle" style="margin-top:.35rem;">${Math.round(percentage)}% completado</p>
                <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:.3rem;">
                    ${deadlineText}
                    ${timeHint}
                </div>
                <div style="display:flex;gap:.4rem;margin-top:.7rem;flex-wrap:wrap;">
                    <button class="btn btn-secondary" type="button" data-deposit-goal="${goal.id}">+ Registrar movimiento</button>
                    <button class="btn btn-secondary" type="button" data-edit-goal="${goal.id}">Editar</button>
                    <button class="btn btn-danger" type="button" data-delete-goal="${goal.id}">Eliminar</button>
                </div>
            </article>
        `;
    }).join('');

    savingsGoalsContainer.querySelectorAll('[data-edit-goal]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const goal = goals.find((g) => g.id === Number(btn.dataset.editGoal));
            if (goal) setEditMode(goal);
        });
    });

    savingsGoalsContainer.querySelectorAll('[data-delete-goal]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!window.confirm('Eliminar esta meta?')) return;
            try {
                await window.apiFetch(`/savings/${btn.dataset.deleteGoal}`, { method: 'DELETE' });
                await loadGoals();
                resetFormMode();
                window.ui.showMessage(savingsMessage, 'Meta eliminada.', 'success');
            } catch (error) {
                window.ui.showMessage(savingsMessage, error.message, 'error');
            }
        });
    });

    savingsGoalsContainer.querySelectorAll('[data-deposit-goal]').forEach((btn) => {
        btn.addEventListener('click', () => {
            depositingGoalId = Number(btn.dataset.depositGoal);
            const goal = goals.find((g) => g.id === depositingGoalId);
            depositSection.classList.remove('hidden');
            inputDepositAmount.value = '';
            window.ui.hideMessage(depositMessage);
            depositSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            depositSection.querySelector('h3').textContent = `Registrar movimiento: ${goal ? goal.title : ''}`;
        });
    });
};

const setEditMode = (goal) => {
    editingGoalId = goal.id;
    savingsFormTitle.textContent = 'Editar meta';
    btnCancelSavings.classList.remove('hidden');
    inputSavingsTitle.value = goal.title;
    inputSavingsTarget.value = goal.targetAmount;
    inputSavingsDeadline.value = goal.deadline || '';
};

const resetFormMode = () => {
    editingGoalId = null;
    savingsFormTitle.textContent = 'Nueva meta';
    btnCancelSavings.classList.add('hidden');
    inputSavingsTitle.value = '';
    inputSavingsTarget.value = '';
    inputSavingsDeadline.value = '';
    window.ui.hideMessage(savingsFormMessage);
};

const loadGoals = async () => {
    const goals = await window.apiFetch('/savings');
    renderGoals(goals);
};

btnSaveSavings.addEventListener('click', async () => {
    window.ui.hideMessage(savingsFormMessage);

    const title = inputSavingsTitle.value.trim();
    const targetAmount = Number(inputSavingsTarget.value);
    const deadline = inputSavingsDeadline.value || undefined;

    if (!title) {
        window.ui.showMessage(savingsFormMessage, 'El nombre es obligatorio.', 'error');
        return;
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        window.ui.showMessage(savingsFormMessage, 'El monto objetivo debe ser mayor a cero.', 'error');
        return;
    }

    try {
        if (editingGoalId) {
            await window.apiFetch(`/savings/${editingGoalId}`, {
                method: 'PUT',
                body: JSON.stringify({ title, targetAmount, deadline })
            });
            window.ui.showMessage(savingsFormMessage, 'Meta actualizada.', 'success');
        } else {
            await window.apiFetch('/savings', {
                method: 'POST',
                body: JSON.stringify({ title, targetAmount, deadline })
            });
            window.ui.showMessage(savingsFormMessage, 'Meta creada.', 'success');
        }
        await loadGoals();
        resetFormMode();
    } catch (error) {
        window.ui.showMessage(savingsFormMessage, error.message, 'error');
    }
});

btnCancelSavings.addEventListener('click', resetFormMode);

btnDeposit.addEventListener('click', async () => {
    window.ui.hideMessage(depositMessage);
    const amount = Number(inputDepositAmount.value);

    if (!Number.isFinite(amount) || amount === 0) {
        window.ui.showMessage(depositMessage, 'Ingresá un monto distinto de cero.', 'error');
        return;
    }

    try {
        await window.apiFetch(`/savings/${depositingGoalId}/deposit`, {
            method: 'PATCH',
            body: JSON.stringify({ amount })
        });
        inputDepositAmount.value = '';
        depositSection.classList.add('hidden');
        depositingGoalId = null;
        await loadGoals();
        window.ui.showMessage(savingsMessage, 'Movimiento registrado.', 'success');
    } catch (error) {
        window.ui.showMessage(depositMessage, error.message, 'error');
    }
});

loadGoals().catch((error) => window.ui.showMessage(savingsMessage, error.message, 'error'));
