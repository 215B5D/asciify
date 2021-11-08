/**
 * @author false
 */

// Dependencies
import * as colors from "https://deno.land/std@0.77.0/fmt/colors.ts";
import { stringWidth } from "https://deno.land/x/gutenberg@0.1.5/unicode/width/mod.ts";

// Utils
import FileUtility from "./FileUtility.ts";

// Interfaces
interface IImageOptions {
  path: string;
  width: number;
  color?: boolean;
  characters: string | string[];
}

interface IRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
};

import { IDecoded } from "./FileUtility.ts";

// Types
type Image = IImageOptions;
type RGBA = IRGBA;

// ImageUtility Class
class ImageUtility {
  /**
   * Decodes an image into an array of strings which can be used to display it in the terminal.
   * 
   * @param {Image} imnage - Image object
   * @returns {Promise<string[]>} - Returns a promise that resolves to the image as an array of strings.
   */
  static getImageStrings = async (image: Image): Promise<string[]> => {
    const raw = await FileUtility.read(image.path);
    
    if(!FileUtility.getFileType(raw))
      throw "Invalid file type! (Supported: PNG, JPG, GIF)";

    const decoded: IDecoded = await FileUtility.decode(raw);

    let strings: string[] = [];

    const characterWidth = Math.ceil(decoded.width / image.width);

    for(let i = 0; i < decoded.frames; i++) {
      let output = "";

      for(let y = characterWidth; y <= decoded.height - characterWidth; y += characterWidth * 2) {
        for(let x = characterWidth / 2; x <= decoded.width - characterWidth / 2; x += 0) {
          const pixel = this.getPixel(decoded, Math.floor(x), Math.floor(y), i),
                grayscale = (pixel.r + pixel.g + pixel.b) / 3;

          if(typeof grayscale === "undefined")
            throw "Invalid image! (No grayscale)";
  
          const index = Math.floor(grayscale / 255 * (image.characters.length - 0.5));
  
          const char = image.color ? colors.rgb24(image.characters[index], pixel) : image.characters[index];
          
          output += char;
          x += characterWidth * stringWidth(char);
        }

        if (y < decoded.height - characterWidth)
          output += "\r\n";
      }

      strings.push(output)
    }

    return strings;
  }

  /**
   * Get the color of a pixel at a specific position.
   * 
   * @param {IDecodeD} decoded - The decoded file.
   * @param {number} x - The x position. 
   * @param {number} y - The y position. 
   * @param {number} index - The frame index.
   * @returns {RGBA} The color of the pixel.
   */
  static getPixel = (decoded: IDecoded, x: number, y: number, index: number): RGBA => {
    const data = decoded.buffer.subarray(index * decoded.size, (index + 1) * decoded.size),
          _index = x + (y * decoded.width);

    return {
      r: data[_index * 4],
      g: data[_index * 4 + 1],
      b: data[_index * 4 + 2],
      a: 255
    };
  }
}

export default ImageUtility;
