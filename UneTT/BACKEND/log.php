<?php
// Incluir el archivo de conexión
include 'conexion.php';

// Obtener variables enviadas por JavaScript

$correo = $_POST['Correo'];
$password = $_POST['Contraseña'];

// Consulta a la base de datos
$sql = "SELECT * FROM usuario WHERE Correo = '$correo' AND Contraseña = '$password'";
$result = $conn->query($sql);

if ($result) {
    if ($row = $result->fetch_assoc()) {
        echo "Usuario encontrado";
        
    } else {
        echo "Usuario no encontrado."; // Mensaje si no se encuentra el usuario
    }
} else {
    echo "Error en la consulta: " . $conn->error; // Mensaje de error en la consulta
}

// Cerrar la conexión
$conn->close();
?>