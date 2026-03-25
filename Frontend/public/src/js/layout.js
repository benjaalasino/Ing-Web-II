const USER_LINKS = [
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'expenses.html', label: 'Mis gastos' },
    { href: 'upload-ticket.html', label: 'Subir ticket' },
    { href: 'budgets.html', label: 'Presupuestos' },
    { href: 'profile.html', label: 'Perfil' }
];

const ADVISOR_LINKS = [
    { href: 'advisor-panel.html', label: 'Panel' },
    { href: 'profile.html', label: 'Perfil' }
];

const renderHeader = (activeHref) => {
    const container = document.getElementById('appHeader');
    if (!container) {
        return;
    }

    const role = window.auth.getRole();
    const links = role === 'advisor' ? ADVISOR_LINKS : USER_LINKS;
    const name = window.auth.getUserName() || 'Usuario';

    container.innerHTML = `
        <header class="app-header">
            <div class="layout">
                <a class="brand" href="${role === 'advisor' ? 'advisor-panel.html' : 'dashboard.html'}">WisePocket</a>
                <nav class="nav-links">
                    ${links
                        .map((link) => `<a class="${link.href === activeHref ? 'active' : ''}" href="${link.href}">${link.label}</a>`)
                        .join('')}
                </nav>
                <div class="header-right">
                    <span>${name}</span>
                    <button id="btnLogout" class="btn btn-secondary" type="button">Cerrar sesion</button>
                </div>
            </div>
        </header>
    `;

    const btnLogout = document.getElementById('btnLogout');
    btnLogout?.addEventListener('click', window.auth.logout);
};

window.layout = {
    renderHeader
};
