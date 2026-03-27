const bcrypt = require('bcryptjs');

const seededUsers = [
    {
        id: 1,
        name: 'Asesor Demo',
        email: 'advisor@wisepocket.com',
        password: bcrypt.hashSync('123456', 10),
        role: 'advisor',
        createdAt: new Date('2025-01-15').toISOString()
    },
    {
        id: 2,
        name: 'Usuario Demo',
        email: 'user@wisepocket.com',
        password: bcrypt.hashSync('123456', 10),
        role: 'user',
        createdAt: new Date('2025-02-10').toISOString()
    }
];

const seededExpenses = [
    {
        id: 1,
        userId: 2,
        commerce: 'Supermercado Dia',
        date: '2026-03-02',
        amount: 24500,
        category: 'Supermercado',
        description: 'Compra semanal',
        imageUrl: null,
        createdAt: new Date('2026-03-02').toISOString()
    },
    {
        id: 2,
        userId: 2,
        commerce: 'Farmacity',
        date: '2026-03-05',
        amount: 7800,
        category: 'Salud',
        description: 'Medicamentos',
        imageUrl: null,
        createdAt: new Date('2026-03-05').toISOString()
    },
    {
        id: 3,
        userId: 2,
        commerce: 'YPF',
        date: '2026-02-21',
        amount: 18000,
        category: 'Transporte',
        description: 'Combustible',
        imageUrl: null,
        createdAt: new Date('2026-02-21').toISOString()
    }
];

const seededBudgets = [
    {
        id: 1,
        userId: 2,
        category: 'Supermercado',
        amount: 40000,
        month: 3,
        year: 2026,
        createdAt: new Date('2026-03-01').toISOString()
    },
    {
        id: 2,
        userId: 2,
        category: 'Transporte',
        amount: 30000,
        month: 3,
        year: 2026,
        createdAt: new Date('2026-03-01').toISOString()
    }
];

const seededRecommendations = [
    {
        id: 1,
        userId: 2,
        advisorId: 1,
        text: 'Intenta limitar compras impulsivas fuera de tu lista semanal.',
        createdAt: new Date('2026-03-12').toISOString()
    },
    {
        id: 2,
        userId: 2,
        advisorId: null,
        text: 'Tus gastos de supermercado ya superan el 60% del presupuesto mensual.',
        createdAt: new Date('2026-03-18').toISOString()
    }
];

const db = {
    users: seededUsers,
    expenses: seededExpenses,
    budgets: seededBudgets,
    recommendations: seededRecommendations,
    mpTokens: [],
    mpPayments: [],
    counters: {
        users: seededUsers.length + 1,
        expenses: seededExpenses.length + 1,
        budgets: seededBudgets.length + 1,
        recommendations: seededRecommendations.length + 1,
        mpPayments: 1
    }
};

const getNextId = (key) => {
    const nextId = db.counters[key];
    db.counters[key] += 1;
    return nextId;
};

module.exports = {
    db,
    getNextId
};
