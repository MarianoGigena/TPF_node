import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: 'mysql-nodetpf.alwaysdata.net',
    user: 'nodetpf',
    password: 'MGG777171',
    database: 'nodetpf_demousuarios',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5
});

pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('Base de datos conectada');
    })
    .catch(err => {
        console.error('Hubo un error al conectarse a la DB:', err);
    });


export default pool;