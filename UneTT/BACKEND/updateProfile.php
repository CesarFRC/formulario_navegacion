<?php
require 'conexion.php';



// Comprobar si se han enviado los campos necesarios
    var_dump($_POST); // Muestra todos los datos enviados


    $email = $conn->real_escape_string($_POST['correoelectronico']);
    $newUsername = $conn->real_escape_string($_POST['username']);
    $newPassword = isset($_POST['password']) ? $conn->real_escape_string($_POST['password']) : '';
    $newBio = isset($_POST['bio']) ? $conn->real_escape_string($_POST['bio']) : '';

 // Imprimir los valores recibidos
echo "Correo electrónico recibido: " . $email . "<br>";
echo "Nombre de usuario recibido: " . $newUsername . "<br>";
echo "Nueva contraseña recibida: " . ($newPassword ? 'proporcionada' : 'no proporcionada') . "<br>";
echo "Biografía recibida: " . $newBio . "<br>";

    // Preparar la consulta SQL
    $sql = "UPDATE usuario SET UserName = ?, biografia = ?";

    if (!empty($newPassword)) {
        // Si se proporciona una nueva contraseña, agregarla a la consulta
        $sql .= ", Contraseña = ?";
    }

    // Completar la consulta
    $sql .= " WHERE Correo = ?";

    // Preparar la declaración
    $stmt = $conn->prepare($sql);

    // Verificar si se ha proporcionado una nueva contraseña
    if (!empty($newPassword)) {
        // Si hay nueva contraseña, vincular todos los parámetros
        $stmt->bind_param("ssss", $newUsername, $newBio, $newPassword, $email);
    } else {
        // Si no hay nueva contraseña, vincular solo el nombre de usuario y la biografía
        $stmt->bind_param("sss", $newUsername, $newBio, $email);
    }

    // Ejecutar la declaración
    if ($stmt->execute()) {
        echo "Perfil actualizado con éxito.";
    } else {
        echo "Error al actualizar el perfil: " . $stmt->error;
    }

    // Cerrar la conexión
    $stmt->close();
    $conn->close();

   
    echo "Error: Faltan campos necesarios.";

?>
