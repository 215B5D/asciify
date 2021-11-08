/**
 * @author false
 */

// Dependencies
import { GifReader } from "https://cdn.skypack.dev/omggif";

// Interface
interface IDecoded {
  buffer: Uint8Array;
  width: number;
  height: number;
  frames: number;
  size: number;
}

// Types
type Signature = {
  [ key: string ]: number[][];
};

// FileUtility Class
class FileUtility {
  /**
   * Attempts to read a file from the given path.
   * 
   * @param {string} path - The path to the file.
   * @returns {Promise<Uint8Array} - The file's contents.
   */
  static read = async (path: string): Promise<Uint8Array> => await Deno.readFile(path);

  /**
   * Attempt to find the type of file from the given signature.
   * 
   * @param {Uint8Array} raw - The raw file contents.
   * @returns {string | null} - The file's type (png / jpg / gif / null).
   */
   static getFileType = (raw: Uint8Array): string | null => {
    const signatures: Signature = {
      png: [
        [ 0x89, 0x50, 0x4e, 0x47, 0xd, 0xa, 0x1a, 0xa, 0x0, 0x0, 0x0, 0xd, 0x49, 0x48, 0x44, 0x52 ]
      ],
      jpg: [
        [ 0xff, 0xd8, 0xff, 0xdb ],
        [ 0xff, 0xd8, 0xff, 0xe0, 0x0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x0, 0x1 ],
        [ 0xff, 0xd8, 0xff, 0xee ],
        [ 0xff, 0xd8, 0xff, 0xe1 ]
      ],
      gif: [
        [ 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 ],
        [ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 ]
      ]
    };

    for(const type in signatures)
      for(const sig of signatures[type])
        if(this.matchSignature(raw, sig))
          return type;

    return null;
  }

  /**
   * Check if the file matches the given signature.
   * 
   * @param {Uint8Array} raw - The raw file contents.
   * @param {number[]} signature - The signature to check against.
   * @returns {boolean} - Whether the file matches the signature.
   */
   static matchSignature = (raw: Uint8Array, signature: number[]): boolean => {
    if(raw.slice(0, signature.length).toString() === signature.toString())
      return true;

    return false;
  }

  /**
   * Decode a Uint8Array into a buffer
   * 
   * @param {Uint8Array} raw - The raw file contents.
   * @returns {IDecoded} - The decoded file.
   */
  static decode = (raw: Uint8Array): IDecoded => {
    // TODO: Add support for PNG / JPG

    return this.decodeGif(raw);
  }

  /**
   * Decode a gif into a buffer.
   * 
   * @param {Uint8Array} raw - The raw file contents.
   * @returns {IDecodeD} - The decoded gif.
   */
  static decodeGif = (raw: Uint8Array): IDecoded => {
    const reader = new GifReader(raw);

    const size: number = reader.width * reader.height * 4,
          frames: number = reader.numFrames();

    const buffer: Uint8Array = new Uint8Array(frames * size);

    for(let i = 0; i < frames; i++) {
      const data = buffer.subarray(i * size, (i + 1) * size);

      reader.decodeAndBlitFrameRGBA(i, data);

      for(let x = 3; x < data.length; x += 4) {
        if(data[x] !== 0)
          continue;
      
        for(let z = 0; z < 4; z++) 
          data[x - z] = data[(i - 1) * size + x - z];
      }
    }

    return {
      buffer,
      width: reader.width,
      height: reader.height,
      frames,
      size
    };
  }
}

export type { IDecoded };
export default FileUtility;