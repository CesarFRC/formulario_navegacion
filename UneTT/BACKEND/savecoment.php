<?php
// Conexión a la base de datos
require 'conexion.php';

// Leer los datos JSON enviados desde JavaScript
$datacoment = json_decode(file_get_contents('php://input'), true);

// Verificar que los datos requeridos están presentes
if (isset($datacoment['comentario']) && isset($datacoment['comentUser']) && isset($datacoment['comentPost'])) {
    $comentario = $datacoment['comentario']; // Cambiar 'comentario' a 'comentario'
    $comentUser = $datacoment['comentUser']; // Cambiar 'comentUser' a 'comentUser'
    $comentPost = $datacoment['comentPost']; // Cambiar 'comentPost' a 'comentPost'
    $fecha_comentario = date("Y-m-d H:i:s"); // Usar fecha actual

    // Extraer los primeros 8 caracteres de comentUser para usarlo como matrícula
    $matricula = substr($comentUser, 0, 8);

    // Preparar la consulta SQL para insertar el comentario
    $sql = "INSERT INTO comentarios (comentario, comentUser, fecha_comentario, comentPost) VALUES (?, ?, ?, ?)";

    // Preparar la sentencia para evitar inyecciones SQL
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        // Vincular los parámetros a la consulta
        $stmt->bind_param("ssss", $comentario, $matricula, $fecha_comentario, $comentPost);

        // Ejecutar la consulta y verificar si fue exitosa
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Comentario guardado con éxito."]);
        } else {
            // Mostrar error si la ejecución de la consulta falla
            echo json_encode(["success" => false, "message" => "Error al guardar el comentario: " . $stmt->error]);
        }

        // Cerrar la sentencia
        $stmt->close();
    } else {
        // Mostrar error si la preparación de la consulta falla
        echo json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]);
    }
} else {
    // Respuesta en caso de datos incompletos
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}

// Cerrar la conexión
$conn->close();
?>
