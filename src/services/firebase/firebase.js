import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyBBTsaEtcVUKjp_dBSB9_C3zhuD37WWZ_I",
  authDomain: "meow-87eb6.firebaseapp.com",
  projectId: "meow-87eb6",
  storageBucket: "meow-87eb6.appspot.com",
  messagingSenderId: "616536020154",
  appId: "1:616536020154:web:9890e943db2df02115de83",
  measurementId: "G-BXQZTNRD2W"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const ggProvider = new firebase.auth.GoogleAuthProvider();

export { auth, ggProvider, db }