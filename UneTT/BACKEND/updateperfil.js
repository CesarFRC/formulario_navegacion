// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuration
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

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const email = user.email; // Obtiene el correo del usuario

            // Realizar una solicitud POST a PHP para obtener datos adicionales
            fetch('../BACKEND/viewperfileuser.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'email': email
                })
            })
            .then(response => response.text())
            .then(data => {
                const resultados = data.split("\n");
                if (resultados.length >= 3) {
                    document.getElementById('name').value = resultados[0]; // Nombre de usuario
                    document.getElementById('bio').value = resultados[1]; // Biografía
                    document.getElementById('correoelectronico').value = email; // Email
                } else {
                    alert("Usuario no encontrado.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Hubo un error al cargar la información.");
            });

            // Manejar el envío del formulario
            document.getElementById('perfilForm').addEventListener('submit', (event) => {
                event.preventDefault(); // Evita el envío predeterminado del formulario
                const newUsername = document.getElementById('name').value.trim(); // Elimina espacios en blanco
                const newBiografia = document.getElementById('bio').value.trim(); // Elimina espacios en blanco
                const newPassword = document.querySelector('input[name="password"]').value.trim(); // Elimina espacios en blanco

                // Validar que al menos un campo esté lleno
                if (!newUsername && !newBiografia && !newPassword) {
                    alert("Por favor, completa al menos un campo para actualizar.");
                    return;
                }

                // Enviar datos al servidor
                fetch('../BACKEND/updateProfile.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'email': email, // Enviar el correo electrónico para la actualización
                        'username': newUsername,
                        'bio': newBiografia,
                        'password': newPassword
                    })
                })
                .then(response => response.text())
                .then(data => {
                    alert(data); // Muestra el mensaje de respuesta del servidor
                    // Redirigir a la página de ver perfil
                    if (data.includes("Perfil actualizado correctamente.")) {
                        window.location.href = '../HTML/ver_perfil.html'; // Cambia 'verPerfil.html' por la URL real de tu página de perfil
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Hubo un error al actualizar los datos.");
                });
            });
        }
    });
});
