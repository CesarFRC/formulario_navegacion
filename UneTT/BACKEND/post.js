import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

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

    // Guardar publicación en Firestore
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
        alert('Error al publicar en Firestore.');
    }
});

// Escuchar los cambios en la colección 'post' y mostrar las publicaciones
onSnapshot(query(collection(db, 'post'), orderBy('date', 'desc')), (snapshot) => {
    const postList = document.getElementById('postList');
    postList.innerHTML = ''; // Limpiar la lista antes de volver a llenarla

    snapshot.forEach((postSnapshot) => {
        const postData = postSnapshot.data();
        const postId = postSnapshot.id;

        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const user = auth.currentUser;
        const isAuthor = postData.username === user?.email;

        postElement.innerHTML = `
            <article class="media box">
                <div class="media-content">
                    <div class="content">
                        <p><strong>Usuario:</strong> ${postData.username || 'Anónimo'}</p>
                        <p><strong>Fecha:</strong> ${postData.date ? postData.date.toDate().toLocaleString() : 'Sin fecha'}</p>
                        <p>${postData.post}</p>
                        ${postData.mediaURL ? (fileIsVideo(postData.mediaURL) ?
            `<video controls class="post-media" width="400">
                            <source src="${postData.mediaURL}" type="video/mp4">
                            Tu navegador no soporta la reproducción de video.
                        </video>` :
            `<img src="${postData.mediaURL}" alt="Publicación multimedia" class="post-media">`) : ''}
                        <p><strong>Likes:</strong> <span id="likes-${postId}">${postData.likes || 0}</span></p>
                        <button id="likeBtn-${postId}">
                            <img src="../imgs/staricon.png" style="cursor: pointer; width: 30px; height: 30px;">
                        </button>
                        ${isAuthor ? `<button class="delete-btn" data-id="${postId}" style="background-color: red;">Eliminar</button>` : ''}
                        
                        <!-- Comentarios -->
                        <div id="comments-${postId}">
                            <input type="text" id="commentInput-${postId}" placeholder="Escribe un comentario..." style="width: 100%; margin-bottom: 10px;">
                            <button id="commentBtn-${postId}" style="cursor: pointer;">Comentar</button>
                        </div>
                    </div>
                </div>
            </article>
        `;

        postList.appendChild(postElement);

        // Eliminar publicación
        if (isAuthor) {
            const deleteButton = postElement.querySelector(`.delete-btn[data-id="${postId}"]`);
            deleteButton.addEventListener('click', async () => {
                const confirmDelete = confirm("¿Estás seguro de que deseas eliminar la publicación?");
                if (confirmDelete) {
                    try {
                        await deleteDoc(doc(db, 'post', postId)); // Usa 'postId' en lugar de 'doc.id'
                        alert("Publicación eliminada correctamente");
                    } catch (error) {
                        console.error('Error al eliminar la publicación:', error);
                        alert('Error al eliminar la publicación: ' + error.message);
                    }
                }
            });
        }

        // Like
        const likeButton = document.getElementById(`likeBtn-${postId}`);
        likeButton.addEventListener('click', () => {
            handleLike(postId, postData.likes, postData.likedBy);
        });

        // Comentario
        const commentButton = document.getElementById(`commentBtn-${postId}`);
        commentButton.addEventListener('click', () => {
            handleComment(postId);
        });

        // Cargar los comentarios
        loadComments(postId);
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

    const userEmail = user.email;

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

    const commentsQuery = query(collection(db, 'post', postId, 'comments'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        commentsDiv.innerHTML = ''; // Limpiar antes de cargar los nuevos comentarios

        snapshot.forEach((doc) => {
            const commentData = doc.data();
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `<p><strong>${commentData.username}</strong>: ${commentData.comment}</p>`;
            commentsDiv.appendChild(commentElement);
        });
    });
}
