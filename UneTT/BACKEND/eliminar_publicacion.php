<?php
// Conexión a la base de datos (ajusta los parámetros según tu configuración)
require 'conexion.php';
// Obtener el id_publicacion y la matrícula del usuario desde el parámetro POST
$id_publicacion = isset($_POST['postId']) ? $_POST['postId'] : null;
$matricula_usuario = isset($_POST['matricula_usuario']) ? $_POST['matricula_usuario'] : null;

if (empty($id_publicacion) || empty($matricula_usuario)) {
    echo "Faltan datos necesarios.";
    exit();
}

// Preparar la consulta para verificar si el usuario es el autor de la publicación
$sql = "SELECT * FROM publicaciones WHERE id_publicacion = ? AND matricula_usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $id_publicacion, $matricula_usuario);
$stmt->execute();
$result = $stmt->get_result();

// Si la publicación existe y el usuario es el autor, proceder con la eliminación
if ($result->num_rows > 0) {
    // Realizar la eliminación
    $sql_delete = "DELETE FROM publicaciones WHERE id_publicacion = ?";
    $stmt_delete = $conn->prepare($sql_delete);
    $stmt_delete->bind_param("i", $id_publicacion);

    if ($stmt_delete->execute()) {
        echo "Publicación eliminada correctamente.";
    } else {
        echo "Error al eliminar la publicación: " . $stmt_delete->error;
    }

    $stmt_delete->close();
} else {
    echo "No se encontró la publicación o no tienes permisos para eliminarla.";
}

$stmt->close();
$conn->close();
?>
