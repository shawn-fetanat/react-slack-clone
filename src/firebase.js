import firebase from "firebase";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  authDomain: "react-slack-clone-5fb6e.firebaseapp.com",
  projectId: "react-slack-clone-5fb6e",
  storageBucket: "react-slack-clone-5fb6e.appspot.com",
  messagingSenderId: "925140682757",
  appId: "1:925140682757:web:344ba9b24094baec12f46c",
  measurementId: "G-JFJT7WHWBR",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, provider };
export default db;
