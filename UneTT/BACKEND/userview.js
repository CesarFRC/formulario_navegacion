// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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



// ver si el usuario esta verificado
auth.onAuthStateChanged((user) => {
    if (user) {
        //si el usuario este verificado va obtener el correo con el que se registro
        const email = user.email; // Obtiene el correo del usuario
        // Guarda el correo en una variable
        let userEmail = email;




        let matricula = userEmail.substring(0, 8); //obtner la matricula del correo consultado

        /*va a realizar una consulta a la base de datos mysql para obtener el usuario,biografia y fecha dependiendo del correo electronico 
        SELECT UserName,biografia,fecha from user where Correo = 'UserEmail'*/

        fetch('../BACKEND/viewperfileuser.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'email': userEmail
            })
        })
            .then(response => response.text()) // Obtener la respuesta como texto
            .then(data => {
                
                if (data.startsWith("Usuario no encontrado") || data.startsWith("Error") || data.startsWith("Email no proporcionado")) {
                    alert(data); // Mostrar el mensaje de error en la consola
                } else {

                    const resultados = data.split("\n");
                    let username = resultados[0];
                    let biografia = resultados.length > 1 ? resultados[1] : 'No biografia';
                    let fecha = resultados.length > 2 ? resultados[2] : 'No fecha';

                    
                    document.getElementById('name').textContent = username;
                    document.getElementById('correoelectronico').value = userEmail;
                    document.getElementById('matricula').value = matricula;
                    document.getElementById('bio').value = biografia;
                    document.getElementById('fecha').value = fecha; 

                }
            })
            .catch(error => {
                alert('Error:' + error); // Manejar cualquier error en la solicitud
            });


    }
});