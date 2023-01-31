import { MenuView } from "./view/menuView.js";
import { Model } from "./model/index.js";

class App {
  view: MenuView;
  model: Model;
  constructor(view: MenuView, model: Model) {
    this.view = view;
    this.model = model;
  }
}
