<?php
// Datos de conexión
require 'conexion.php';
// Función para extraer matrícula del correo electrónico
function obtenerMatricula($Correo) {
    return substr($Correo, 0, 8); // Extrae los primeros 7 caracteres
}
// Recibir datos del formulario
$Correo = $_POST['Correo'];
$UserName = $_POST['UserName']; // Cambia esto si se agrega al formulario
$Matricula = obtenerMatricula($Correo);
$Contraseña = $_POST['Contraseña']; // Aquí puedes manejar la contraseña

// Preparar la consulta SQL
$sql = "INSERT INTO usuario (Matricula, UserName, Correo, Contraseña,fecha, foto_perfil, biografia)
        VALUES (?, ?, ?, ? ,NULL, NULL, NULL)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $Matricula, $UserName, $Correo,$Contraseña);

if ($stmt->execute()) {
    echo "Registro insertado con éxito.";
} else {
    echo "Error al insertar el registro: " . $stmt->error;
}

// Cerrar la conexión
$stmt->close();
$conn->close();
?>