import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';//se agrego dotenv
dotenv.config();

const dbPassword = process.env.SECRET_KEY;
const dbPassword2 = process.env.SECRET_KEY2;
const pool = createPool({
    host: 'b3zynustzghx1t94uama-mysql.services.clever-cloud.com',
    user: 'uyy5ny5uxvgfphu0',
    password: dbPassword,
    database: 'b3zynustzghx1t94uama',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5
});

/* const pool = createPool({
    host: 'mysql-nodetpf.alwaysdata.net',
    user: 'nodetpf',
    password: dbPassword2,
    database: 'nodetpf_demousuarios',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5
}); */

pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('Base de datos conectada');
    })
    .catch(err => {
        console.error('Hubo un error al conectarse a la DB:', err);
    });


export default pool;