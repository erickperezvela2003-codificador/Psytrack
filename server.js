require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// --- 1. CONFIGURACIÓN DE LA BASE DE DATOS ---
// Las credenciales se leen del archivo .env (ver .env.example); no se guardan en el código.
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'PSYTrackDB',
    options: { encrypt: false, trustServerCertificate: true }
};

// --- 2. CONEXIÓN ---
sql.connect(dbConfig).then(pool => {
    if (pool.connected) console.log('✅ ¡BASE DE DATOS CONECTADA EXITOSAMENTE!');
}).catch(err => console.error('❌ ERROR CRÍTICO DE CONEXIÓN:', err));

// --- 3. RUTAS DEL SISTEMA (API) ---

// USUARIOS
app.post('/api/registro', async (req, res) => {
    const { nombre, cedula, correo, password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const check = await pool.request().input('c', cedula).input('m', correo).query("SELECT * FROM Psicologos WHERE Cedula = @c OR Correo = @m");
        if (check.recordset.length > 0) return res.json({ success: false, message: 'Usuario ya existe' });
        await pool.request().input('n', nombre).input('c', cedula).input('m', correo).input('p', password).query("INSERT INTO Psicologos VALUES (@n, @c, @m, @p, GETDATE())");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('c', correo).input('p', password).query("SELECT * FROM Psicologos WHERE Correo = @c AND Contrasena = @p");
        if (result.recordset.length > 0) res.json({ success: true, user: result.recordset[0] });
        else res.json({ success: false, message: 'Credenciales incorrectas' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PACIENTES (CRUD)
app.get('/api/pacientes', async (req, res) => {
    const { id_psicologo } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', sql.Int, id_psicologo).query("SELECT * FROM Pacientes WHERE ID_Psicologo = @id AND Activo = 1 ORDER BY Nombres ASC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/pacientes/detalle', async (req, res) => {
    const { id } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', sql.Int, id).query("SELECT * FROM Pacientes WHERE ID_Paciente = @id");
        res.json(result.recordset[0]);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/pacientes', async (req, res) => {
    const { id_psicologo, nombres, apellidos, fecha, telefono, email, direccion, motivo } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', id_psicologo).input('n', nombres).input('a', apellidos).input('f', fecha).input('t', telefono).input('e', email).input('d', direccion).input('m', motivo)
            .query("INSERT INTO Pacientes (ID_Psicologo, Nombres, Apellidos, FechaNacimiento, Telefono, Email, Direccion, MotivoConsulta) VALUES (@id, @n, @a, @f, @t, @e, @d, @m)");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- RUTA NUEVA: EDITAR PACIENTE ---
app.post('/api/pacientes/editar', async (req, res) => {
    const { id, telefono, email, direccion, motivo } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id).input('t', telefono).input('e', email).input('d', direccion).input('m', motivo)
            .query("UPDATE Pacientes SET Telefono = @t, Email = @e, Direccion = @d, MotivoConsulta = @m WHERE ID_Paciente = @id");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/pacientes/eliminar', async (req, res) => {
    const { id } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().input('id', sql.Int, id).query("UPDATE Pacientes SET Activo = 0 WHERE ID_Paciente = @id");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// AGENDA
app.get('/api/citas', async (req, res) => {
    const { id_psicologo, fecha } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', id_psicologo).input('fecha', fecha).query(`
            SELECT C.ID_Cita, C.FechaHora, C.Motivo, C.Estado, P.Nombres, P.Apellidos 
            FROM Citas C JOIN Pacientes P ON C.ID_Paciente = P.ID_Paciente
            WHERE C.ID_Psicologo = @id AND CAST(C.FechaHora AS DATE) = @fecha ORDER BY C.FechaHora ASC`);
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/citas/historial', async (req, res) => {
    const { id_paciente } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', id_paciente).query("SELECT * FROM Citas WHERE ID_Paciente = @id ORDER BY FechaHora DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/citas', async (req, res) => {
    const { id_psicologo, id_paciente, fechaHora, motivo } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const check = await pool.request().input('id', id_psicologo).input('fecha', new Date(fechaHora)).query("SELECT * FROM Citas WHERE ID_Psicologo = @id AND FechaHora = @fecha AND Estado != 'Cancelada'");
        if (check.recordset.length > 0) return res.json({ success: false, message: '⚠️ Horario ocupado.' });

        await pool.request().input('id_p', id_psicologo).input('id_pac', id_paciente).input('f', new Date(fechaHora)).input('m', motivo)
            .query("INSERT INTO Citas (ID_Psicologo, ID_Paciente, FechaHora, Motivo, Estado) VALUES (@id_p, @id_pac, @f, @m, 'Programada')");
        res.json({ success: true });
    } catch (err) { res.json({ success: false, message: err.message }); }
});

app.post('/api/citas/cancelar', async (req, res) => {
    const { id_cita } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().input('id', id_cita).query("UPDATE Citas SET Estado = 'Cancelada' WHERE ID_Cita = @id");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/asistencia', async (req, res) => {
    const { id_cita, estado, nota } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().input('id', id_cita).input('est', estado).input('not', nota).query("INSERT INTO Asistencias (ID_Cita, EstadoAsistencia, Nota, FechaRegistro) VALUES (@id, @est, @not, GETDATE())");
        let nuevoEstado = 'Finalizada';
        if(estado === 'No asistió') nuevoEstado = 'No Asistió';
        await pool.request().input('id', id_cita).input('est', nuevoEstado).query("UPDATE Citas SET Estado = @est WHERE ID_Cita = @id");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// CLÍNICO Y RECURSOS
app.get('/api/notas', async (req, res) => {
    const { id_paciente } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', id_paciente).query("SELECT * FROM NotasClinicas WHERE ID_Paciente = @id ORDER BY FechaNota DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/notas', async (req, res) => {
    const { id_paciente, id_psicologo, observaciones, evolucion, plan } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().input('id_p', id_paciente).input('id_psi', id_psicologo).input('obs', observaciones).input('evo', evolucion).input('plan', plan)
            .query("INSERT INTO NotasClinicas VALUES (@id_p, @id_psi, GETDATE(), @obs, @evo, @plan)");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/documentos', async (req, res) => {
    const { id_paciente } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', id_paciente).query("SELECT * FROM DocumentosPacientes WHERE ID_Paciente = @id ORDER BY FechaSubida DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/documentos', async (req, res) => {
    const { id_paciente, titulo, tipo } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().input('id', id_paciente).input('tit', titulo).input('tip', tipo)
            .query("INSERT INTO DocumentosPacientes (ID_Paciente, Titulo, TipoArchivo, RutaArchivo, FechaSubida) VALUES (@id, @tit, @tip, 'simulada', GETDATE())");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/material', async (req, res) => {
    const { id_psicologo } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().input('id', id_psicologo).query("SELECT * FROM MaterialApoyo WHERE ID_Psicologo = @id ORDER BY FechaSubida DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/material', async (req, res) => {
    const { id_psicologo, titulo, tipo } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().input('id', id_psicologo).input('tit', titulo).input('tip', tipo)
            .query("INSERT INTO MaterialApoyo (ID_Psicologo, Titulo, TipoArchivo, RutaArchivo, FechaSubida) VALUES (@id, @tit, @tip, 'simulada', GETDATE())");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/material/enviar', async (req, res) => {
    const { id_paciente } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const paciente = await pool.request().input('id', id_paciente).query("SELECT Email FROM Pacientes WHERE ID_Paciente = @id");
        if (paciente.recordset.length > 0 && paciente.recordset[0].Email) {
            res.json({ success: true, message: `Correo enviado a ${paciente.recordset[0].Email}` });
        } else { res.json({ success: false, message: 'El paciente no tiene un correo registrado.' }); }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

const server = app.listen(PORT, () => {
    console.log(`🚀 SISTEMA LISTO EN: http://localhost:${PORT}/index.html`);
});