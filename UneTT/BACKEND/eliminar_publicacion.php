<?php
require 'conexion.php';

// Leer el cuerpo de la solicitud
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id_publicacion']) || isset($data['idFB'])) {
    // Validar id_publicacion o idFB
    
    $idFB = isset($data['idFB']) ? $conn->real_escape_string($data['idFB']) : null;

        $sql = "DELETE FROM publicaciones WHERE idFB = '$idFB'";
    

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Publicación eliminada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID de publicación no proporcionado']);
}

$conn->close();
?>

