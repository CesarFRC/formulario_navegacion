<?php
require 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $username = $data['username'];
    $post = $data['post'];
    $mediaURL = $data['mediaURL'];
    $date = $data['date'];

    $matricula_usuario = substr($username, 0, 8);
    $formato = $mediaURL ? 'imagen' : NULL;
    $date = date('Y-m-d H:i:s', strtotime($date));

    try {
        $sql = "CALL InsertarPublicacionConTransaccion(?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $matricula_usuario, $date, $post, $formato);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            throw new Exception("Error en la ejecución: " . $stmt->error);
        }
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } finally {
        $conn->close();
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos válidos']);
}
?>
