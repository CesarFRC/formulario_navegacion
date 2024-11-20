import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U",
    authDomain: "unett-4074c.firebaseapp.com",
    databaseURL: "https://unett-4074c-default-rtdb.firebaseio.com",
    projectId: "unett-4074c",
    storageBucket: "unett-4074c.appspot.com",
    messagingSenderId: "401481887315",
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6",
    measurementId: "G-M3JLBLZX7R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

// Botón submit para publicar
const submit = document.getElementById('submit');
submit.addEventListener("click", async function (event) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para publicar.");
        return;
    }

    let content = document.getElementById('postcontent').value;
    const fileInput = document.getElementById('mediaUpload');
    const file = fileInput.files[0];

    if (content === '' && !file) {
        alert("No puedes publicar contenido vacío.");
        return;
    }



    let mediaURL = null;
    if (file) {
        const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            mediaURL = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            alert("Error al subir el archivo.");
            return;
        }
    }
    // Enviar los datos a PHP usando fetch (guardar en MySQL)
    const data = {
        username: user.email,
        post: content,
        mediaURL: mediaURL,
        date: new Date().toISOString() // Formato ISO para compatibilidad con PHP
    };

    try {
        // Enviar los datos de la publicación a PHP para guardarlos en MySQL
        const response = await fetch('../BACKEND/guardarPublicacion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // Convertir los datos en JSON
        });

        const result = await response.json();
        if (result.success) {
            alert('Publicación exitosa');
            document.getElementById('postcontent').value = ''; // Limpiar el campo de texto
            fileInput.value = ''; // Limpiar el campo de archivos
        } else {
            alert('Error al guardar la publicación en MySQL');
        }
    } catch (error) {
        console.error('Error al enviar los datos a PHP:', error);
        alert('Error al enviar los datos a PHP.');
    }

    
    try {
        await addDoc(collection(db, 'post'), {
            username: user.email,
            date: serverTimestamp(),
            likes: 0,
            likedBy: [],
            post: content,
            mediaURL: mediaURL
        });

        alert('Publicación exitosa');
        document.getElementById('postcontent').value = ''; // Limpiar el campo de texto
        fileInput.value = ''; // Limpiar el campo de archivos
    } catch (error) {
        console.error('Error al publicar:', error);
        alert(error);
    }
});

// Escuchar los cambios en la colección 'post' y mostrar las publicaciones
onSnapshot(query(collection(db, 'post'), orderBy('date', 'desc')), (snapshot) => {
    const postList = document.getElementById('postList');
    postList.innerHTML = ''; // Limpiar la lista antes de volver a llenarla

    snapshot.forEach((doc) => {
        const postData = doc.data();

        // Crear un nuevo elemento para mostrar la publicación
        const postElement = document.createElement('div');
        postElement.classList.add('post');

         // Aquí verificamos si el usuario es el autor de la publicación
            const user = auth.currentUser;
            const isAuthor = postData.username === user?.email;

          
        postElement.innerHTML = `
        <article class="media box">
            <div class="media-content">
                <div class="content">
                    <p id="user-${doc.id}"><strong>Usuario:</strong> ${postData.username || 'Anónimo'}</p>
                    <p><strong>Fecha:</strong> ${postData.date ? postData.date.toDate().toLocaleString() : 'Sin fecha'}</p>
                    <p>${postData.post}</p>
                    ${postData.mediaURL ? 
                        (fileIsVideo(postData.mediaURL) ? 
                            `<video controls class="post-media" width="400">
                                <source src="${postData.mediaURL}" type="video/mp4">
                                Tu navegador no soporta la reproducción de video.
                            </video>` 
                        : 
                            `<img src="${postData.mediaURL}" alt="Publicación multimedia" class="post-media">`) 
                        : ''}
                    <p><strong>Stars:</strong> <span id="likes-${doc.id}">${postData.likes || 0}</span></p>
                    <br>
                    <button id="likeBtn-${doc.id}">
                        <img src="../imgs/staricon.png" style="cursor: pointer; width: 30px; height: 30px;">
                    </button>
                    ${isAuthor ? `<button id="deleteBtn-${doc.id}" style="background-color: red;">Eliminar</button>` : ''}
                    </div>
                <nav class="level is-mobile">
                    <div class="level-left">
                        <div id="comments-${doc.id}" class="comments"></div>
                    </div>
                </nav>
                <input type="text" id="commentInput-${doc.id}" placeholder="Escribe un comentario..." />
                <button id="commentBtn-${doc.id}">Comentar</button>
            </div>
        </article>
    `;
    


        postList.appendChild(postElement);

         // Si es el autor, agrega la funcionalidad del botón de eliminar
    if (isAuthor) {
        const deleteButton = document.getElementById(`deleteBtn-${doc.id}`);
        deleteButton.addEventListener('click', async () => {
            try {
                // Eliminar publicación de Firestore
                await deleteDoc(doc(db, 'post', doc.id));

                // Eliminar publicación de MySQL (si es necesario)
                const response = await fetch('../BACKEND/eliminarPublicacion.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: doc.id })  // Enviar el ID de la publicación
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Publicación eliminada correctamente.');
                } else {
                    alert('Error al eliminar la publicación en MySQL.');
                }

            } catch (error) {
                console.error('Error al eliminar la publicación:', error);
                alert('Error al eliminar la publicación.');
            }
        });
    }

        const bt = document.getElementById(`user-${doc.id}`);
        bt.addEventListener('click', () => {
            //declaro una variable global para acceder desde otro javascript para ver el perfil dependiendo al correo 
            localStorage.setItem("perfilemail", postData.username);
            window.location.href = "../HTML/verotroperfil.html";

        });


        const likeButton = document.getElementById(`likeBtn-${doc.id}`);
        likeButton.addEventListener('click', () => {
            handleLike(doc.id, postData.likes, postData.likedBy);
        });

        loadComments(doc.id); // Cargar comentarios para cada publicación

        const commentButton = document.getElementById(`commentBtn-${doc.id}`);
        commentButton.addEventListener('click', () => {
            handleComment(doc.id);
        });
    });
});
// Función para verificar si es un video
function fileIsVideo(url) {
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const extension = url.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension);
}


// Función para manejar el "like"
async function handleLike(postId, currentLikes, likedBy) {
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para dar like.");
        return;
    }

    const userEmail = user.email;  // Correo del usuario

    try {
        // Si el usuario ya ha dado like, lo quitamos
        if (likedBy && likedBy.includes(userEmail)) {
            const updatedLikes = currentLikes > 0 ? currentLikes - 1 : 0;
            const updatedLikedBy = likedBy.filter(email => email !== userEmail);

            // Actualizar el like en Firebase
            await updateDoc(doc(db, 'post', postId), {
                likes: updatedLikes,
                likedBy: updatedLikedBy
            });

            console.log('Like removido con éxito');
        } else {
            // Si el usuario no ha dado like, lo agregamos
            await updateDoc(doc(db, 'post', postId), {
                likes: currentLikes + 1,
                likedBy: [...likedBy, userEmail]
            });

            console.log('Like añadido con éxito');
        }

        // Enviar el like a MySQL
        const dataLike = {
            postId: postId,
            comentUser: userEmail,
            date: new Date().toISOString() // Formato ISO para compatibilidad con PHP
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
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para comentar.");
        return;
    }

    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentText = commentInput.value.trim();

    if (commentText === '') {
        alert("El comentario no puede estar vacío.");
        return;
    }
    // Enviar comentario a MySQL a través de PHP
 try {
    const datacoment = {
        comentario: commentText,           // Cambiar a 'comentario' como espera el PHP
        comentUser: user.email,            // Cambiar a 'comentUser' como espera el PHP
        comentPost: postId,                 // Cambiar a 'comentPost' como espera el PHP
        date: new Date().toISOString() // Formato ISO para compatibilidad con PHP
    };
// Mostrar los datos en la consola antes de enviarlos
    console.log("Datos que se enviarán a PHP:", datacoment);
    const response = await fetch('../BACKEND/savecoment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datacoment)
    });
    console.log("Estado de la respuesta:", response.status); // Verifica el estado de la respuesta
    const result = await response.json();
    console.log("Resultado del servidor:", result); // Verifica el JSON de respuesta
    if (result.success) {
        console.log("Comentario guardado en MySQL");
    } else {
        console.error("Error al guardar el comentario en MySQL:", result.message);
        alert("Error al guardar el comentario en MySQL." + datacoment);
    }
} catch (error) {
    console.error("Error al enviar el comentario a PHP:", error);
    alert("Error al enviar el comentario a PHP.");
}

    try {
        // Guardar el comentario en una subcolección 'comments' dentro de la publicación
        await addDoc(collection(db, 'post', postId, 'comments'), {
            username: user.email,
            comment: commentText,
            date: serverTimestamp()
        });

        commentInput.value = ''; // Limpiar el campo de comentarios
        alert("Comentario añadido con éxito");
    } catch (error) {
        console.error("Error al añadir el comentario:", error);
        alert("Error al añadir el comentario.");
    }
}
 
// Cargar los comentarios de una publicación
async function loadComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);

    try {
        const commentsQuery = query(
            collection(db, 'post', postId, 'comments'),
            orderBy('date', 'asc') // Ordenar por fecha ascendente
        );

        onSnapshot(commentsQuery, (snapshot) => {
            commentsDiv.innerHTML = ''; // Limpiar los comentarios antes de mostrarlos

            snapshot.forEach((doc) => {
                const commentData = doc.data();
                const commentElement = document.createElement('p');
                commentElement.innerHTML = `<strong>${commentData.username}:</strong> ${commentData.comment} <em>${commentData.date ? commentData.date.toDate().toLocaleString() : ''}</em>`;
                commentsDiv.appendChild(commentElement);
            });
        });
    } catch (error) {
        console.error("Error al cargar los comentarios:", error);
    }
}