import { StartView } from "./startView.js";
import { SettingsView } from "./settingsView.js";

export class View {
  start: StartView;
  settings: SettingsView;
  constructor(start: StartView, settings: SettingsView) {
    this.start = start;
    this.settings = settings;
  }
}

export const view = new View(new StartView(), new SettingsView());
