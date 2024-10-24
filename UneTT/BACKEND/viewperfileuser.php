<?php
// Datos de conexión
require 'conexion.php';

//aqui resive el email para buscar el nombre de usuario dependiendo del correo proporcionado
if (isset($_POST['email'])) {
    $email = $conn->real_escape_string($_POST['email']); // Escapar el email para prevenir inyecciones SQL
    
    // Realizar la consulta
    $sql = "SELECT UserName,biografia,fecha FROM usuario WHERE Correo = '$email'";
    $result = $conn->query($sql);

    if ($result) {
        if ($row = $result->fetch_assoc()) {
            echo "" . $row['UserName'] . "\n"; // Imprimir UserName
            echo "" . $row['biografia'] . "\n"; // Imprimir biografia
            echo "" . $row['fecha']; // Imprimir fecha
        } else {
            echo "Usuario no encontrado."; // Mensaje si no se encuentra el usuario
        }
    } else {
        echo "Error en la consulta: " . $conn->error; // Mensaje de error en la consulta
    }
}else {
    echo "Email no proporcionado."; // Mensaje si no se proporciona el email
}





// Cerrar la conexión
$conn->close();
?>
