// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();

// Check if user is authenticated
auth.onAuthStateChanged((user) => {
    if (user) {
        const email = user.email;
        let matricula = email.substring(0, 8); // Extract matricula from email

        fetch('../BACKEND/viewperfileuser.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'email': email
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
                localStorage.setItem("email", email);
                localStorage.setItem("matricula", matricula);

                // Display data on the current page
                document.getElementById('name').textContent = username;
                document.getElementById('correoelectronico').value = email;
                document.getElementById('matricula').value = matricula;
                document.getElementById('bio').value = biografia;
                document.getElementById('fecha').value = fecha;
            }
        })
        .catch(error => {
            alert('Error:' + error); // Handle any request errors
        });
    }
});
