import { StartView } from "./startView.js";
import { SettingsView } from "./settingsView.js";
import { WinView } from "./winView.js";
import { ScoresView } from "./scoresView.js";

export class View {
  start: StartView;
  settings: SettingsView;
  win: WinView;
  scores: ScoresView;
  constructor(
    start: StartView,
    settings: SettingsView,
    win: WinView,
    scores: ScoresView
  ) {
    this.start = start;
    this.settings = settings;
    this.win = win;
    this.scores = scores;
  }
}

export const view = new View(
  new StartView(),
  new SettingsView(),
  new WinView(),
  new ScoresView()
);
