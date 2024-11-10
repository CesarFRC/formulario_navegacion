<?php
// Configurar el encabezado de respuesta para JSON
header('Content-Type: application/json');
require 'conexion.php';

// Función para extraer los primeros 8 caracteres del correo
function extractMatricula($comentUser) {
    return substr($comentUser, 0, 8);  // Extrae los primeros 8 caracteres
}

// Obtener los datos del cuerpo de la solicitud (los datos JSON enviados por el cliente)
$data = json_decode(file_get_contents('php://input'), true);

// Mostrar los datos que se están recibiendo (solo para depuración)
echo json_encode(['received_data' => $data]);  // Esto imprimirá los datos recibidos como JSON

// Comprobar si los datos están correctamente recibidos
if (!isset($data['postId']) || !isset($data['comentUser']) || !isset($data['date'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit();
}

$postId = $data['postId'];
$comentUser = $data['comentUser'];
$date = $data['date'];

// Extraer la matrícula a partir del correo electrónico
$matricula = extractMatricula($comentUser);

// Convertir la fecha al formato adecuado para MySQL
$dateTime = new DateTime($date);  // Convierte la fecha en un objeto DateTime
$dateFormatted = $dateTime->format('Y-m-d H:i:s');  // Formato adecuado para MySQL

// Verificar si la conexión a la base de datos fue exitosa
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $conn->connect_error]);
    exit();
}

// Preparar la consulta para insertar los datos del "like" en la base de datos
$sql = "INSERT INTO megusta (reacionUser, fecha_reacion, reacionPost) VALUES (?, ?, ?)";

// Preparar la sentencia
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
