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





//sumbit button 
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
    event.preventDefault()

    const auth = getAuth();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    //hacer una consulta a mysql para ver si los daton ingresados estan correcos
    const datos = new FormData();
    datos.append('email', email);
    datos.append('Contraseña', password);

    fetch('../BACKEND/log.php', {
        method: 'POST',
        body: datos
    })
        .then(Response => {
            if (Response.ok) {
                return Response.text();
            } else {
                throw new Error('Error en la respuesta del servidor');


            }
        })
        .then(data => {
            console.log(data);
            signInWithEmailAndPassword(auth, email,password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;


                    if (user.emailVerified) {
                        alert("se inicio session correctamente")
                        window.location.href = "../HTML/pInicial.html";
                    } else {
                        alert("Correo no verificado. Por favor, verifica tu correo.")
                    }
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(errorMessage)
                    alert(errorCode)
                });
        })
        .catch(error => {
            console.error('hubo un problema con la solicitud fetch', error);
            alert("error" + error)

        });





})