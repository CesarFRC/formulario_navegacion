<?php
// Conexión a la base de datos
require 'conexion.php';

// Leer los datos JSON enviados desde JavaScript
$data = json_decode(file_get_contents('php://input'), true);
var_dump($data); // Verificar los datos recibidos

// Verificar que los datos requeridos están presentes
if (isset($data['comentario']) && isset($data['comentUser']) && isset($data['comentPost'])) {
    $comentario = $data['comentario'];
    $comentUser = $data['comentUser'];
    $comentPost = (int)$data['comentPost']; // Asegurarse de que sea un número entero
    $fecha_comentario = date("Y-m-d H:i:s"); // Usar fecha actual

    // Extraer los primeros 8 caracteres de comentUser para usarlo como matrícula
    $matricula = substr($comentUser, 0, 8);

    // Preparar la consulta SQL para insertar el comentario
    $sql = "INSERT INTO comentarios (comentario, comentUser, fecha_comentario, comentPost) VALUES (?, ?, ?, ?)";

    // Preparar la sentencia para evitar inyecciones SQL
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("sssi", $comentario, $matricula, $fecha_comentario, $comentPost);

        // Ejecutar la consulta y verificar si fue exitosa
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Comentario guardado con éxito."]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al guardar el comentario."]);
        }

        // Cerrar la sentencia
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Error al preparar la consulta."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}

// Cerrar la conexión
$conn->close();
?>
