<?php
// Configurar el encabezado de respuesta para JSON
header('Content-Type: application/json');
// Conexion a la base de datos 
require 'conexion.php';

// Función para extraer los primeros 8 caracteres de un correo electrónico o cadena
function extractMatricula($comentUser) {
    return substr($comentUser, 0, 8);
}

// Leer los datos enviados en el cuerpo de la solicitud (en formato JSON)
// convierte un aray relacionado al php 
$data = json_decode(file_get_contents('php://input'), true);


// Verificar si los datos necesarios están presentes en la solicitud
if (!isset($data['postId']) || !isset($data['comentUser']) || !isset($data['date'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit();
}
// Asignar los datos recibidos a variables individuales para su procesamiento
$postId = $data['postId'];   // Identificador de la publicación a la que se da "me gusta"
$comentUser = $data['comentUser']; // Usuario que da "me gusta"
$date = $data['date']; // Fecha y hora de la reacción
// Extraer la matrícula del usuario a partir de su correo usando la función definida anteriormente
$matricula = extractMatricula($comentUser);

// Convertir la fecha al formato adecuado para MySQL
$dateTime = new DateTime($date);  // Convierte la fecha en un objeto DateTime
$dateFormatted = $dateTime->format('Y-m-d H:i:s');  // Formato adecuado para MySQL

// Verificar si la conexión a la base de datos fue exitosa
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $conn->connect_error]);
    exit();
}

// Preparar la consulta para insertar los datos del "megusta" en la base de datos
$sql = "INSERT INTO megusta (reacionUser, fecha_reacion, reacionPost) VALUES (?, ?, ?)";

// Preparar la consulta utilizando una sentencia preparada
$stmt = $conn->prepare($sql);

if ($stmt === false) {
    echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta']);
    exit();
}

// Vincular los parámetros a la consulta
$stmt->bind_param('sss', $matricula, $dateFormatted, $postId);

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Like guardado correctamente']);
} else {
    // Obtener el error de MySQL
    $error = $stmt->error;
    echo json_encode(['success' => false, 'message' => 'Error al guardar el like', 'error' => $error]);
}

// Cerrar la conexión
$stmt->close();
$conn->close();
?>
