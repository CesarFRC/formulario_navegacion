<?php
// Datos de conexión
require 'conexion.php';

if (isset($_POST['email'])) {
    $email = $conn->real_escape_string($_POST['email']); // Escapar el email para prevenir inyecciones SQL
    
    // Realizar la consulta
    $sql = "SELECT UserName FROM usuario WHERE Correo = '$email'";
    $result = $conn->query($sql);

    if ($result) {
        if ($row = $result->fetch_assoc()) {
            echo $row['UserName']; // Devolver directamente el UserName
        } else {
            echo "Usuario no encontrado."; // Mensaje si no se encuentra el usuario
        }
    } else {
        echo "Error en la consulta: " . $conn->error; // Mensaje de error en la consulta
    }
} else {
    echo "Email no proporcionado."; // Mensaje si no se proporciona el email
}

// Cerrar la conexión
$conn->close();
?>
