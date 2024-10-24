<?php
// Datos de conexión
require 'conexion.php';

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Función para extraer matrícula del correo electrónico
function obtenerMatricula($Correo) {
    return substr($Correo, 0, 8); // Extrae los primeros 8 caracteres
}

// Recibir datos del formulario
$Correo = $_POST['email'] ?? '';
$UserName = $_POST['username'] ?? ''; // Cambia esto si se agrega al formulario
$Matricula = obtenerMatricula($Correo);
$Contraseña = $_POST['password'] ?? ''; // Aquí puedes manejar la contraseña

// Validar datos recibidos
if (empty($Correo) || empty($UserName) || empty($Contraseña)) {
    die("Por favor complete todos los campos.");
}

// Preparar la consulta SQL
$sql = "INSERT INTO usuario (Matricula, UserName, Correo, Contraseña, fecha, foto_perfil, biografia)
        VALUES (?, ?, ?, ?, CURDATE(), NULL, 'Nuevo Usuario de UneTT')";
$stmt = $conn->prepare($sql);

// Verificar errores en la preparación de la consulta
if ($stmt === false) {
    die("Error en la preparación de la consulta: " . $conn->error);
}

// Vincular parámetros
$stmt->bind_param("ssss", $Matricula, $UserName, $Correo, $Contraseña);

// Ejecutar la consulta y manejar errores
if ($stmt->execute()) {
    // Redirigir a la página de éxito
    header("Location: ../index.html");
    exit();
} else {
    echo "Error al insertar el registro: " . $stmt->error;
}

// Cerrar la conexión
$stmt->close();
$conn->close();
?>