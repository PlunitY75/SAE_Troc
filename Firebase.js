import firebase from "firebase/compat";
import 'firebase/auth';
import 'firebase/compat/database';


// ... (importez d'autres modules Firebase dont vous avez besoin)

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQrjAyNRNIHkTd6zlk5wr1wU-OcMIfZaI",
    authDomain: "sae-troc.firebaseapp.com",
    databaseURL: "https://sae-troc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sae-troc",
    storageBucket: "sae-troc.firebasestorage.app",
    messagingSenderId: "972919169380",
    appId: "1:972919169380:web:44fe91b72c3b0f8725da71"
};

// Initialisation de l'application Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app();
}

// Initialisation des services d'authentification et de base de données
const auth = firebase.auth();
const database = firebase.database();

// Configuration de l'authentification Google
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Exportation des services pour une utilisation dans d'autres fichiers
export { auth, database, googleProvider };