import { firebaseConfig } from "../firebase-config.js";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { model } from "../model/index.js";
import { view } from "../view/index.js";
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
        model.auth = "authorized";

        const authBtn = selectorChecker(document, ".auth") as HTMLButtonElement;
        authBtn.dataset.content = model.auth;
        authBtn.innerHTML = `${model.auth}${
          model.auth === "authorized" ? `: ${model.userName}` : ""
        }`;
        authBtn.disabled = true;
        view.start.setContinueButtonState();
      })
      .catch((e) => console.error(e));
  }
}

export const firebase = new Firebase(auth, provider);
