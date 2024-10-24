<?php 
// Incluir la conexión a la base de datos
require 'conexion.php';

// Verificar si el formulario ha sido enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos del formulario
    $Correo = $_POST['Correo'];
    $Contraseña = $_POST['Contraseña'];

    // Preparar la consulta SQL para verificar si el usuario existe
    $sql = "SELECT * FROM usuario WHERE Correo = ?";
    $stmt = $conn->prepare($sql); // Guardamos la consulta en esta variable
    $stmt->bind_param("s", $Correo); // Un solo parámetro de tipo string
    $stmt->execute();
    $result = $stmt->get_result();

    // Verificar si el usuario fue encontrado
    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc(); // Obtener los datos del usuario
        
        // Comparar la contraseña
        if ($Contraseña === $usuario['Contraseña']) {
            // MANDAR AL USUARIO A LA PAGINA INICIAL
            header("Location: ../HTML/pInicial.html");
            exit();
            // Aquí puedes iniciar la sesión usando $_SESSION y redirigir al usuario a otra página
        } else {
            // Contraseña incorrecta
            echo "Error: Contraseña incorrecta.";
        }
    } else {
        // Usuario no encontrado
        echo "Error: Usuario no encontrado con ese correo.";
    }
    
    // Cerrar la conexión
    $stmt->close();
    $conn->close();
}
?>
