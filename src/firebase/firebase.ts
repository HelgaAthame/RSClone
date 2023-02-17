import { firebaseConfig } from "../firebase-config.js";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from "firebase/auth";
import {
  getFirestore
} from "firebase/firestore";

import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "it";

export const db = getFirestore(app);

class Firebase {
  auth: Auth;
  provider: GoogleAuthProvider;

  constructor(auth: Auth, provider: GoogleAuthProvider) {
    this.auth = auth;
    this.provider = provider;
  }

  googleAuth() {
    signInWithPopup(auth, provider)
      .then((result) => {

                const user = result.user;
        model.uid = user.uid;
        model.userName = user.displayName as string;
        model.saveUsernameToLocalStorage();
        localStorage.setItem("uid", user.uid);
        model.auth = 'authorized';

        const authBtn = selectorChecker(document, '.auth') as HTMLDivElement;
        console.log(authBtn);
        console.log('сработал then, меняем датасет ')
        authBtn.dataset.content = model.auth;
        console.log(`model.auth = ${model.auth}`)
        console.log(`authBtn.dataset.content = ${authBtn.dataset.content}`)
        authBtn.innerHTML = `${
          model.auth
        }${
          model.auth === 'authorized'
          ? `: ${model.userName}`
          : ''
        }`;
        authBtn.classList.remove('article');
      })
      .catch((/*error*/) => {
        // Handle Errors here.
        //const errorCode = error.code;
        //const errorMessage = error.message;
        // The email of the user's account used.
        //const email = error.customData.email;
        // The AuthCredential type that was used.
        //const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      })
  }
}

export const firebase = new Firebase(auth, provider);
