// Importa las funciones necesarias desde los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Configuración de Firebase con las credenciales del proyecto
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U", // Clave de API para interactuar con Firebase
    authDomain: "unett-4074c.firebaseapp.com", // Dominio autorizado para la autenticación
    databaseURL: "https://unett-4074c-default-rtdb.firebaseio.com", // URL de la base de datos en tiempo real
    projectId: "unett-4074c", // ID del proyecto Firebase
    storageBucket: "unett-4074c.appspot.com", // Almacenamiento para archivos del proyecto
    messagingSenderId: "401481887315",  // ID para mensajería de Firebase
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6", // Identificador único de la aplicación
    measurementId: "G-M3JLBLZX7R"   // ID para mediciones (Analytics)
};

// Inicializa Firebase con la configuración especificada
const app = initializeApp(firebaseConfig);
// Obtiene una instancia del servicio de autenticación de Firebase
const auth = getAuth();

// Verifica si el usuario está autenticado
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Si no hay un usuario autenticado, redirige a la página de inicio de sesión
        window.location.href = "../index.html"; // Redirige a la página de inicio
    } 
});

// Obtiene el correo electrónico almacenado en localStorage
const useremail = localStorage.getItem("perfilemail")
// Extrae la matrícula a partir del correo electrónico (primeros 8 caracteres)
let matricula = useremail.substring(0, 8);

// Realiza una solicitud al servidor para obtener los datos del perfil del usuario
fetch('../BACKEND/viewperfileuser.php', {
    method: 'POST', // Método HTTP utilizado para la solicitud
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Define el tipo de contenido enviado
    },
    body: new URLSearchParams({
        'email': useremail // Envía el correo del usuario como parámetro
    })
})
.then(response => response.text()) // Convierte la respuesta en texto
.then(data => {
    // Maneja casos de error en la respuesta del servidor
    if (data.startsWith("Usuario no encontrado") || data.startsWith("Error") || data.startsWith("Email no proporcionado")) {
        alert(data); // Muestra un mensaje de error al usuario
    } else {
        // Divide los datos en líneas para obtener información específica
        const resultados = data.split("\n");
        // Extrae información del usuario con valores predeterminados si faltan datos
        let username = resultados[0];
        let biografia = resultados.length > 1 ? resultados[1] : 'No biografia';
        let fecha = resultados.length > 2 ? resultados[2] : 'No fecha';

        // Almacena los datos recibidos en localStorage
        localStorage.setItem("userName", username);
        localStorage.setItem("bio", biografia);
        localStorage.setItem("fecha", fecha);
        localStorage.setItem("email", useremail);
        localStorage.setItem("matricula", matricula);

        // Muestra los datos en los elementos del DOM correspondientes
        document.getElementById('name').textContent = username; // Muestra el nombre del usuario
        document.getElementById('correoelectronico').value = useremail; // Muestra el correo electrónico
        document.getElementById('matricula').value = matricula;  // Muestra la matrícula
        document.getElementById('bio').value = biografia; // Muestra la biografía
        document.getElementById('fecha').value = fecha;  // Muestra la fecha de registro
    }
})
.catch(error => {
     // Maneja errores en la solicitud al servidor
    alert('Error:' + error); // Handle any request errors
});
