const USER_LINKS = [
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'expenses.html', label: 'Mis gastos' },
    { href: 'upload-ticket.html', label: 'Subir ticket' },
    { href: 'budgets.html', label: 'Presupuestos' },
    { href: 'savings.html', label: 'Metas de ahorro' },
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
    'savings.html': 'Metas de ahorro',
    'profile.html': 'Perfil',
    'advisor-panel.html': 'Panel asesor',
    'advisor-user-detail.html': 'Detalle del usuario'
};

// Los íconos viven en un sprite externo (../img/icons.svg); aquí solo se
// referencia el id de cada símbolo para evitar duplicar el SVG en el código.
const ICON_SPRITE = '../img/icons.svg';

const icon = (id) => `<svg aria-hidden="true"><use href="${ICON_SPRITE}#icon-${id}"></use></svg>`;

const NAV_ICONS = {
    'dashboard.html': icon('dashboard'),
    'expenses.html': icon('expenses'),
    'upload-ticket.html': icon('upload-ticket'),
    'budgets.html': icon('budgets'),
    'savings.html': icon('savings'),
    'profile.html': icon('profile'),
    'advisor-panel.html': icon('advisor-panel'),
    'advisor-user-detail.html': icon('advisor-user-detail')
};

const ARROW_SVG = icon('arrow');

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
                <span class="brand-name">Cuentas Claras</span>
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
