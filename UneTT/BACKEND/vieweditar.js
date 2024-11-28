// Importa e inicializa Firebase App y Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAloGZG6lewuNahVlw5HJSwl2KSljDhq9U", // Clave de API para interactuar con Firebase
    authDomain: "unett-4074c.firebaseapp.com",  // Dominio autorizado para la autenticación
    projectId: "unett-4074c", // ID del proyecto Firebase
    storageBucket: "unett-4074c.appspot.com",  // Almacenamiento para archivos del proyecto 
    messagingSenderId: "401481887315",  // ID para mensajería de Firebase
    appId: "1:401481887315:web:fb8ff023da1ddb427020a6", // Identificador único de la aplicación
    measurementId: "G-M3JLBLZX7R" // ID para mediciones (Analytics)
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
            const email = user.email; // Obtiene el correo electrónico del usuario autenticado
            const matricula = email.substring(0, 8); // Extrae la matrícula del correo (primeros 8 caracteres)

            // Cargar datos del perfil desde el backend
            fetch('../BACKEND/viewperfileuser.php', {
                method: 'POST',  // Método de solicitud HTTP
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',  // Especifica que los datos se envían en formato URL codificado
                },
                body: new URLSearchParams({ 'email': email }) // Envía el correo del usuario al servidor
            })
            .then(response => response.text()) // Convierte la respuesta del servidor a texto
            .then(data => {
                const resultados = data.split("\n");  // Divide los datos en líneas
                // Si los datos están completos, los muestra en los campos correspondientes
                if (resultados.length >= 3) {
                    document.getElementById('name').value = resultados[0]; // Nombre de usuario
                    document.getElementById('bio').value = resultados[1]; // Biografía
                    document.getElementById('fecha').value = resultados[2]; // Fecha de creación
                    document.getElementById('correoelectronico').value = email; // Email
                    document.getElementById('matricula').value = matricula; // Matrícula
                }
            })
            .catch(error => console.error("Error al cargar el perfil:", error)); //mensaje de error al cargar los datos 
            
            // Manejo de actualización del perfil y contraseña
            document.getElementById('updateProfil').addEventListener('submit', (event) => {
                event.preventDefault(); // Evita el envío del formulario por defecto

                const newUsername = document.getElementById('name').value; // Nuevo nombre de usuario
                const newPassword = document.getElementById('password').value; // Nueva contraseña
                const newBio = document.getElementById('bio').value; // Nueva biografía

                // Llamada para actualizar el perfil en el backend
                fetch('../BACKEND/updateProfile.php', {
                    method: 'POST', // Método de solicitud HTTP
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded', // Especifica que los datos se envían en formato URL codificado
                    },
                    body: new URLSearchParams({
                        'correoelectronico': email, // Correo del usuario para identificar el perfil
                        'username': newUsername, // Nuevo nombre de usuario
                        'password': newPassword, // Nueva contraseña
                        'bio': newBio // Nueva biografía
                    })
                })
                .then(response => response.text()) // Convierte la respuesta del backend a texto
                .then(data => {
                    console.log(data); // Muestra la respuesta del backend en la consola
                    // Solicita la contraseña actual para la reautenticación
                    const currentPassword = prompt("Por favor, ingresa tu contraseña actual para actualizar los datos:");
                    // Crea las credenciales para reautenticar al usuario
                    if (currentPassword) {
                        const credential = EmailAuthProvider.credential(user.email, currentPassword);

                // Realiza la reautenticación del usuario con las credenciales proporcionadas
                        reauthenticateWithCredential(user, credential)
                            .then(() => {
                     // Si la reautenticación es exitosa, actualiza la contraseña
                                updatePassword(user, newPassword)
                                    .then(() => {
                                        window.location.href = "../HTML/ver_perfil.html"; // Redirige al perfil después de la actualización
                                    })
                                    .catch((error) => {
                                        alert("Error al actualizar los datos " + error.message); // Muestra error si falla la actualización
                                    });
                            })
                            .catch((error) => {
                                alert("Error al reautenticar: " + error.message); // Muestra error si la reautenticación falla
                            });
                    } else {
                        alert("La contraseña actual es necesaria para actualizar tus datos");  // Si no se ingresa la contraseña actual
                    }
                })
                .catch(error => {
                    alert("Error al actualizar perfil: " + error.message); // Muestra error si falla la actualización del perfil
                });
            });
        } 
    });
});


