import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import { db } from "../firebase-config.js";
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import "./scoresView.scss";

export class ScoresView {
  async renderUI() {
    const main = selectorChecker(document, "main");

    const userDataRow = (await this.getUsers()).map((user, index) => {
      return `            
        <tr>
            <td>${index + 1}</td>
            <td>${user.uid}</td>
            <td>${user.score}</td>
        </tr>`;
    });
    main.innerHTML = `
        <table>
            <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Score</th>
            </tr>
            ${userDataRow.join("\n")}

        </table>
        `;
  }

  async getUsers() {
    const usersDoc = await getDocs(collection(db, "users"));
    const userData: DocumentData[] = [];
    usersDoc.forEach((doc) => {
      userData.push(doc.data());
    });

    const userDataSortedByScore = userData.sort((a, b) => -(a.score - b.score));
    return userDataSortedByScore;
  }
}
