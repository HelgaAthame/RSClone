import selectorChecker from "../utils/selectorChecker.js";

export class Model {
  constructor () {
    this._isMuted = false;
    this._volume = 0.5;
  }
  _isMuted: Boolean;
  _volume: Number;

  set isMuted (val: Boolean) {
    this._isMuted = val;

    const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const muteButton = selectorChecker(document, '.setting__sound-mute');
    const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;

    muteButton.innerHTML = muteButton.innerHTML === '🔇' ? '🔈' : '🔇';
    inputRange.value =  muteButton.innerHTML === '🔇' ? '1' : '0';
    bgAudio.volume = Number(inputRange.value);
    //TODO добавить в БД
  }
  get isMuted ():Boolean {
    //TODO взять значение из БД если оно есть
    return this._isMuted;
  }

  set volume (val: Number) {
    this._volume = val;

    const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const muteButton = selectorChecker(document, '.setting__sound-mute');
    const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
    muteButton.innerHTML = inputRange.value === '0' ? '🔈' : '🔇';
    bgAudio.volume = Number(inputRange.value);
    //todo сохранять в БД
  }
  get volume () {
    //TODO взять из БД
    return this._volume;
  }
}

export const model = new Model();
