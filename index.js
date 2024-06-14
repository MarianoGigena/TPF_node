import express from 'express';
import pool from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Define __dirname en un entorno ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname)));


// Ruta para servir la página del formulario
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Define routes here
app.get('/users', async (req, res) => {

    try {
        const connection = await pool.getConnection();
        const sql = 'SELECT * FROM usuarios'
        const [rows, fields] = await connection.query(sql);
        // console.log("FIELDS -->", fields)
        connection.release();
        //res.json(rows);
        //res.json(rows);
        // Genera la tabla HTML
        let table = `
        <html>
        <head>
          <title>Usuarios</title>
          <link rel="stylesheet" type="text/css" href="/tabla.css">
           
          <style>
           
          </style>
        </head>
        <body>
          <h1 id="titulo_tabla">Lista de Usuarios</h1>
          <table>
            <thead>
              <tr>${fields.map(field => `<th>${field.name}</th>`).join('')}<th>Acciones</th></tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${fields.map(field => `<td>${row[field.name]}</td>`).join('')}
                  <td>
                  <button><a href="/users/borrar/${row.id}">Eliminar</a></button>
                  <button><a href="/users/update/${row.id}">Editar</a></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button><a href="/registro.html">volver al formulario</a></button>
        </body>
        </html>
      `;


        res.send(table);
    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }
});


app.get('/users/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const id = req.params.id
        const sql = 'SELECT * FROM usuarios WHERE id = ?';

        const [rows, fields] = await connection.query(sql, [id]);
        connection.release();
        if (rows.length === 0) {
            res.status(404).send('User not found');
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }
});


app.post('/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const { nombre, email } = req.body
        const userData = req.body; // toma la info del formulario

        const sql = 'INSERT INTO usuarios SET ?'; // (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        const [rows] = await connection.query(sql, [userData]);;
        connection.release();
        //res.json({ mensaje: 'Usuario creado', id: rows.insertId });
        res.send(`
            <html>
              <head><title>Formulario Enviado</title>
              <meta http-equiv="refresh" content="5;url=/registro.html" />
              </head>
              <body>
                <h1>Gracias, ${nombre}!</h1>
                <p>Hemos recibido tu información.</p>
              </body>
            </html>
          `);
        //res.redirect('index.html');
        // res.redirect('/users.html' + "?mensaje=Usuario creado");
    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }

});

app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const sql = 'SELECT * FROM usuarios'
        const [rows, fields] = await connection.query(sql);
        // console.log("FIELDS -->", fields)
        connection.release();
        res.json(rows);
    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }
});

//
// Ruta para servir el formulario de edición
app.get('/users/update/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const connection = await pool.getConnection();
        const sql = 'SELECT * FROM usuarios WHERE id = ?';
        const [rows, fields] = await connection.query(sql, [userId]);
        connection.release();

        if (rows.length === 0) {
            res.status(404).send('Usuario no encontrado');
            return;
        }

        const user = rows[0];

        // Genera el formulario de edición
        let form = `
        <html>
        <head>
          <title>Editar Usuario</title>
          <link rel="stylesheet" type="text/css" href="/assets/css/styles.css">
        </head>
        <body>
        <div id="registro">
          <h1>Editar Usuario de id nro:${user.id}</h1>
          <form action="/update-user/${user.id}" method="POST">
            <label for="nombre">Nombre:</label><br>
            <input type="text" id="nombre" name="nombre" value="${user.nombre}" required><br>
            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email" value="${user.email}" required><br>
            <label for="password">Password:</label><br>
            <input type="password" id="password" name="password" value="${user.password}" required><br>
            <label for="rol">Rol:</label><br>
            <input type="text" id="rol" name="rol" value="${user.rol}" required>
            <br><br>
            <button type="submit">Actualizar</button>
          </form>
          </div>
        </body>
        </html>
      `;

        res.send(form);
    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }
});
//

// Ruta para manejar la actualización de un usuario
app.post('/update-user/:id', async (req, res) => {
    const userId = req.params.id;
    const { nombre, email, password, rol } = req.body;

    try {
        const connection = await pool.getConnection();
        const sql = 'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?';

        await connection.query(sql, [nombre, email, password, rol, userId]);
        connection.release();

        // Redirige de vuelta a la lista de usuarios
        res.redirect('/users');
    } catch (err) {
        console.error('Hubo un error al actualizar el usuario en la base de datos:', err);
        res.status(500).send('Hubo un error al actualizar el usuario en la base de datos');
    }
});

/*app.post('/users/update/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const id = req.params.id;
        const userData = req.body; // toma la info del formulario

        const sql = 'UPDATE usuarios SET ? WHERE id = ?';
        const [rows] = await connection.query(sql, [userData, id]);
        connection.release();



        const user = rows[0];
        res.json({ mensaje: 'Usuario actualizado' });

    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }
});
*/

app.get('/users/borrar/:id', async (req, res) => {

    try {
        const connection = await pool.getConnection();
        const id = req.params.id;
        const sql = 'DELETE FROM usuarios WHERE id = ?';
        const [rows] = await connection.query(sql, [id]);
        connection.release();
        if (rows.affectedRows === 0) {
            res.status(404).send('User not found');
        } else {
            //res.json({ mensaje: 'Usuario eliminado' });
            // Redirige de vuelta a la lista de usuarios
            res.redirect('/users');
        }
    } catch (err) {
        console.error('Hubo un error al consultar la base de datos:', err);
        res.status(500).send('Hubo un error al consultar la base de datos');
    }

});

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})