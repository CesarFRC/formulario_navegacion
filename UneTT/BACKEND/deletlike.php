<?php
header('Content-Type: application/json');

require 'conexion.php';

// Leer los datos enviados en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$postId = $data['postId'];
$userId = $data['userId'];

// Eliminar el "like" del usuario para el post dado
$query = "DELETE FROM likes WHERE postId = ? AND userId = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $postId, $userId);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Error al eliminar el like"]);
}

$conn->close();
?>
