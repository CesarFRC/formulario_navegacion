// Importar las funciones necesarias desde los SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";


// Configuración de Firebase para la aplicación web
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U", // Clave de autenticación para Firebase
    authDomain: "unett-4074c.firebaseapp.com", // Dominio autorizado del proyecto
    databaseURL: "https://unett-4074c-default-rtdb.firebaseio.com", // URL de la base de datos (opcional)
    projectId: "unett-4074c", // ID único del proyecto
    storageBucket: "unett-4074c.appspot.com", // URL de almacenamiento de archivos
    messagingSenderId: "401481887315", // ID para mensajería en la nube
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6",  // ID de la aplicación Firebase
    measurementId: "G-M3JLBLZX7R"  // ID para análisis (opcional)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Inicializar Analytics para Firebase
const analytics = getAnalytics(app);
// Obtener la instancia del servicio de autenticación
const auth = getAuth();

// Seleccionar el botón de registro por su ID
const submit = document.getElementById('submit');
// Agregar un evento 'click' al botón para manejar el registro del usuario
submit.addEventListener("click", function (event) {
    event.preventDefault() // Prevenir el comportamiento predeterminado del botón
    // Verificar si el correo electrónico es institucional (de la universidad)
    let cadena = document.getElementById('email').value; // Obtener el correo ingresado
    let keywords = "@uttcampus.edu.mx";  // Dominio permitido

    if (cadena.includes(keywords)) {
// Si el correo es válido, continuar con el proceso de registro
// Obtener los valores de los campos del formulario
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;
        // Crear un nuevo usuario en Firebase Authentication
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Usuario creado exitosamente
                const user = userCredential.user;
                 // Enviar correo de verificación al usuario
                sendEmailVerification(user)
                    .then(() => {
                        alert("Correo de verificación enviado.")
                    })
                    .catch((error) => {
                        alert("Error al enviar el correo de verificación:", error)
                    });

                 // Enviar los datos del usuario a la base de datos MySQL    
                const datos = new FormData();
                datos.append('email', email);
                datos.append('username', username);
                datos.append('password', password);

                fetch('../BACKEND/insert_usuario.php', {
                    method: 'POST',
                    body: datos
                })
                    .then(Response => {
                        if (Response.ok) {
                            return Response.text(); // Procesar la respuesta como texto
                        } else {
                            throw new Error('Error en la respuesta del servidor');


                        }
                    })
                    .then(data => {
                        console.log(data); // Mostrar la respuesta del servidor en la consola
                        window.location.href = "../index.html"; // Redirigir al usuario a la página de inicio


                    })
                    .catch(error => {
                         // Manejar errores al crear el usuario
                        console.error('hubo un problema con la solicitud fetch', error);
                        alert("error" + error)

                    });




                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (errorCode === "auth/weak-password") {
                    // Caso: La contraseña es demasiado corta
                    alert("La contraseña es demasiado corta. Debe tener al menos 6 caracteres.");
                } else if (errorCode === "auth/email-already-in-use") {
                    // Caso: El correo ya está registrado
                    alert("El correo ya está registrado en otra cuenta.");
                } else {
                    // Otros errores
                    alert("Ocurrió un error. Por favor, intenta nuevamente.");
                }
                // ..
            });

    } else {
        // Si el correo no es institucional, mostrar un mensaje de error
        alert("el correo debe ser institucional")
    }




})

