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
  padding?: boolean;
}

interface IRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
};

interface IDimensions {
  width: number;
  height: number,
  area: number
};

import { IDecoded } from "./FileUtility.ts";

// Types
type Image = IImageOptions;
type RGBA = IRGBA;
type Dimensions = IDimensions;

// Constants
const ESCAPE_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g; // Thanks: https://stackoverflow.com/a/29497680

// ImageUtility Class
class ImageUtility {
  // Class Variables
  public image: Image;

  public raw: Uint8Array | undefined;
  public decoded: IDecoded | undefined;

  constructor(image: Image) {
    this.image = image;

    this.raw;
    this.decoded;
  }

  /**
   * Loads the image into memory
   * TODO: Add URL suppport here
   * 
   * @returns {Promise<void} - Returns a promise that resolves when the image is loaded
   */
  load = async (): Promise<void> => {
    this.raw = await Deno.readFile(this.image.path);

    if(!FileUtility.getFileType(this.raw))
      throw "Invalid file type! (Supported: PNG, JPG, GIF)";

    this.decoded = await FileUtility.decode(this.raw);
  }

  /**
   * Calculates the dimensions of a string
   * 
   * @param {string} string - The string to calculate the dimensions of
   * @returns {Dimensions} - Returns the dimensions of the string
   */
  calculateDimensions = (str: string): Dimensions => {
    const stripped: string[] = str.split("\n").map(string => string.replace(ESCAPE_REGEX, ""));
    
    const width: number = stripped[0].length;
    const height = stripped.length;

    return {
      width,
      height,
      area: width * height
    }
  }

  /**
   * Decodes an image into an array of strings which can be used to display it in the terminal.
   * 
   * @param {Image} imnage - Image object
   * @returns {Promise<string[]>} - Returns a promise that resolves to the image as an array of strings.
   */
  getImageStrings = (): string[] => {
    if(!this.raw || !this.decoded)
      throw "Please call `load()` before attempting to fetch strings!";
  
    const strings: string[] = [];

    const characterWidth = Math.ceil(this.decoded.width / this.image.width);

    for(let i = 0; i < this.decoded.frames; i++) {
      let output = "";

      for(let y = characterWidth; y <= this.decoded.height - characterWidth; y += characterWidth * 2) {
        for(let x = characterWidth / 2; x <= this.decoded.width - characterWidth / 2; x += 0) {
          const pixel = this.getPixel(Math.floor(x), Math.floor(y), i),
                grayscale = (pixel.r + pixel.g + pixel.b) / 3;

          if(typeof grayscale === "undefined")
            throw "Invalid image! (No grayscale)";
  
          const index = Math.floor(grayscale / 255 * (this.image.characters.length - 0.5));
  
          const char = this.image.color ? colors.rgb24(this.image.characters[index], pixel) : this.image.characters[index];
          
          output += char;
          x += characterWidth * stringWidth(char);
        }

        if (y < this.decoded.height - characterWidth)
          output += "\r\n";
      }

      strings.push(output)
    }

    if(this.image.padding)
      strings[strings.length - 1] += "\r\n";

    return strings;
  }

  /**
   * Get the color of a pixel at a specific position.
   * 
   * @private
   * @param {number} x - The x position. 
   * @param {number} y - The y position. 
   * @param {number} index - The frame index.
   * @returns {RGBA} The color of the pixel.
   */
  getPixel = (x: number, y: number, index: number): RGBA => {
    if(!this.raw || !this.decoded)
      throw "Please call `load()` before attempting to get a pixel!";

    const data = this.decoded.buffer.subarray(index * this.decoded.size, (index + 1) * this.decoded.size),
          _index = x + (y * this.decoded.width);

    return {
      r: data[_index * 4],
      g: data[_index * 4 + 1],
      b: data[_index * 4 + 2],
      a: 255
    };
  }
}

export default ImageUtility;
