import * as THREE from 'three';
import { CUBE_CONSTANTS } from '../utils/constants';

export class TextureFactory {
  static createTextTexture(text: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = CUBE_CONSTANTS.CANVAS_SIZE;
    canvas.height = CUBE_CONSTANTS.CANVAS_SIZE;

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = `${CUBE_CONSTANTS.FONT_SIZE} Arial`;
      context.fillStyle = CUBE_CONSTANTS.TEXT_COLOR;
      context.textAlign = CUBE_CONSTANTS.TEXT_ALIGN as CanvasTextAlign;
      context.textBaseline = CUBE_CONSTANTS.TEXT_BASELINE as CanvasTextBaseline;
      context.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
}
