// Importar las funciones necesarias desde los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Configuración de Firebase para la aplicación web
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U", // Clave para autenticación de Firebase
    authDomain: "unett-4074c.firebaseapp.com", // Dominio autorizado para el proyecto
    databaseURL: "https://unett-4074c-default-rtdb.firebaseio.com",  // URL de la base de datos en tiempo real (opcional)
    projectId: "unett-4074c",  // ID único del proyecto en Firebase
    storageBucket: "unett-4074c.appspot.com", // URL para almacenamiento de archivos
    messagingSenderId: "401481887315",  // ID para mensajería en la nube (Firebase Cloud Messaging)
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6", // ID de la aplicación Firebase
    measurementId: "G-M3JLBLZX7R" // ID para medición y análisis (opcional)
};

// Inicializar Firebase con la configuración especificada
const app = initializeApp(firebaseConfig);
// Inicializar y habilitar las analíticas de Firebase
const analytics = getAnalytics(app);
// Obtener la instancia de autenticación de Firebase
const auth = getAuth();

// Seleccionar el botón de cierre de sesión por su ID
const submit = document.getElementById('cerrar');
// Agregar un evento 'click' al botón de cierre de sesión
submit.addEventListener("click", function (event) {
    event.preventDefault() // Evitar el comportamiento predeterminado del botón
        // Llamar a la función `signOut` para cerrar sesión del usuario actual
    signOut(auth).then(() => {
        // Cierre de sesión exitoso
        window.location.href = "../index.html";  // Redirigir al usuario a la página de inicio
    }).catch((error) => {
// Manejar errores durante el cierre de sesión
        console.error("Error al cerrar sesión:", error); // Imprimir el error en la consola para depuración
        alert("Error al cerrar sesión: " + error.message); // Mostrar un mensaje descriptivo del error al usuario
    });


})