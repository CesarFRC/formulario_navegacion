// Importa e inicializa Firebase App y Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U",
    authDomain: "unett-4074c.firebaseapp.com",
    projectId: "unett-4074c",
    storageBucket: "unett-4074c.appspot.com",
    messagingSenderId: "401481887315",
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6",
    measurementId: "G-M3JLBLZX7R"
};

// Inicializar Firebase y obtener la instancia de autenticación
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


//CODIGO PARA SI NO TIENE LA COOKIE GUARDADA DIRIGE AL INICIO
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html"; // Redirige a la página de inicio
    } 
});
// Escucha el estado de autenticación y carga el perfil
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const email = user.email; 
            const matricula = email.substring(0, 8);

            // Cargar datos del perfil desde el backend
            fetch('../BACKEND/viewperfileuser.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ 'email': email })
            })
            .then(response => response.text())
            .then(data => {
                const resultados = data.split("\n");
                if (resultados.length >= 3) {
                    document.getElementById('name').value = resultados[0]; // Username
                    document.getElementById('bio').value = resultados[1]; // Biografía
                    document.getElementById('fecha').value = resultados[2]; // Fecha de creación
                    document.getElementById('correoelectronico').value = email; // Email
                    document.getElementById('matricula').value = matricula; // Matrícula
                }
            })
            .catch(error => console.error("Error al cargar el perfil:", error));
            
            // Manejo de actualización del perfil y contraseña
            document.getElementById('updateProfil').addEventListener('submit', (event) => {
                event.preventDefault(); // Evita el envío del formulario por defecto

                const newUsername = document.getElementById('name').value;
                const newPassword = document.getElementById('password').value;
                const newBio = document.getElementById('bio').value;

                // Llamada para actualizar el perfil en el backend
                fetch('../BACKEND/updateProfile.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'correoelectronico': email,
                        'username': newUsername,
                        'password': newPassword,
                        'bio': newBio
                    })
                })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    // Solicita la contraseña actual para la reautenticación
                    const currentPassword = prompt("Por favor, ingresa tu contraseña actual para actualizar los datos:");

                    if (currentPassword) {
                        const credential = EmailAuthProvider.credential(user.email, currentPassword);

                        // Reautenticar al usuario
                        reauthenticateWithCredential(user, credential)
                            .then(() => {
                                // Ahora se puede actualizar la contraseña
                                updatePassword(user, newPassword)
                                    .then(() => {
                                        window.location.href = "../HTML/ver_perfil.html";
                                    })
                                    .catch((error) => {
                                        alert("Error al actualizar los datos " + error.message);
                                    });
                            })
                            .catch((error) => {
                                alert("Error al reautenticar: " + error.message);
                            });
                    } else {
                        alert("La contraseña actual es necesaria para actualizar tus datos");
                    }
                })
                .catch(error => {
                    alert("Error al actualizar perfil: " + error.message);
                });
            });
        } 
    });
});


