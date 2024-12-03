// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuracion
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

// Inicializa Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Inicializa Analytics para el seguimiento de eventos


// Obtén la instancia de autenticación de Firebase
const auth = getAuth();
//CODIGO PARA SI NO TIENE LA COOKIE GUARDADA DIRIGE AL INICIO
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html"; // Redirige a la página de inicio
    } 
});



// Verifica si el usuario está autenticado y obtiene sus datos
auth.onAuthStateChanged((user) => {
    if (user) {
        // Extrae el correo electrónico del usuario
        const email = user.email;
         // Obtén la matrícula a partir del correo (los primeros 8 caracteres)
        let matricula = email.substring(0, 8); 

        // Realiza una solicitud al servidor para obtener el perfil del usuario
        fetch('../BACKEND/viewperfileuser.php', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Tipo de contenido para la solicitud 
            },
            body: new URLSearchParams({
                'email': email // Envía el correo como parámetro
            })
        })
        .then(response => response.text()) // Convierte la respuesta en texto
        .then(data => {
             // Verifica si los datos devueltos contienen errores
            if (data.startsWith("Usuario no encontrado") || data.startsWith("Error") || data.startsWith("Email no proporcionado")) {
                alert(data);  // Muestra un mensaje de error si es el caso
            } else {
                // Divide los datos recibidos en líneas para extraer la información
                const resultados = data.split("\n");
                 // Asigna valores recibidos a variables (con valores predeterminados si faltan)
                let username = resultados[0];
                let biografia = resultados.length > 1 ? resultados[1] : 'No biografia';
                let fecha = resultados.length > 2 ? resultados[2] : 'No fecha';

                // Almacena los datos en localStorage para uso futuro
                localStorage.setItem("userName", username);
                localStorage.setItem("bio", biografia);
                localStorage.setItem("fecha", fecha);
                localStorage.setItem("email", email);
                localStorage.setItem("matricula", matricula);

                 // Muestra los datos en la página actual
                document.getElementById('name').textContent = username; // Nombre de usuario
                document.getElementById('correoelectronico').value = email; // Correo electrónico
                document.getElementById('matricula').value = matricula; // Matrícula
                document.getElementById('bio').value = biografia; // Biografía
                document.getElementById('fecha').value = fecha;  // Fecha de creación
            }
        })
        .catch(error => {
                        // Maneja cualquier error en la solicitud al servidor
            alert('Error:' + error); 
        });
    }
});
