-- ============================================================
-- SCRIPT COMPLETO DE BASE DE DATOS - PROYECTO PSYTRACK
-- Basado en los Requisitos 1 al 18 del ERS
-- ============================================================

-- 1. Crear la Base de Datos
CREATE DATABASE PSYTrackDB;
GO
USE PSYTrackDB;
GO

select * from Psicologos
-- ------------------------------------------------------------
-- 2. Tabla de Psicólogos (Usuarios)
-- Cubre: Requisito 1 (Registro) y Requisito 2 (Autenticación)
-- ------------------------------------------------------------
CREATE TABLE Psicologos (
    ID_Psicologo INT PRIMARY KEY IDENTITY(1,1),
    NombreCompleto VARCHAR(100) NOT NULL,
    Cedula VARCHAR(50) UNIQUE NOT NULL,
    Correo VARCHAR(100) UNIQUE NOT NULL,
    Contrasena VARCHAR(255) NOT NULL, -- Recuerda encriptarla en el backend
    FechaRegistro DATETIME DEFAULT GETDATE()
);

-- ------------------------------------------------------------
-- 3. Tabla de Pacientes
-- Cubre: Requisitos 3, 4, 5, 6 (Gestión completa de pacientes)
-- ------------------------------------------------------------

select* from Pacientes
CREATE TABLE Pacientes (
    ID_Paciente INT PRIMARY KEY IDENTITY(1,1),
    ID_Psicologo INT NOT NULL, -- Relación: El paciente pertenece a un psicólogo
    Nombres VARCHAR(50) NOT NULL,
    Apellidos VARCHAR(50) NOT NULL,
    FechaNacimiento DATE NOT NULL,
    Telefono VARCHAR(20),
    Email VARCHAR(100),
    Direccion VARCHAR(200),
    MotivoConsulta VARCHAR(MAX), -- Importante para el Req 3
    FechaAlta DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1, -- 1 = Activo, 0 = Eliminado (Baja lógica Req 6)
    FOREIGN KEY (ID_Psicologo) REFERENCES Psicologos(ID_Psicologo)
);

-- ------------------------------------------------------------
-- 4. Tabla de Citas (Agenda)
-- Cubre: Requisitos 7, 8, 10, 11 (Gestión de Citas)
-- ------------------------------------------------------------
select * from Citas
CREATE TABLE Citas (
    ID_Cita INT PRIMARY KEY IDENTITY(1,1),
    ID_Paciente INT NOT NULL,
    ID_Psicologo INT NOT NULL,
    FechaHora DATETIME NOT NULL,
    Motivo VARCHAR(255), -- Agregado según tu PDF Req 10 (Modificar Cita)
    Estado VARCHAR(20) DEFAULT 'Programada', -- 'Programada', 'Cancelada', 'Finalizada'
    FOREIGN KEY (ID_Paciente) REFERENCES Pacientes(ID_Paciente),
    FOREIGN KEY (ID_Psicologo) REFERENCES Psicologos(ID_Psicologo)
);

-- ------------------------------------------------------------
-- 5. Tabla de Asistencias
-- Cubre: Requisito 12 (Validar Asistencia)
-- Se separa para cumplir con el diagrama Figura 61 de tu PDF
-- ------------------------------------------------------------
SELECT * FROM Asistencias;
CREATE TABLE Asistencias (
    ID_Asistencia INT PRIMARY KEY IDENTITY(1,1),
    ID_Cita INT UNIQUE NOT NULL, -- Una asistencia por cita
    EstadoAsistencia VARCHAR(20), -- 'Asistió', 'No asistió', 'Retraso'
    Nota VARCHAR(MAX), -- Campo "Nota" mencionado en tu diagrama
    FechaRegistro DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ID_Cita) REFERENCES Citas(ID_Cita)
);

-- ------------------------------------------------------------
-- 6. Tabla de Notas Clínicas
-- Cubre: Requisito 14 (Generar Nota)
-- ------------------------------------------------------------
select * from NotasClinicas
CREATE TABLE NotasClinicas (
    ID_Nota INT PRIMARY KEY IDENTITY(1,1),
    ID_Paciente INT NOT NULL,
    ID_Psicologo INT NOT NULL, -- Para saber quién escribió la nota
    FechaNota DATETIME DEFAULT GETDATE(),
    Observaciones VARCHAR(MAX),
    Evolucion VARCHAR(MAX),
    PlanTerapeutico VARCHAR(MAX),
    FOREIGN KEY (ID_Paciente) REFERENCES Pacientes(ID_Paciente),
    FOREIGN KEY (ID_Psicologo) REFERENCES Psicologos(ID_Psicologo)
);

-- ------------------------------------------------------------
-- 7. Tabla de Documentación Clínica (Expediente Digital)
-- Cubre: Requisito 15 (Cargar Documentación Clínica - Privado del paciente)
-- ------------------------------------------------------------

select * from DocumentosPacientes
CREATE TABLE DocumentosPacientes (
    ID_Documento INT PRIMARY KEY IDENTITY(1,1),
    ID_Paciente INT NOT NULL,
    Titulo VARCHAR(100) NOT NULL,
    TipoArchivo VARCHAR(50), -- pdf, jpg, png
    RutaArchivo VARCHAR(500), -- Donde se guarda en tu carpeta de servidor
    FechaSubida DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ID_Paciente) REFERENCES Pacientes(ID_Paciente)
);

-- ------------------------------------------------------------
-- 8. Tabla de Material de Apoyo (Biblioteca General)
-- Cubre: Requisitos 16, 17, 18 (Recursos para imprimir/enviar)
-- ------------------------------------------------------------

select * from MaterialApoyo
CREATE TABLE MaterialApoyo (
    ID_Material INT PRIMARY KEY IDENTITY(1,1),
    ID_Psicologo INT NOT NULL,
    Titulo VARCHAR(100) NOT NULL,
    TipoArchivo VARCHAR(50), -- pdf, docx
    RutaArchivo VARCHAR(500),
    FechaSubida DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ID_Psicologo) REFERENCES Psicologos(ID_Psicologo)
);

-- ------------------------------------------------------------
-- 9. Tabla de Auditoría (Seguridad)
-- Cubre: Diagrama de Bloques Pág. 49 y Requisitos de Seguridad
-- ------------------------------------------------------------
CREATE TABLE Auditoria (
    ID_Auditoria INT PRIMARY KEY IDENTITY(1,1),
    ID_Psicologo INT NULL, -- Puede ser NULL si falló el login
    Accion VARCHAR(50), -- Ej: 'LOGIN', 'ELIMINAR_PACIENTE', 'CREAR_NOTA'
    Detalle VARCHAR(255), -- Ej: 'Se dio de baja al paciente ID 5'
    FechaHora DATETIME DEFAULT GETDATE(),
    IP_Origen VARCHAR(50) -- Opcional, para mayor seguridad
);
GO