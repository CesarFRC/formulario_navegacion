<?php
//invocamos el archivo php que creamos anterior mente en la carpeta backend 
require 'conexion.php';

// Leer el cuerpo de la solicitud del fetch de java scrip del archivo post 
$data = json_decode(file_get_contents('php://input'), true);

    // Validar id_publicacion o idFB
    //NOTA: no se utiliza id_publicacion para validar solo idFB
if (isset($data['id_publicacion']) || isset($data['idFB'])) {
    
    //Obtenemos el identificador de la publicacion y evitamos que se pueda inyeciones 
    $idFB = isset($data['idFB']) ? $conn->real_escape_string($data['idFB']) : null;
        //Usamos una sentencia sql para eliminar en mysql la publicacion
        $sql = "DELETE FROM publicaciones WHERE idFB = '$idFB'";
    

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Publicación eliminada correctamente']);
    } else {
        //Error generado en la base de datos al momento de la sentencia o operacion
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    //Error si no encuentra la id de la publicacion
} else {
    echo json_encode(['success' => false, 'message' => 'ID de publicación no proporcionado']);
}

//ceramos la conexion 
$conn->close();
?>

