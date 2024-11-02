const useremail = localStorage.getItem("perfilemail")
let matricula = email.substring(0, 8);

fetch('../BACKEND/viewperfileuser.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        'email': useremail
    })
})
.then(response => response.text())
.then(data => {
    if (data.startsWith("Usuario no encontrado") || data.startsWith("Error") || data.startsWith("Email no proporcionado")) {
        alert(data); // Display error message if data is invalid
    } else {
        const resultados = data.split("\n");
        let username = resultados[0];
        let biografia = resultados.length > 1 ? resultados[1] : 'No biografia';
        let fecha = resultados.length > 2 ? resultados[2] : 'No fecha';

        // Store data in localStorage
        localStorage.setItem("userName", username);
        localStorage.setItem("bio", biografia);
        localStorage.setItem("fecha", fecha);
        localStorage.setItem("email", useremail);
        localStorage.setItem("matricula", matricula);

        // Display data on the current page
        document.getElementById('name').textContent = username;
        document.getElementById('correoelectronico').value = useremail;
        document.getElementById('matricula').value = matricula;
        document.getElementById('bio').value = biografia;
        document.getElementById('fecha').value = fecha;
    }
})
.catch(error => {
    alert('Error:' + error); // Handle any request errors
});