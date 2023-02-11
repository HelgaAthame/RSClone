import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import "./scoresView.scss";

export class ScoresView {
  async drawScores() {
    return `
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
        </table>
        `;
  }
}
