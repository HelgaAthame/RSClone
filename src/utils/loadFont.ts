interface FFS extends FontFaceSet {
  add?: ((loaded: FontFace) => any) | undefined;
}

export default function loadFont(name: string, url: string) {
    const newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        const DF: FFS = document.fonts;
        if (DF.add !== undefined) {
          DF.add(loaded);
        }
        //document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
  }
