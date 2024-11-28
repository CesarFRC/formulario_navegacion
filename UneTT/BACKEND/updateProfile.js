// Inicializar Firebase con la configuración de la app
const app = initializeApp(firebaseConfig);
// Obtener la instancia de autenticación de Firebase
const auth = getAuth();
// Evento que se dispara cuando el DOM ha sido cargado completamente
document.addEventListener("DOMContentLoaded", () => {
        // Verifica si hay un usuario autenticado

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Si hay un usuario, obtiene su correo electrónico
            const email = user.email; // Obtiene el correo del usuario
            let userEmail = email;
            let matricula = userEmail.substring(0, 8);  // Extrae la matrícula del correo electrónico (los primeros 8 caracteres)

            // Realiza una solicitud al servidor para obtener los datos del usuario
            fetch('../BACKEND/viewperfileuser.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',  // Tipo de contenido para la solicitud
                },
                body: new URLSearchParams({
                    'email': userEmail // Envía el correo del usuario como parámetro
                })
            })
            .then(response => response.text()) // Convierte la respuesta a texto
            .then(data => {
                 // Divide los datos recibidos por líneas
                const resultados = data.split("\n");
                // Asigna los valores recibidos a variables
                if (resultados.length >= 3) {
                    let username = resultados[0]; // Asigna el nombre de usuario
                    let biografia = resultados[1]; // Asigna la biografía
                    let fecha = resultados[2]; // Asigna la fecha de creación

                    // Actualiza el DOM con los datos del usuario
                    document.getElementById('name').value = username; // Nombre de usuario
                    document.getElementById('bio').value = biografia; // Biografía
                    document.getElementById('fecha').value = fecha; // Fecha de creación
                    document.getElementById('correoelectronico').value = userEmail; // Email
                    document.getElementById('matricula').value = matricula; // Matrícula

                    // Guardar información en localStorage si es necesario
                    localStorage.setItem("userName", username);
                } else {
                    // Muestra un mensaje si el usuario no fue encontrado
                    alert("Usuario no encontrado.");
                }
            })
            .catch(error => {
                 // Manejo de errores en la solicitud
                console.error("Error:", error);
                alert("Hubo un error al cargar la información.");
            });

            // Maneja el evento de envío del formulario de perfil
            document.getElementById('perfilForm').addEventListener('submit', (event) => {
                event.preventDefault(); // Previene el comportamiento predeterminado del formulario
                const newUsername = document.getElementById('name').value.trim();  // Nuevo nombre de usuario
                const newBiografia = document.getElementById('bio').value.trim(); // Nueva biografía
                const newPassword = document.querySelector('input[name="password"]').value.trim(); // Nueva contraseña

                // Valida que al menos un campo esté lleno antes de enviar
                if (!newUsername && !newBiografia && !newPassword) {
                    alert("Por favor, completa al menos un campo para actualizar.");
                    return;
                }

                // Envía los datos actualizados al servidor
                fetch('../BACKEND/updateProfile.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'email': userEmail, // Correo para la actualización
                        'username': newUsername, // Nuevo nombre de usuario
                        'bio': newBiografia, // Nueva biografía
                        'password': newPassword // Nueva contraseña
                    })
                })
                .then(response => response.text()) // Convierte la respuesta a texto
                .then(data => {
                    alert(data); // Muestra el mensaje de respuesta del servidor
                    // Redirigir a la página de ver perfil
                    if (data.includes("Perfil actualizado correctamente.")) {
                        window.location.href = '../HTML/ver_perfil.html'; // Cambia a la URL real de tu página de perfil
                    }
                })
                .catch(error => {
                    // Manejo de errores en la solicitud
                    console.error("Error:", error);
                    alert("Hubo un error al actualizar los datos.");
                });
            });
        }
    });
});
