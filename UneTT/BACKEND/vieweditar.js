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
        }
    });
});
