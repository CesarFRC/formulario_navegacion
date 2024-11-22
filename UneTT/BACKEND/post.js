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

    // Publicar en Firebase
    try {
        const docRef = await addDoc(collection(db, 'post'), {
            username: user.email,
            date: serverTimestamp(),
            likes: 0,
            likedBy: [],
            post: content,
            mediaURL: mediaURL
        });

        // Datos para enviar a PHP
        const data = {
            username: user.email,
            post: content,
            mediaURL: mediaURL,
            date: new Date().toISOString(),
            postId: docRef.id
        };

        // Enviar datos de la publicación a PHP para MySQL
        const response = await fetch('../BACKEND/guardarPublicacion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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
        console.error('Error al publicar o enviar los datos:', error);
        alert('Error al publicar o enviar los datos.');
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
                        <p id="otheruser-${postId}"><strong>Usuario:</strong> ${postData.username || 'Anónimo'}</p>
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
                        <nav class="level is-mobile">
                            <div class="level-left">
                                <div id="comments-${postId}"></div>
                            </div>
                        </nav>
                        <input type="text" id="commentInput-${postId}" placeholder="Escribe un comentario..." style="width: 100%; margin-bottom: 10px;">
                        <button id="commentBtn-${postId}" style="cursor: pointer;">Comentar</button>
                    </div>
                </div>
            </article>
        `;

        postList.appendChild(postElement);

        const btotrouser = document.getElementById(`otheruser-${postId}`);
        btotrouser.addEventListener('click', () => {
            localStorage.setItem("perfilemail", postData.username);
            window.location.href = "../HTML/verotroperfil.html";
        });

        // Eliminar publicación
        if (isAuthor) {
            const deleteButton = postElement.querySelector(`.delete-btn[data-id="${postId}"]`);
            deleteButton.addEventListener('click', async () => {
                const confirmDelete = confirm("¿Estás seguro de que deseas eliminar la publicación?");
                if (confirmDelete) {
                    try {
                        // Eliminar en Firebase
                        await deleteDoc(doc(db, 'post', postId));
                        alert("Publicación eliminada correctamente");

                        // Eliminar en MySQL
                        const data = { idFB: postId };
                        const response = await fetch('../BACKEND/eliminar_publicacion.php', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });

                        const result = await response.json();
                        if (result.success) {
                            alert("Publicación eliminada correctamente en MySQL");
                        } else {
                            alert(result.message);
                        }
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
        const updatedLikes = likedBy && likedBy.includes(userEmail)
            ? currentLikes - 1
            : currentLikes + 1;
        const updatedLikedBy = likedBy ? (likedBy.includes(userEmail) 
            ? likedBy.filter(email => email !== userEmail)
            : [...likedBy, userEmail])
            : [userEmail];

        // Actualizar Firebase
        await updateDoc(doc(db, 'post', postId), {
            likes: updatedLikes,
            likedBy: updatedLikedBy
        });

        // Actualizar el número de likes
        document.getElementById(`likes-${postId}`).textContent = updatedLikes;

        // Enviar a MySQL
        const dataLike = {
            postId: postId,
            comentUser: userEmail,
            date: new Date().toISOString()
        };

        const response = await fetch('../BACKEND/savelike.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataLike)
        });

        const result = await response.json();
        if (result.success) {
            console.log('Like guardado correctamente en MySQL');
        } else {
            console.error("Error al guardar el like en MySQL:", result.message);
        }
    } catch (error) {
        console.error('Error al manejar el like:', error);
    }
}

// Función para manejar los comentarios
async function handleComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentText = commentInput.value.trim();
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para comentar.");
        return;
    }

    if (!commentText) {
        alert("No puedes publicar un comentario vacío.");
        return;
    }

    try {
        const dataComment = {
            postId: postId,
            comentUser: user.email,
            comentario: commentText,
            date: new Date().toISOString()
        };

        // Enviar comentario a Firebase
        await addDoc(collection(db, 'comments'), dataComment);

        // Enviar comentario a MySQL
        const response = await fetch('../BACKEND/savecoment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataComment)
        });

        const result = await response.json();
        if (result.success) {
            console.log('Comentario guardado correctamente en MySQL');
        } else {
            console.error('Error al guardar el comentario en MySQL:', result.message);
        }

        commentInput.value = ''; // Limpiar el campo de comentario
    } catch (error) {
        console.error('Error al guardar el comentario:', error);
        alert('Error al guardar el comentario.');
    }
}

// Función para cargar los comentarios
async function loadComments(postId) {
    const commentsContainer = document.getElementById(`comments-${postId}`);
    commentsContainer.innerHTML = ''; // Limpiar los comentarios antes de cargar nuevos

    const querySnapshot = await getDocs(collection(db, 'comments'));
    querySnapshot.forEach(doc => {
        const commentData = doc.data();
        if (commentData.postId === postId) {
            const commentElement = document.createElement('div');
            commentElement.innerHTML = `
                <p><strong>${commentData.comentUser}:</strong> ${commentData.comentario}</p>
                <p><small>${new Date(commentData.date).toLocaleString()}</small></p>
            `;
            commentsContainer.appendChild(commentElement);
        }
    });
}
