import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"; 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
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
const analytics = getAnalytics(app);
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
            mediaURL = await getDownloadURL(snapshot.ref); // Obtener la URL de descarga
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            alert("Error al subir el archivo.");
            return;
        }
    }

    try {
        await addDoc(collection(db, 'post'), {
            username: user.email,
            date: serverTimestamp(),
            likes: 0,
            likedBy: [],
            post: content,
            mediaURL: mediaURL // URL del archivo multimedia
        });

        alert('Publicación exitosa');
        document.getElementById('postcontent').value = ''; // Limpiar el campo de texto
        fileInput.value = ''; // Limpiar el campo de archivos
    } catch (error) {
        console.error('Error al publicar:', error);
        alert(error);
    }
});

// Botón para eliminar el archivo seleccionado
const deleteButton = document.getElementById('deleteButton');
const fileNameDisplay = document.getElementById('fileName');

deleteButton.addEventListener("click", async function () {
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para eliminar un archivo.");
        return;
    }

    const fileInput = document.getElementById('mediaUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert("No hay ningún archivo seleccionado para eliminar.");
        return;
    }

    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    console.log(`Intentando eliminar el archivo en la ruta: posts/${user.uid}/${file.name}`); // Agregar log para depuración

    try {
        // Verificar si el archivo existe antes de intentar eliminarlo
        await getMetadata(storageRef);
        
        await deleteObject(storageRef); // Llama a la función para eliminar el archivo
        fileInput.value = ''; // Limpiar el campo de archivos después de eliminar
        fileNameDisplay.textContent = ''; // Limpiar el nombre del archivo mostrado
        alert("Archivo eliminado con éxito.");
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            alert("El archivo no existe.");
        } else {
            console.error("Error al eliminar el archivo:", error);
            alert("Error al eliminar el archivo: " + error.message);
        }
    }
});

// Modificar el evento del input de archivos
const fileInput = document.getElementById('mediaUpload');
fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];

    if (file) {
        fileNameDisplay.textContent = `Archivo seleccionado: ${file.name}`; // Mostrar el nombre del archivo
    } else {
        fileNameDisplay.textContent = ''; // Limpiar si no hay archivo seleccionado
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

        postElement.innerHTML = ` 
            <article class="media box">
                <figure class="media-left">
                    <p class="image is-64x64">
                        <img src="https://bulma.io/assets/images/placeholders/128x128.png" />
                    </p>
                </figure>
                <div class="media-content">
                    <div class="content">
                        <p><strong>Usuario:</strong> ${postData.username || 'Anónimo'}</p>
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
                        <button id="likeBtn-${doc.id}"><img src="../imgs/staricon.png" style="cursor: pointer; width: 30px; height: 30px;"></button>
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
    const videoExtensions = ['mp4', 'webm', 'ogg']; // Extensiones válidas para videos
    const extension = url.split('.').pop().toLowerCase(); // Obtener la extensión del archivo
    return videoExtensions.includes(extension); // Verificar si la extensión es válida
}

// Función para manejar el "like"
async function handleLike(postId, currentLikes, likedBy) {
    const postRef = doc(db, 'post', postId);
    const userId = auth.currentUser.uid;

    try {
        if (likedBy && likedBy.includes(userId)) {
            alert("Ya has dado like a esta publicación.");
            return;
        }

        await updateDoc(postRef, {
            likes: currentLikes + 1,
            likedBy: [...(likedBy || []), userId]
        });

        console.log('Like añadido con éxito');
    } catch (error) {
        console.error('Error al añadir el like:', error);
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

    // Aquí puedes agregar la lógica para almacenar el comentario en Firestore
    // Por ejemplo, en una colección de comentarios o directamente en el documento de la publicación
}

// Cargar los comentarios de una publicación
async function loadComments(postId) {
    // Implementar la lógica para cargar comentarios aquí
}
