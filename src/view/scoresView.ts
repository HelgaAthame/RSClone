import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import "./scoresView.scss";

export class ScoresView {
  async renderUI() {
    const main = selectorChecker(document, "main");
    main.innerHTML = `
        <table>
            <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Score</th>
            </tr>


            <tr>
                <td>1</td>
                <td>Olga</td>
                <td>1000</td>
            </tr>
            <tr>
                <td>2</td>
                <td>GLeb</td>
                <td>200</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>4</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>5</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>6</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>7</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>8</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>9</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
            <tr>
                <td>10</td>
                <td>Alex</td>
                <td>500</td>
            </tr>
        </table>
        `;
  }

  async getScores() {}
}
