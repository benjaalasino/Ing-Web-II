const USER_LINKS = [
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'expenses.html', label: 'Mis gastos' },
    { href: 'upload-ticket.html', label: 'Subir ticket' },
    { href: 'budgets.html', label: 'Presupuestos' },
    { href: 'mercadopago.html', label: 'MercadoPago' },
    { href: 'profile.html', label: 'Perfil' }
];

const ADVISOR_LINKS = [
    { href: 'advisor-panel.html', label: 'Panel' },
    { href: 'advisor-user-detail.html', label: 'Detalle usuario' },
    { href: 'profile.html', label: 'Perfil' }
];

const PAGE_TITLES = {
    'dashboard.html': 'Dashboard',
    'expenses.html': 'Mis gastos',
    'upload-ticket.html': 'Subir ticket',
    'budgets.html': 'Presupuestos',
    'profile.html': 'Perfil',
    'mercadopago.html': 'MercadoPago',
    'advisor-panel.html': 'Panel asesor',
    'advisor-user-detail.html': 'Detalle del usuario'
};

const NAV_ICONS = {
    'dashboard.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    'expenses.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>',
    'upload-ticket.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    'budgets.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
    'mercadopago.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
    'profile.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
    'advisor-panel.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'advisor-user-detail.html': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/><circle cx="17" cy="17" r="3"/><path d="m21 21-1.9-1.9"/></svg>'
};

const ARROW_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

const renderHeader = (activeHref) => {
    const container = document.getElementById('appHeader');
    if (!container) {
        return;
    }

    const role = window.auth.getRole();
    const links = role === 'advisor' ? ADVISOR_LINKS : USER_LINKS;
    const name = window.auth.getUserName() || 'Usuario';
    const pageTitle = PAGE_TITLES[activeHref] || 'Dashboard';

    document.body.classList.add('has-app-shell');

    container.innerHTML = `
        <aside class="app-shell">
            <a class="brand" href="${role === 'advisor' ? 'advisor-panel.html' : 'dashboard.html'}">
                <img src="../img/logo.svg" alt="Cuentas Claras" class="brand-logo">
            </a>
            <div>
                <p class="menu-title">Menu</p>
                <nav class="nav-links">
                    ${links
                        .filter(l => l.href !== 'profile.html')
                        .map((link) => `
                            <a class="${link.href === activeHref ? 'active' : ''}" href="${link.href}">
                                <span class="nav-icon">${NAV_ICONS[link.href] || ''}</span>
                                <span>${link.label}</span>
                            </a>
                        `)
                        .join('')}
                </nav>
            </div>
            <div>
                <p class="menu-title">General</p>
                <nav class="nav-links">
                    <a href="profile.html" class="${activeHref === 'profile.html' ? 'active' : ''}">
                        <span class="nav-icon">${NAV_ICONS['profile.html']}</span>
                        <span>Perfil</span>
                    </a>
                </nav>
            </div>
        </aside>

        <header class="app-topbar">
            <div style="display:flex;align-items:center;gap:.7rem;">
                <button id="btnNavToggle" class="mobile-menu-btn" type="button" aria-label="Abrir menu">☰</button>
                <div>
                    <p class="page-eyebrow">Cuentas Claras</p>
                    <h1 class="page-title">${pageTitle}</h1>
                </div>
            </div>
            <div class="header-right">
                <span class="user-pill">${name}</span>
                <button id="btnLogout" class="btn btn-secondary" type="button">Cerrar sesión</button>
            </div>
        </header>
    `;

    const btnLogout = document.getElementById('btnLogout');
    btnLogout?.addEventListener('click', window.auth.logout);

    const btnNavToggle = document.getElementById('btnNavToggle');
    btnNavToggle?.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });
};

window.layout = {
    renderHeader,
    ARROW_SVG
};
