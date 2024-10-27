<?php
// Datos de conexión
require 'conexion.php';

// Iniciar la sesión
session_start();

// Obtener el UserName actual desde la sesión
$currentUsername = $_SESSION['username'] ?? ''; // Suponiendo que guardas el username en la sesión

// Verificar que se envían los datos
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtener los datos del formulario
    $newUsername = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $biografia = $_POST['bio'] ?? '';

    // Comprobar que no estén vacíos
    if (!empty($newUsername) && !empty($password) && !empty($biografia)) {
        // Preparar la consulta de actualización
        $sqlUpdate = "UPDATE usuario SET UserName = ?, Contraseña = ?, biografia = ? WHERE UserName = ?";
        
        // Preparar la declaración
        $stmtUpdate = $conn->prepare($sqlUpdate);
        
        // Verificar si la preparación fue exitosa
        if ($stmtUpdate) {
            // Enlazar parámetros
            $stmtUpdate->bind_param("ssss", $newUsername, $password, $biografia, $currentUsername);

            // Ejecutar la consulta
            if ($stmtUpdate->execute()) {
                // Si el UserName se ha actualizado, también actualizar en la sesión
                if ($stmtUpdate->affected_rows > 0) {
                    $_SESSION['username'] = $newUsername; // Actualiza el username en la sesión
                }
                // Redireccionar a la página de perfil después de la actualización
                header("Location: ../HTML/ver_perfil.html"); // Cambia 'perfil.php' a la URL deseada
                exit(); // Asegúrate de llamar a exit después de redirigir
            } else {
                echo "Error al actualizar el perfil: " . $stmtUpdate->error;
            }
        } else {
            echo "Error en la preparación de la consulta: " . $conn->error;
        }
    } else {
        echo "Por favor, completa todos los campos requeridos.";
    }
} else {
    echo "Método de solicitud no válido.";
}

// Cerrar la conexión
$conn->close();
?>
