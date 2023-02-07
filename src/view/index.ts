import { StartView } from "./startView.js";
import { SettingsView } from "./settingsView.js";
import { WinView } from "./winView.js";

export class View {
  start: StartView;
  settings: SettingsView;
  win: WinView;
  constructor(start: StartView, settings: SettingsView, win: WinView) {
    this.start = start;
    this.settings = settings;
    this.win = win;
  }
}

export const view = new View(new StartView(), new SettingsView(), new WinView());
