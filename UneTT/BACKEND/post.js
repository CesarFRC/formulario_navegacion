// Importar las funciones necesarias desde los SDK de Firebase
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// Configuración de Firebase para la aplicación web
// Contiene claves y datos de conexión necesarios para integrar Firebase con el proyecto
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U", // Clave para autenticación de Firebase
    authDomain: "unett-4074c.firebaseapp.com", // Dominio autorizado para el proyecto
    databaseURL: "https://unett-4074c-default-rtdb.firebaseio.com",  // URL de la base de datos en tiempo real (opcional)
    projectId: "unett-4074c",  // ID único del proyecto en Firebase
    storageBucket: "unett-4074c.appspot.com", // URL para almacenamiento de archivos
    messagingSenderId: "401481887315", // ID para mensajería en la nube (Firebase Cloud Messaging)
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6", // ID de la aplicación Firebase
    measurementId: "G-M3JLBLZX7R" // ID para medición y análisis (opcional)
};


// Inicializar Firebase con la configuración especificada
const app = initializeApp(firebaseConfig);
// Obtener la instancia de autenticación de Firebase
const auth = getAuth();
//Iniciar servicio de base de datos en tiempo real 
const db = getFirestore(app);
//Iniciar servicio para guardar el contenido como imagenes, videos etc..
const storage = getStorage(app);



//obtiene los datos del usuario desde la base de datos de mysql
auth.onAuthStateChanged((user) => {
    if (user) {
        const email = user.email;
        let matricula = email.substring(0, 8); // Extract matricula from email

        //Iniciamos el fetch para mandar los datos al php viewperfileuser 
        fetch('../BACKEND/viewperfileuser.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Tipo de contenido para la solicitud 
            },
            body: new URLSearchParams({
                'email': email //Variable email donde extraemos para los datos de matricula 
            })
        })
        // Primera promesa: Manejo de la respuesta del servidor
            .then(response => response.text()) // Convierte la respuesta del servidor a texto plano
            .then(data => {
                // Verifica si hay errores en los datos recibidos
                if (data.startsWith("Usuario no encontrado") || data.startsWith("Error") || data.startsWith("Email no proporcionado")) {
                    alert(data); // Muestra un mensaje de error si hay problemas con los datos
                } else {
                    const resultados = data.split("\n"); // Divide los datos recibidos por líneas
                    let nameu = resultados[0]; // Toma la primera línea como el nombre del usuario
                    
                    // Guarda el nombre del usuario en localStorage
                    localStorage.setItem("userName", nameu);
                  
                    
                }
            })
            .catch(error => {
                alert('Error:' + error); // Maneja errores que puedan ocurrir durante la petición
            });
    }
});
// Recupera el nombre de usuario almacenado en localStorage
const un = localStorage.getItem("userName");



// Configuración del botón de publicar
const submit = document.getElementById('submit'); // Obtiene el botón de submit
submit.addEventListener("click", async function (event) {  // Agrega un evento al botón
    event.preventDefault(); // Evita el comportamiento por defecto del formulario

    const user = auth.currentUser; // Obtiene el usuario autenticado en Firebase
    if (!user) {
        alert("Debes iniciar sesión para publicar."); // Avisa si no hay sesión activa
        return;
    }
     // Obtiene el contenido de la publicación
    let content = document.getElementById('postcontent').value;
    const fileInput = document.getElementById('mediaUpload'); // Obtiene el input de archivo
    const file = fileInput.files[0]; // Selecciona el archivo cargado (si existe)

    // Verifica que no esté vacío el contenido ni falten archivos
    if (content === '' && !file) {
        alert("No puedes publicar contenido vacío.");
        return;
    }

    let mediaURL = null; // URL del archivo cargado (si aplica)
    if (file) {
        // Configura la referencia en Firebase Storage para subir el archivo
        const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file); // Sube el archivo a Firebase
            mediaURL = await getDownloadURL(snapshot.ref);  // Obtiene la URL pública del archivo
        } catch (error) {
            console.error("Error al subir el archivo:", error); // Muestra el error en consola
            alert("Error al subir el archivo.");
            return;
        }
    }

  // Publica los datos en Firebase Firestore
    try {
        const docRef = await addDoc(collection(db, 'post'), {
            name : un, // Nombre del usuario
            username: user.email, // Email del usuario autenticado
            date: serverTimestamp(), // Fecha actual del servidor
            likes: 0,  // Número inicial de "me gusta"
            likedBy: [], // Lista inicial de usuarios que dieron "me gusta"
            post: content, // Contenido de la publicación
            mediaURL: mediaURL  // URL del archivo subido, si existe
        });

         // Prepara los datos para enviar al backend en PHP
        const data = {
            username: user.email,  // Email del usuario
            post: content, // Contenido de la publicación
            mediaURL: mediaURL, // URL del archivo subido
            date: new Date().toISOString(), // Fecha en formato ISO
            postId: docRef.id  // ID del documento creado en Firestore
        };

        // Envia la publicación al backend (PHP) para almacenarla en MySQL
        const response = await fetch('../BACKEND/guardarPublicacion.php', {
            method: 'POST', // Método POST para enviar datos
            headers: {
                'Content-Type': 'application/json' // Tipo de contenido JSON
            },
            body: JSON.stringify(data) // Convierte los datos a JSON para enviar
        });

        const result = await response.json(); // Procesa la respuesta como JSON
        if (result.success) {
            document.getElementById('postcontent').value = ''; // Limpiar el campo de texto
            fileInput.value = ''; // Limpiar el campo de archivos
        } else {
            alert('Error al guardar la publicación en MySQL'); // Notifica errores en MySQL
        }

    } catch (error) {
        // Maneja errores en la publicación o al enviar datos
        console.error('Error al publicar o enviar los datos:', error);
        alert('Error al publicar o enviar los datos.' + error);
    }
});

// Escuchar los cambios en la colección 'post' de Firestore y actualizar la interfaz en tiempo real
onSnapshot(query(collection(db, 'post') // Consulta a la colección 'post'
, orderBy('date', 'desc')) // Ordena las publicaciones por fecha en orden descendente (más recientes primero) 
, (snapshot) => { // Callback que se ejecuta cuando hay cambios en los datos
    const postList = document.getElementById('postList'); // Obtiene el contenedor donde se mostrarán las publicaciones
    postList.innerHTML = ''; // Limpia el contenido actual de la lista de publicaciones

    // Itera sobre cada documento en el snapshot
    snapshot.forEach((postSnapshot) => {
        const postData = postSnapshot.data();  // Obtiene los datos de la publicación
        const postId = postSnapshot.id;  // Obtiene el ID único de la publicación

        // Crea un elemento 'div' para representar una publicación
        const postElement = document.createElement('div');
        postElement.classList.add('post'); // Añade una clase CSS al div

        const user = auth.currentUser; // Obtiene el usuario actualmente autenticado
        const isAuthor = postData.username === user?.email; // Verifica si el usuario autenticado es el autor de la publicación

         // Define el contenido HTML de la publicación
        postElement.innerHTML = `
            <article class="media box">
                <div class="media-content">
                    <div class="content">
                        <div id="otheruser-${postId}">
                        <p ><strong>Usuario:</strong> ${postData.name || 'Anónimo'}</p>
                        <p ><strong>Correo:</strong> ${postData.username || 'Anónimo'}</p>
                        </div>
                        <p><strong>Fecha:</strong> ${postData.date ? postData.date.toDate().toLocaleString() : 'Sin fecha'}</p>
                        <p>${postData.post}</p>
                        ${postData.mediaURL ? (fileIsVideo(postData.mediaURL) ?
                `<video controls class="post-media" width="400">
                            <source src="${postData.mediaURL}" type="video/mp4">
                            Tu navegador no soporta la reproducción de video.
                        </video>` :
                `<img src="${postData.mediaURL}" alt="Publicación multimedia" class="post-media">`) : ''}
                        <p><strong>Stars:</strong> <span id="likes-${postId}">${postData.likes || 0}</span></p>
                        <button id="likeBtn-${postId}">
                            <img src="../imgs/staricon.png" style="cursor: pointer; width: 30px; height: 30px;">
                        </button>
                        ${isAuthor ? `<button class="delete-btn" data-id="${postId}" style="background-color: red;">Eliminar</button>` : ''}
                        <nav class="level is-mobile">
                            <div class="level-left">
                                <div id="comments-${postId}" class="overflow-auto"></div>
                            </div>
                        </nav>
                        <input type="text" id="commentInput-${postId}" placeholder="Escribe un comentario..." style="width: 100%; margin-bottom: 10px;">
                        <button id="commentBtn-${postId}" style="cursor: pointer;">Comentar</button>
                    </div>
                </div>
            </article>
        `;
        
        // Agrega la publicación al contenedor principal
        postList.appendChild(postElement);
        
        // Navegación al perfil de otro usuario
        const btotrouser = document.getElementById(`otheruser-${postId}`);
        btotrouser.addEventListener('click', () => {
            // Almacena el correo del usuario en localStorage para abrir su perfil
            localStorage.setItem("perfilemail", postData.username);
            // Redirige a la página de perfil de otro usuario
            window.location.href = "../HTML/verotroperfil.html";
        });

        // Eliminar publicación
        // Verificar si el usuario autenticado es el autor de la publicación para mostrar la opción de eliminar
        if (isAuthor) {
            const deleteButton = postElement.querySelector(`.delete-btn[data-id="${postId}"]`);
            // Escucha el evento de clic en el botón de eliminar
            deleteButton.addEventListener('click', async () => {
                const confirmDelete = confirm("¿Estás seguro de que deseas eliminar la publicación?");
                if (confirmDelete) { // Si el usuario confirma la eliminación
                    try {
                    // Eliminar la publicación de Firestore
                        await deleteDoc(doc(db, 'post', postId));

                         // Enviar solicitud para eliminar la publicación en MySQL
                        const data = { idFB: postId };  // Datos a enviar: ID de la publicación en Firebase
                        const response = await fetch('../BACKEND/eliminar_publicacion.php', {
                            method: 'DELETE', // Método DELETE para la solicitud HTTP
                            headers: { 'Content-Type': 'application/json' },  // Especifica que los datos enviados son JSON
                            body: JSON.stringify(data) // Convierte los datos a formato JSON
                        });

                        const result = await response.json();  // Convierte la respuesta en JSON
                        if (result.success) {
                        } else {
                            alert(result.message);  // Muestra un mensaje de error proporcionado por el servidor
                        }
                    } catch (error) {
                        console.error('Error al eliminar la publicación:', error); // Registra el error en la consola
                        alert('Error al eliminar la publicación: ' + error.message); // Muestra un mensaje de error al usuario
                    }
                }
            });
        }

        const likeButton = document.getElementById(`likeBtn-${postId}`); // Obtiene el botón de "me gusta" por ID
        likeButton.addEventListener('click', () => {
            handleLike(postId, postData.likes, postData.likedBy); // Llama a la función para manejar el "me gusta"
        });

        // Comentario
        const commentButton = document.getElementById(`commentBtn-${postId}`);  // Obtiene el botón para agregar un comentario
        commentButton.addEventListener('click', () => {
            handleComment(postId); // Llama a la función para manejar el envío del comentario
        });

        // Cargar comentarios existentes
        loadComments(postId); // Llama a la función para cargar los comentarios de la publicación
    });
});

// Función para verificar si un archivo es un video basado en su extensión
function fileIsVideo(url) {
    const videoExtensions = ['mp4', 'webm', 'ogg'];  // Extensiones de video permitidas
    const extension = url.split('.').pop().toLowerCase(); // Obtiene la extensión del archivo en minúsculas
    return videoExtensions.includes(extension); // Verifica si la extensión está en la lista permitida
}
// Función para manejar el "like" en una publicación
async function handleLike(postId, currentLikes, likedBy) {
    const user = auth.currentUser; // Obtiene el usuario actualmente autenticado
    if (!user) { // Si no hay un usuario autenticado
        alert("Debes iniciar sesión para dar like."); // Muestra un mensaje de advertencia
        return; // Sale de la función
    }

    const userEmail = user.email;  // Correo del usuario autenticado

    try {
        // Verificar si el usuario ya ha dado "like" a la publicación
        if (likedBy && likedBy.includes(userEmail)) {
             // El usuario ya dio "like", por lo que se removerá
            const updatedLikes = currentLikes > 0 ? currentLikes - 1 : 0; // Resta un "like" si es posible (nunca por debajo de 0)
            const updatedLikedBy = likedBy.filter(email => email !== userEmail); // Remueve el correo del usuario de la lista de "likedBy"

            // Actualizar el like en Firebase
            await updateDoc(doc(db, 'post', postId), {
                likes: updatedLikes, // Actualiza el conteo de likes
                likedBy: updatedLikedBy // Actualiza la lista de usuarios que han dado like
            });

        } else {
             // El usuario no ha dado "like", por lo que se añadirá
            await updateDoc(doc(db, 'post', postId), {
                likes: currentLikes + 1, // Incrementa el conteo de likes
                likedBy: [...likedBy, userEmail] // Agrega el correo del usuario a la lista de "likedBy"
            });

        }

        // Preparar los datos del "like" para enviarlos a MySQL
        const dataLike = {
            postId: postId, // ID de la publicación
            comentUser: userEmail,  // Correo del usuario que dio "like"
            date: new Date().toISOString() // Fecha actual en formato ISO (compatible con PHP)
        };

        // Imprimir los datos que se enviarán al servidor PHP
        console.log("Datos que se enviarán a PHP:", JSON.stringify(dataLike));  // Esta línea muestra los datos en la consola

        const response = await fetch('../BACKEND/savelike.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataLike)  // Enviar los datos en formato JSON
        });

        // Obtener la respuesta como texto
        const textResponse = await response.text();  // Aquí obtenemos la respuesta como texto

        console.log("Respuesta cruda del servidor:", textResponse);  // Mostrar la respuesta cruda en la consola

        // Intentar convertirla a JSON
        try {
            const result = JSON.parse(textResponse);  // Intentar analizar como JSON
            console.log("Respuesta procesada como JSON:", result);

            // Verificar la respuesta procesada
            if (result.success) {
                console.log('Like guardado correctamente en MySQL');
            } else {
                console.error("Error al guardar el like en MySQL:", result.message);
            }
        } catch (error) {
            console.error("Error al procesar la respuesta JSON:", error);
        }

    } catch (error) {
        console.error('Error al manejar el like:', error);
    }
}

// Función para manejar el comentario
async function handleComment(postId) {
        // Obtener el usuario actualmente autenticado desde Firebase
    const user = auth.currentUser;
        // Si no hay un usuario autenticado, mostramos un mensaje y detenemos el proceso

    if (!user) {
        alert("Debes iniciar sesión para comentar.");
        return;
    }
    // Obtener el campo de entrada del comentario en el formulario correspondiente a la publicación
    const commentInput = document.getElementById(`commentInput-${postId}`);
        // Obtener el texto del comentario y eliminar los espacios en blanco al principio y al final
    const commentText = commentInput.value.trim();
    // Si el campo de comentario está vacío, mostramos una alerta
    if (commentText === '') {
        alert("El comentario no puede estar vacío.");
        return;
    }
        // Intentar enviar el comentario a través de una petición POST al backend en PHP
    try {
 // Crear un objeto con los datos que se enviarán a PHP
        const datacoment = {
            comentario: commentText,           // Cambiar a 'comentario' como espera el PHP
            comentUser: user.email,            // Cambiar a 'comentUser' como espera el PHP
            comentPost: postId,                 // Cambiar a 'comentPost' como espera el PHP
            date: new Date().toISOString() // Formato ISO para compatibilidad con PHP
        };
        // Mostrar los datos en la consola antes de enviarlos
        console.log("Datos que se enviarán a PHP:", datacoment);
        // Enviar la petición POST a 'savecoment.php' usando fetch
        const response = await fetch('../BACKEND/savecoment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Indicamos que los datos se envían como JSON
            body: JSON.stringify(datacoment) // Convertimos el objeto JavaScript a JSON
        });
         // Mostrar el estado de la respuesta para ver si la petición fue exitosa
        console.log("Estado de la respuesta:", response.status);   // 200 significa éxito
        const result = await response.json();  // Parseamos la respuesta como JSON
        console.log("Resultado del servidor:", result); // Verificar el JSON de respuesta
        // Si el servidor indicó que el comentario se guardó correctamente, mostramos un mensaje
        if (result.success) {
// Si hubo un error en el servidor, mostramos un mensaje con la descripción del error
            console.log("Comentario guardado en MySQL");
        } else {
            console.error("Error al guardar el comentario en MySQL:", result.message);
            alert("Error al guardar el comentario en MySQL." + datacoment);
        }
    } catch (error) {
// Si hubo un error al hacer la petición a PHP, mostramos una alerta
        alert("Error al enviar el comentario a PHP." + error);
    }
     // Intentar guardar el comentario también en Firestore en la subcolección de comentarios
    try {
        // Guardar el comentario en Firestore en la subcolección 'comments' de la publicación
        await addDoc(collection(db, 'post', postId, 'comments'), {
            username: un,  // El correo del usuario que realiza el comentario
            comment: commentText, // El contenido del comentario
            date: serverTimestamp() // Usamos el timestamp de servidor para la fecha
        });
        // Limpiar el campo de texto del comentario una vez que se haya enviado
        commentInput.value = ''; // Limpiar el campo de comentarios
         // Mostrar un mensaje de éxito al usuario
    } 
    // Si hubo un error al añadir el comentario en Firestore, mostrar un mensaje de error
    catch (error) {
        console.error("Error al añadir el comentario:", error);
        alert("Error al añadir el comentario.");
    }
}
// Función para cargar los comentarios de una publicación desde Firestore
async function loadComments(postId) {
     // Obtener el contenedor donde se mostrarán los comentarios de la publicación
    const commentsDiv = document.getElementById(`comments-${postId}`);
 // Crear una consulta para obtener los comentarios ordenados por fecha de manera descendente
    const commentsQuery = query(collection(db, 'post', postId, 'comments'), orderBy('date', 'desc'));
    // Establecer un 'onSnapshot' para escuchar los cambios en la colección de comentarios en tiempo real
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        // Limpiar el contenedor de comentarios antes de cargar los nuevos
        commentsDiv.innerHTML = ''; 
        // Iterar sobre los comentarios obtenidos del snapshot
        snapshot.forEach((doc) => {
            const commentData = doc.data(); // Obtener los datos de cada comentario
            const commentElement = document.createElement('div'); // Crear un elemento div para el comentario
            commentElement.classList.add('comment'); // Añadir una clase CSS para estilizar los comentarios
            commentElement.innerHTML = `<p><strong>${commentData.username}</strong>: ${commentData.comment}</p>`;  // Establecer el contenido del comentario
            commentsDiv.appendChild(commentElement);  // Añadir el comentario al contenedor
        });
    });
}

// Función que verifica si el usuario está autenticado, y si no, redirige a la página de inicio
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Si no hay usuario autenticado, redirige a la página de inicio
        window.location.href = "../index.html"; // Redirige a la página de inicio
    } 
});

