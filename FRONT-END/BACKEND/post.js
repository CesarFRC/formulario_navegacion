
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);




//buton sumbit
const submit = document.getElementById('submit');
submit.addEventListener("click", async function (event) {
    event.preventDefault()


    const user = auth.currentUser;




    if (!user) {
        alert("Debes iniciar sesión para publicar.");
        return;
    }


    let content = document.getElementById('postcontent').value;
    if (content === '') {
        alert("No puedes publicar contenido vacío.");
        return;
    }

    try {
        // Agregar la publicación a Firestore
        await addDoc(collection(db, 'post'), {
            username: user.email,
            date: serverTimestamp(),
            likes: 0,
            likedBy: [],
            post: content
        });

        alert('Publicación exitosa');
        document.getElementById('postcontent').value = ''; // Limpiar el campo

    } catch (error) {
        console.error('Error al publicar:', error);
        alert(error);
    }

})

//hacer que se actualize mis publicaciones
// Referencia a la colección 'post'
const postCollectionRef = collection(db, 'post');

// Escuchar los cambios en la colección 'post'

onSnapshot(query(postCollectionRef, orderBy('date', 'desc')), (snapshot) => {
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
                    <p>${postData.post} </p>

                    <p><strong>Stars:</strong> <span id="likes-${doc.id}"  >${postData.likes || 0}</span></p>
                    <br>
                    <button id="likeBtn-${doc.id}"><img src="../imgs/staricon.png" style="cursor: pointer; width: 30px;
                    height: 30px;"></button>
            
                    
                    

                </div>
                 <nav class="level is-mobile">
                        <div class="level-left">
                            <a class="level-item" aria-label="like">
                                <span class="icon is-small">
                                    <i class="fas fa-heart"></i>
                                </span>
                            </a>
                            <a class="level-item" aria-label="comment">
                                <span class="icon is-small">
                                    <i class="fas fa-comment"></i>
                                </span>
                            </a>
                        </div>
                        <div>
                        </div>
                    </nav>
            </div>

            
            
            </article>
            
           
        `;

        // Agregar la publicación al contenedor
        postList.appendChild(postElement);

        const likeButton = document.getElementById(`likeBtn-${doc.id}`);
        likeButton.addEventListener('click', () => {

            handleLike(doc.id, postData.likes, postData.likedBy);
        });
    });
});

// Función para manejar el "like"
async function handleLike(postId, currentLikes, likedBy) {
    const postRef = doc(db, 'post', postId);
    const userId = auth.currentUser.uid; // Obtener el ID del usuario actual

    try {
        // Comprobar si el usuario ya ha dado like
        if (likedBy && likedBy.includes(userId)) {
            alert("Ya has dado like a esta publicación");
            return;
        }

        // Actualizar los likes y agregar el ID del usuario al array 'likedBy'
        await updateDoc(postRef, {
            likes: currentLikes + 1,
            likedBy: [...(likedBy || []), userId] // Agregar el usuario actual al array
        });

        console.log('Like añadido con éxito');
    } catch (error) {
        console.error('Error al añadir el like:', error);
    }
}
