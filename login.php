<?php
// Incluir la conexión a la base de datos
require 'conexion.php';

// Verificar si el formulario ha sido enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos del formulario
    $Correo = $_POST['Correo'];
    $Matricula = $_POST['Matricula'];
    $Contraseña = $_POST['Contraseña'];

     // Preparar la consulta SQL para verificar si el usuario existe
     $sql = "SELECT * FROM usuario WHERE Correo = ? AND Matricula = ?";
     $stmt = $conn->prepare($sql); //GUARDAMOS LA CONSULTA EN ESTA VARIABLE
     $stmt->bind_param("ss", $Correo, $Matricula); //IGUAL AQUI PERO EN DOS CHAR
     $stmt->execute();
     $result = $stmt->get_result();

      // Verificar si el usuario fue encontrado
    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc(); // Obtener los datos del usuario
        
    // Comparar la contraseña sin hashear
    if ($Contraseña === $usuario['Contraseña']) {
        // Contraseña correcta, el usuario puede iniciar sesión
        echo "Inicio de sesión exitoso. ¡Bienvenido " . $usuario['UserName'] . "!";
        // Aquí puedes iniciar la sesión usando $_SESSION y redirigir al usuario a otra página
    } else {
        // Contraseña incorrecta
        echo "Error: Contraseña incorrecta.";
    }
} else {
    // Usuario no encontrado
    echo "Error: Usuario no encontrado con ese correo y matrícula.";
}
    
    // Cerrar la conexión
    $stmt->close();
    $conn->close();
}
?>