<?php
// conexión a la base de datos
require 'conexion.php';

// Escapar los datos recibidos del formulario para prevenir inyecciones SQL
    $email = $conn->real_escape_string($_POST['correoelectronico']); // Correo del usuario
    $newUsername = $conn->real_escape_string($_POST['username']); // Nuevo nombre de usuario
    $newPassword = isset($_POST['password']) ? $conn->real_escape_string($_POST['password']) : ''; // Nueva contraseña (opcional)
    $newBio = isset($_POST['bio']) ? $conn->real_escape_string($_POST['bio']) : '';   // Nueva biografía (opcional)


    // Preparar la consulta SQL
    $sql = "UPDATE usuario SET UserName = ?, biografia = ?";

    if (!empty($newPassword)) {
        // Si se proporciona una nueva contraseña, agregarla a la consulta
        $sql .= ", Contraseña = ?";
    }

// Agregar la cláusula `WHERE` para asegurar que se actualice el registro correcto
    $sql .= " WHERE Correo = ?";

    // Preparar la declaración sql 
    $stmt = $conn->prepare($sql);

    // Verificar si se ha proporcionado una nueva contraseña
    if (!empty($newPassword)) {
    // Si hay nueva contraseña, vincular todos los parámetros (nombre de usuario, biografía, contraseña, correo)
        $stmt->bind_param("ssss", $newUsername, $newBio, $newPassword, $email);
    } else {
    // Si no hay nueva contraseña, vincular solo nombre de usuario, biografía y correo
        $stmt->bind_param("sss", $newUsername, $newBio, $email);
    }

    // Ejecutar la declaración
    if ($stmt->execute()) {
            // Si la ejecución es exitosa
        echo "Perfil actualizado con éxito.";
    } else {
            // Si ocurre un error
        echo "Error al actualizar el perfil: " . $stmt->error;
    }

    // Cerrar la conexión
    $stmt->close();
    $conn->close();
?>
