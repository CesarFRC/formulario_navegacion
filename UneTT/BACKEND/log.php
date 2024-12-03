<?php
// Conexión a la base de datos
include 'conexion.php';

// Obtener variables enviadas por JavaScript
$correo = $_POST['email']; // Captura el correo electrónico del usuario
$password = $_POST['password']; // Captura la contraseña del usuario

// Consulta a la base de datos: Verifica si existe un usuario con el correo y contraseña proporcionados
$sql = "SELECT * FROM usuario WHERE Correo = '$correo' AND Contraseña = '$password'";
// Ejecuta la consulta SQL
$result = $conn->query($sql);

// Verificar el resultado de la consulta
if ($result) {
        // Si la consulta se ejecutó correctamente, verifica si hay coincidencias
    if ($row = $result->fetch_assoc()) {// fetch_assoc() obtiene una fila asociativa del resultado
        echo "Usuario encontrado";// Muestra este mensaje si se encuentra un usuario con las credenciales proporcionadas
        
    } else {
        echo "Usuario no encontrado."; // Mensaje si no se encuentra el usuario
    }
} else {
    echo "Error en la consulta:" . $conn->error; // Mensaje de error en la consulta
}

// Cerrar la conexión
$conn->close();
?>