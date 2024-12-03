// Importar las funciones necesarias de los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Configuración de Firebase para la aplicación web
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U", // Clave API para la autenticación de Firebase
    authDomain: "unett-4074c.firebaseapp.com", // Dominio de autenticación
    databaseURL: "https://unett-4074c-default-rtdb.firebaseio.com",  // URL de la base de datos en tiempo real
    projectId: "unett-4074c", // ID del proyecto
    storageBucket: "unett-4074c.appspot.com", // Almacenamiento para archivos
    messagingSenderId: "401481887315", // ID para servicios de mensajería
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6", // ID de la aplicación
    measurementId: "G-M3JLBLZX7R" // ID para medición de analíticas (opcional)
};

// Inicializar Firebase con la configuración anterior
const app = initializeApp(firebaseConfig);
// Inicializar analíticas de Firebase
const analytics = getAnalytics(app);
// Seleccionar el botón de envío del formulario
const submit = document.getElementById('submit');
// Agregar un evento 'click' al botón de envío
submit.addEventListener("click", function (event) {
    event.preventDefault()// Evitar el envío predeterminado del formulario
    // Obtener la instancia de autenticación de Firebase
    const auth = getAuth();
    // Capturar los valores del formulario (correo y contraseña)
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Crear un objeto `FormData` para enviar los datos al backend (PHP)
    const datos = new FormData();
    datos.append('email', email); // Agregar el correo al formulario
    datos.append('Contraseña', password);  // Agregar la contraseña al formulario

    // Enviar los datos al archivo PHP que valida en la base de datos (log.php)
    fetch('../BACKEND/log.php', {
        method: 'POST', // Método POST para enviar los datos
        body: datos // Enviar los datos encapsulados en `FormData`
    })
        .then(Response => {
            // Validar si la respuesta del servidor fue exitosa
            if (Response.ok) {
                return Response.text(); // Convertir la respuesta en texto
            } else {
                throw new Error('Error en la respuesta del servidor');


            }
        })
        .then(data => {
            // Imprimir en consola los datos recibidos desde el backend
            console.log(data);
            // Usar Firebase para iniciar sesión con correo y contraseña
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Si el inicio de sesión es exitoso, obtener el usuario 
                    const user = userCredential.user;
                    // Verificar si el correo del usuario está verificado
                    if (user.emailVerified) {
                        // Si está verificado, redirigir al usuario a la página inicial
                        window.location.href = "../HTML/pInicial.html";
                    } else {
                        // Mostrar un mensaje si el correo no está verificado
                        alert("Correo no verificado. Por favor, verifica tu correo.")
                    }
                })
                .catch((error) => {
                    // Manejo de errores al iniciar sesión con Firebase
                    const errorCode = error.code; // Código del error
                    const errorMessage = error.message; // Mensaje descriptivo del error
                    alert("Hubo un error al intentar iniciar sesión.") // Mostrar mensaje de error al usuario
                });
        })
        .catch(error => {
            // Manejo de errores en la solicitud al servidor
            alert("error" + error)

        });
})


//boton para descargar la apk
const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener("click", function (event) {
    const fileUrl = 'http://34.224.27.117/UneTT.apk';

    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = fileUrl; // Establecer la URL del archivo
    link.download = ''; // Este atributo sugiere descargar el archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Eliminar el enlace después de usarlo


})