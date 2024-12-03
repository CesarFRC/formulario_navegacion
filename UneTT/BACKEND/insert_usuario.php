<?php
// //invocamos el archivo php que creamos anterior mente en la carpeta backend 
require 'conexion.php';

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Función para extraer matrícula del correo electrónico
function obtenerMatricula($Correo) {
    return substr($Correo, 0, 8); // Extrae los primeros 8 caracteres
}

// Recibir datos del formulario
$Correo = $_POST['email'] ?? ''; //Aqui esta el correo
$UserName = $_POST['username'] ?? ''; // Aqui esta el nombre de usuario
$Matricula = obtenerMatricula($Correo);
$Contraseña = $_POST['password'] ?? ''; // Aquí puedes manejar la contraseña

// Validar datos recibidos: coreo,contraseña y nombre 
if (empty($Correo) || empty($UserName) || empty($Contraseña)) {
        // Si alguno de los campos está vacío, muestra un mensaje y dietiene scrip
    die("Por favor complete todos los campos.");
}

// Preparar la consulta SQL: La consulta inserta un nuevo registro en la tabla 'usuario'
$sql = "INSERT INTO usuario (Matricula, UserName, Correo, Contraseña, fecha, biografia)
        VALUES (?, ?, ?, ?, CURDATE(),'Nuevo Usuario de UneTT')";
        // La consulta SQL usa valores placeholders (?) para evitar inyecciones SQL
$stmt = $conn->prepare($sql);

// Verificar errores en la preparación de la consulta
if ($stmt === false) {
    die("Error en la preparación de la consulta: " . $conn->error);
}

// Vincular parámetros: Asocia los valores de las variables a los placeholders en la consulta SQL
// 'ssss' indica que los parámetros son de tipo string
$stmt->bind_param("ssss", $Matricula, $UserName, $Correo, $Contraseña);

// Ejecutar la consulta y manejar errores
if ($stmt->execute()) {
    // Si la consulta se ejecuta correctamente, redirige al usuario a la página de éxito (index.html)
    header("Location: ../index.html");
    exit();
} else {
        // Si ocurre un error al insertar el registro, muestra un mensaje de error
    echo "Error al insertar el registro: " . $stmt->error;
}
// Cerrar la conexión
$stmt->close();
$conn->close();
?>