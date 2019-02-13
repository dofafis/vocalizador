var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'EllE2327',
        database: 'vocalizador',
        timezone: 'UTC',
        dateStrings: true
    },
    pool: { min: 0, max: 10 },
});

// Exportar o módulo
module.exports = knex;