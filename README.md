# PSYTrack

Sistema web de seguimiento y evaluación de pacientes psicológicos. Permite a un psicólogo llevar el control de sus expedientes, su agenda de sesiones, las notas de evolución clínica y su material de apoyo desde un solo lugar.

Proyecto académico de Ingeniería en Sistemas Computacionales del Tecnológico de Estudios Superiores de Coacalco (TESCo).

## Funcionalidades

- **Acceso de profesionales:** registro con cédula profesional única e inicio de sesión.
- **Expedientes de pacientes:** alta, consulta, edición y baja lógica (el registro se marca como inactivo y se conserva en la base de datos).
- **Agenda:** programación de citas con validación en el servidor para evitar empalmes de horario, cancelación y consulta por día.
- **Control de asistencia:** registro de asistencia o inasistencia con nota y fecha/hora automática.
- **Notas clínicas:** notas de evolución estructuradas (observaciones, evolución y plan terapéutico) con fecha y hora asignadas por el servidor.
- **Documentos y material de apoyo:** registro de documentos por paciente y biblioteca de material del psicólogo.

## Tecnologías

- **Backend:** Node.js, Express
- **Base de datos:** SQL Server (paquete `mssql`)
- **Frontend:** HTML, CSS y JavaScript
- **Otros:** `cors`, `dotenv`

## Estructura del proyecto

```
PSYTrack_Sistema/
├── server.js            # Servidor y API REST
├── index.html           # Inicio de sesión
├── registro.html        # Registro de psicólogos
├── dashboard.html       # Menú principal
├── pacientes.html       # Expedientes
├── agenda.html          # Citas y asistencia
├── historial.html       # Expediente clínico del paciente
├── notas.html           # Módulo clínico
├── material.html        # Biblioteca de recursos
├── estilos.css
├── database/
│   └── PSYTrackDB.sql   # Script de creación de la base de datos y tablas
└── docs/
    └── Manual_de_usuario_PSYTrack.pdf
```

## Cómo ejecutarlo

### Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- SQL Server con autenticación SQL habilitada (por ejemplo, SQL Server Express)

### Pasos

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone https://github.com/TU_USUARIO/PSYTrack.git
   cd PSYTrack
   npm install
   ```

2. Crea la base de datos ejecutando el script `database/PSYTrackDB.sql` en SQL Server Management Studio (o la herramienta que uses).

3. Copia `.env.example` como `.env` y completa tus datos de conexión:

   ```bash
   cp .env.example .env
   ```

   ```
   DB_USER=sa
   DB_PASSWORD=tu_contraseña_de_sql_server
   DB_SERVER=localhost
   DB_NAME=PSYTrackDB
   PORT=3001
   ```

4. Inicia el servidor:

   ```bash
   npm start
   ```

5. Abre <http://localhost:3001/index.html> en el navegador (se recomienda Google Chrome).

## Documentación

El manual de usuario con el recorrido por cada módulo está en [`docs/Manual_de_usuario_PSYTrack.pdf`](docs/Manual_de_usuario_PSYTrack.pdf).

## Limitaciones conocidas

Es un proyecto académico (versión 1.0) y hay puntos que no están pensados para producción:

- Las contraseñas de los psicólogos se guardan en texto plano. Mejora pendiente: cifrarlas (por ejemplo, con `bcrypt`).
- La API no usa sesiones ni tokens: el frontend envía el identificador del psicólogo en cada petición.
- La carga de documentos y de material de apoyo solo registra el título, el tipo y la fecha; el archivo no se almacena en el servidor.
- El envío de material al correo del paciente está simulado: valida que el paciente tenga correo registrado y responde con la confirmación, pero no envía ningún mensaje.
- Pensado para ejecutarse en red local; no incluye HTTPS.

## Autor

Erick Leonardo Pérez Velázquez
Ingeniería en Sistemas Computacionales, TESCo
