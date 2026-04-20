const CATEGORIES = ['Comida', 'Transporte', 'Salud', 'Entretenimiento', 'Supermercado', 'Educacion', 'Otros'];

const CATEGORY_COLORS = {
    Comida: '#ff8c42',
    Transporte: '#5c7aff',
    Salud: '#20b486',
    Entretenimiento: '#ef476f',
    Supermercado: '#f4a261',
    Educacion: '#8d6cab',
    Otros: '#6c757d'
};

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(amount);
};

const formatDate = (value) => {
    if (!value) {
        return '-';
    }
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-AR').format(date);
};

const monthName = (monthNumber) => {
    return new Date(2026, Number(monthNumber) - 1, 1).toLocaleDateString('es-AR', { month: 'long' });
};

const showMessage = (element, text, type) => {
    if (!element) {
        return;
    }
    element.textContent = text;
    element.classList.remove('hidden', 'error-message', 'success-message');
    element.classList.add(type === 'error' ? 'error-message' : 'success-message');
};

const hideMessage = (element) => {
    if (!element) {
        return;
    }
    element.classList.add('hidden');
    element.textContent = '';
};

const buildBadge = (category) => {
    const color = CATEGORY_COLORS[category] || '#6c757d';
    return `<span class="badge" style="background:${color}">${category}</span>`;
};

const withLoading = async (btn, loadingText, originalText, action) => {
    btn.disabled = true;
    btn.textContent = loadingText;
    try { await action(); } finally { btn.disabled = false; btn.textContent = originalText; }
};

const setupCodeDigits = (inputs) => {
    inputs.forEach((input, idx) => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '').slice(0, 1);
            if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && idx > 0) inputs[idx - 1].focus();
        });
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, inputs.length);
            inputs.forEach((inp, i) => { inp.value = paste[i] || ''; });
            if (paste.length > 0) inputs[Math.min(paste.length, inputs.length - 1)].focus();
        });
    });
};

const getCodeValue = (inputs) => Array.from(inputs).map((i) => i.value).join('');

const renderDoughnutChart = (canvas, categoryData) => {
    const entries = Object.entries(categoryData || {}).filter(([, v]) => Number(v) > 0);
    if (!entries.length) return null;
    return new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: entries.map(([label]) => label),
            datasets: [{
                data: entries.map(([, value]) => value),
                backgroundColor: entries.map(([label]) => CATEGORY_COLORS[label] || '#6b7280')
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
};

const renderBarChart = (canvas, monthlyData) => {
    const entries = Object.entries(monthlyData || {}).sort((a, b) => a[0].localeCompare(b[0]));
    if (!entries.length) return null;
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: entries.map(([key]) => {
                const [y, m] = key.split('-');
                return `${monthName(m).slice(0, 3)} ${y}`;
            }),
            datasets: [{ data: entries.map(([, amount]) => amount), backgroundColor: '#0f766e' }]
        }
    });
};

window.ui = {
    CATEGORIES,
    CATEGORY_COLORS,
    formatCurrency,
    formatDate,
    monthName,
    showMessage,
    hideMessage,
    buildBadge,
    withLoading,
    setupCodeDigits,
    getCodeValue,
    renderDoughnutChart,
    renderBarChart
};
