import { Model } from "./model/index.js";
import { View, view } from "./view/index.js";

class App {
  view: View;
  model: Model;
  constructor(view: View, model: Model) {
    this.view = view;
    this.model = model;
  }
}
export const app = new App(view, new Model());

//рендер главного экрана
app.view.start.renderUI();
