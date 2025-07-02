const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Middleware para que Express entienda JSON
app.use(express.json());

// --- CONFIGURACION DE LA CONEXION A LA BASE DE DATOS ---
const db = mysql.createConnection({
  host: '192.168.0.104',      // La IP del servidor db01
  user: 'app_user',           // El usuario creado
  password: 'Kevin123#',      // La contraseña que se asignó para app_user
  database: 'sis313_db'       // El nombre de la base de datos creada
});

// Conectar a la Base de Datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectando exitosamente a la base de Datos MySQL.');
});

// Ruta para la pagina principal (RAIZ) para pruebas
app.get('/', (req, res) => {
  res.send('API funcional en Servidor APP01.'); // // O 'APP02' en el otro servidor
});

// --- DEFINICION DE RUTAS DEL CRUD ---

// RUTA PARA OBTENER todos los productos (READ)
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, results) => {
    if (err) { return res.status(500).send('Error en el servidor al obtener productos'); }
    res.json(results);
  });
});

// RUTA PARA CREAR un nuevo producto (CREATE)
app.post('/productos', (req, res) => {
  const { nombre, descripcion } = req.body;
  const sql = 'INSERT INTO productos (nombre, descripcion) VALUES (?, ?)';
  db.query(sql, [nombre, descripcion], (err, result) => {
    if (err) { return res.status(500).send('Error en el servidor al crear producto'); }
    res.status(201).json({ id: result.insertId, nombre, descripcion, message: 'Producto creado!' });
  });
});

// RUTA PARA ACTUALIZAR un producto existente (UPDATE)
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const sql = 'UPDATE productos SET nombre = ?, descripcion = ? WHERE id = ?';
  db.query(sql, [nombre, descripcion, id], (err, result) => {
    if (err) { return res.status(500).send('Error en el servidor al actualizar producto'); }
    res.json({ message: 'Producto actualizado!' });
  });
});

// RUTA PARA BORRAR un producto (DELETE)
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) { return res.status(500).send('Error en el servidor al borrar producto'); }
    res.json({ message: 'Producto eliminado!' });
  });
});

// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`API CRUD corriendo en el puesto ${port}`);
});