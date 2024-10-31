<?php
// Datos de conexión
$hostname = "bvvmzyyh4ulq7sn4jdqw-mysql.services.clever-cloud.com";
$username = "urbanwgc48m1xqha"; // Nombre de usuario de MySQL
$password = "gss4FQPVz9aOF4XRs6aV"; // Deja la contraseña vacía si usas XAMPP por defecto
$dbname = "bvvmzyyh4ulq7sn4jdqw"; // Cambia por el nombre de tu base de datos

// Crear la conexión
$conn = new mysqli($hostname, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>
