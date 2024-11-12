<?php
// Conexión a la base de datos
require 'conexion.php';

// Obtener los datos JSON enviados por el frontend
$data = json_decode(file_get_contents('php://input'), true);

// Agregar depuración para ver el contenido de los datos recibidos
error_log("Datos recibidos:");
error_log(print_r($data, true)); // Esto se registrará en el log de errores de PHP

// Verificar si los datos se recibieron correctamente
if ($data) {
    // Obtener las variables
    $username = $data['username'];  // Correo electrónico que recibes
    $post = $data['post'];          // El texto de la publicación
    $mediaURL = $data['mediaURL'];  // La URL de la imagen (puede ser nula)
    $date = $data['date'];          // Fecha de creación (timestamp)

    // Extraer los primeros 8 caracteres del correo para usar como matrícula
    $matricula_usuario = substr($username, 0, 8);

    // Verificar si hay un archivo multimedia y asignar 'imagen' o NULL
    $formato = ($mediaURL) ?  : NULL;

    // Asegurarse de que la fecha está en un formato adecuado para MySQL
    $date = date('Y-m-d H:i:s', strtotime($date));

    // Mostrar los valores antes de realizar la inserción
    error_log("Valores procesados:");
    error_log("Matrícula: $matricula_usuario");
    error_log("Fecha: $date");
    error_log("Texto: $post");
    error_log("Formato: $formato");
    error_log("URL de media: $mediaURL");

    // Consulta SQL para insertar los datos utilizando una consulta preparada
    $sql = "INSERT INTO publicaciones (matricula_usuario, fecha_creacion, texto, formato) 
            VALUES (?, ?, ?, ?)";

    if ($stmt = $conn->prepare($sql)) {
        // Vincular los parámetros con la consulta preparada
        $stmt->bind_param("ssss", $matricula_usuario, $date, $post, $formato);

        // Ejecutar la consulta
        if ($stmt->execute()) {
            // Respuesta de éxito
            echo json_encode(['success' => true]);
        } else {
            // Respuesta de error si la consulta falla
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }

        // Cerrar el statement
        $stmt->close();
    } else {
        // Error al preparar la consulta
        echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta SQL']);
    }

    // Cerrar la conexión
    $conn->close();
} else {
    // Respuesta de error si no se recibe JSON válido
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos válidos']);
}
?>
