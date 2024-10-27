// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

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
                const newUsername = document.getElementById('name').value.trim();
                const newBiografia = document.getElementById('bio').value.trim();
                const newPassword = document.querySelector('input[name="password"]').value.trim();

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
                        'email': userEmail, // Correo para la actualización
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
                        window.location.href = '../HTML/ver_perfil.html'; // Cambia a la URL real de tu página de perfil
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
