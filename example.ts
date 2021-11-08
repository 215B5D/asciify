/**
 * @author false
 */

// Utils
import { ImageUtility } from "./mod.ts";

ImageUtility.getImageStrings({
  path: "./img.gif",
  width: 70,
  characters: [ "#" ],
  color: true
}).then(strings => {
  const frames: number = strings.length === 1 ? 1 : strings.length * 1 + 1;

  for(let i = 0; i < frames; i++) {
    setTimeout(() => {
      console.clear();

      console.log(strings[i % strings.length]);
    }, i * 100);
  }
})