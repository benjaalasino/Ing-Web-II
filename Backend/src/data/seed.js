const bcrypt = require('bcryptjs');

module.exports = async (pool) => {
    // Only seed if users table is empty
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (Number(rows[0].count) > 0) return;

    const advisorPass = await bcrypt.hash('123456', 10);
    const userPass = await bcrypt.hash('123456', 10);

    await pool.query(`
        INSERT INTO users (name, email, password, role, email_verified, created_at) VALUES
        ($1, $2, $3, 'advisor', TRUE, '2025-01-15T00:00:00Z'),
        ($4, $5, $6, 'user', TRUE, '2025-02-10T00:00:00Z')
    `, ['Asesor Demo', 'advisor@wisepocket.com', advisorPass, 'Usuario Demo', 'user@wisepocket.com', userPass]);

    // Get seeded user IDs
    const advisor = await pool.query("SELECT id FROM users WHERE email = 'advisor@wisepocket.com'");
    const user = await pool.query("SELECT id FROM users WHERE email = 'user@wisepocket.com'");
    const userId = user.rows[0].id;
    const advisorId = advisor.rows[0].id;

    await pool.query(`
        INSERT INTO expenses (user_id, commerce, date, amount, category, description, created_at) VALUES
        ($1, 'Supermercado Dia', '2026-03-02', 24500, 'Supermercado', 'Compra semanal', '2026-03-02T00:00:00Z'),
        ($1, 'Farmacity', '2026-03-05', 7800, 'Salud', 'Medicamentos', '2026-03-05T00:00:00Z'),
        ($1, 'YPF', '2026-02-21', 18000, 'Transporte', 'Combustible', '2026-02-21T00:00:00Z')
    `, [userId]);

    await pool.query(`
        INSERT INTO budgets (user_id, category, amount, month, year, created_at) VALUES
        ($1, 'Supermercado', 40000, 3, 2026, '2026-03-01T00:00:00Z'),
        ($1, 'Transporte', 30000, 3, 2026, '2026-03-01T00:00:00Z')
    `, [userId]);

    await pool.query(`
        INSERT INTO recommendations (user_id, advisor_id, text, created_at) VALUES
        ($1, $2, 'Intenta limitar compras impulsivas fuera de tu lista semanal.', '2026-03-12T00:00:00Z'),
        ($1, NULL, 'Tus gastos de supermercado ya superan el 60% del presupuesto mensual.', '2026-03-18T00:00:00Z')
    `, [userId, advisorId]);

    console.log('[Seed] Demo data inserted.');
};
