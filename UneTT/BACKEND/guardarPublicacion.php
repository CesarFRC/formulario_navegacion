<?php
//invocamos el archivo php que creamos anterior mente en la carpeta backend 
require 'conexion.php';

//Traemos los datos que nos pasa el fecht de java scrip del archivo post
$data = json_decode(file_get_contents('php://input'), true);

// Verifica si se recibieron datos en el array $data (generalmente de una solicitud POST)
if ($data) {
        // Asigna los valores de los campos recibidos en el array $data a variables locales
    $username = $data['username']; //Correo electronico
    $post = $data['post'];  //Contenido de la publicacion 
    $postId = $data['postId']; //Identificador de la publicacion 
    $mediaURL = $data['mediaURL']; // url de la imagen o video 
    $date = $data['date']; //fecha y hora de post
    $matricula_usuario = substr($username, 0, 8); // funcion la cual nos ayuda a tener la matricula por medio del coreo. Extrae los primeros 8 caracteres
    // Determina el formato del medio (si hay una URL de medio, se establece como 'imagen')
    $formato = $mediaURL ? 'imagen' : NULL;
    // Convierte la fecha recibida a un formato adecuado para la base de datos
    $date = date('Y-m-d H:i:s', strtotime($date));

    try {
                // Prepara la consulta SQL para insertar una publicación usando una transacción almacenada
        $sql = "CALL InsertarPublicacionConTransaccion(?, ?, ?, ?,? )";
        $stmt = $conn->prepare($sql); // Prepara la consulta SQL
                // Enlaza los parámetros de la consulta a las variables locales para evitar inyecciones SQL
        $stmt->bind_param("sssss", $matricula_usuario, $date, $post, $formato,$postId);

        // Ejecuta la consulta SQL
        if ($stmt->execute()) {
            // Si la ejecución es exitosa, responde con un mensaje de éxito en formato JSON
            echo json_encode(['success' => true]);
        } else {
             // Si hay un error al ejecutar la consulta, lanza una excepció
            throw new Exception("Error en la ejecución: " . $stmt->error);
        }
            // Cierra el statement después de ejecutarlo
        $stmt->close();
    } catch (Exception $e) {
        // Si ocurre un error, responde con un mensaje de error en formato JSON
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } finally {
        // Asegura que la conexión se cierre independientemente de que haya éxito o error
        $conn->close();
    }
} else {
        // Si no se recibieron datos válidos, responde con un mensaje de error
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos válidos']);
}
?>
