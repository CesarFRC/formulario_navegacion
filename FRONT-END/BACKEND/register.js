// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
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


//submit button
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
    event.preventDefault()
    //inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    alert(5)
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            alert("Registrado correctamente")
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage)
            // ..
        });

})