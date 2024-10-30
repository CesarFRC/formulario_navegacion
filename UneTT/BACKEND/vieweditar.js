import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U",
    authDomain: "unett-4074c.firebaseapp.com",
    projectId: "unett-4074c",
    storageBucket: "unett-4074c.appspot.com",
    messagingSenderId: "401481887315",
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6",
    measurementId: "G-M3JLBLZX7R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Escuchar el estado de autenticación
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const email = user.email; // Obtiene el correo del usuario
            let userEmail = email;
            let matricula = userEmail.substring(0, 8); // Obtener la matrícula del correo consultado

            alert("Correo electrónico obtenido: " + userEmail); // Alerta para verificar el correo

            // Cargar datos del perfil
            fetch('../BACKEND/viewperfileuser.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'email': userEmail
                })
            })
            .then(response => response.text())
            .then(data => {
                const resultados = data.split("\n");
                if (resultados.length >= 3) {
                    let username = resultados[0]; // Asigna el nombre de usuario
                    let biografia = resultados[1]; // Asigna la biografía
                    let fecha = resultados[2];      // Asigna la fecha de creación

                    // Guarda el nombre de usuario en localStorage
                    localStorage.setItem("userName", username);

                    // Actualiza el DOM con los datos del usuario
                    document.getElementById('name').value = username; // Nombre de usuario
                    document.getElementById('bio').value = biografia;      // Biografía
                    document.getElementById('fecha').value = fecha;        // Fecha de creación
                    document.getElementById('correoelectronico').value = userEmail; // Email
                    document.getElementById('matricula').value = matricula; // Matrícula
                } else {
                    alert("Usuario no encontrado.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Hubo un error al cargar la información.");
            });

            // Evento para actualizar el perfil
            document.getElementById('updateProfil').addEventListener('submit', (event) => {
                event.preventDefault(); // Evita el envío del formulario por defecto

                // Obtener nuevos datos
                const newUsername = document.getElementById('name').value;
                const newPassword = document.getElementById('password').value;
                const newBio = document.getElementById('bio').value;

                // Imprimir el correo electrónico que se va a enviar
                console.log("Correo electrónico a enviar:", userEmail);

                // Hacer la llamada para actualizar el perfil
                fetch('../BACKEND/updateProfile.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'correoelectronico': userEmail, // Envía el correo del usuario autenticado
                        'username': newUsername,
                        'password': newPassword,
                        'bio': newBio
                    })
                })
                .then(response => response.text())
                .then(data => {
                    console.log(data); // Maneja la respuesta de la actualización
                    alert(data); // Mostrar mensaje de éxito o error
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Hubo un error al actualizar el perfil.");
                });
            });
        } else {
            alert("No hay usuario autenticado.");
        }
    });
});
