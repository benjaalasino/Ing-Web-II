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

window.ui = {
    CATEGORIES,
    CATEGORY_COLORS,
    formatCurrency,
    formatDate,
    monthName,
    showMessage,
    hideMessage,
    buildBadge
};
