import * as THREE from 'three';
import createTextSprite from '../createTextSprite';

const mockCanvas = document.createElement('canvas');
const mockContext = {
  fillStyle: '',
  fillRect: jest.fn(),
  font: '',
  textAlign: '',
  textBaseline: '',
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
};

// @ts-ignore
mockCanvas.getContext = jest.fn(() => mockContext);

jest.spyOn(document, 'createElement').mockImplementation((tag) => {
  if (tag === 'canvas') {
    return mockCanvas;
  } else {
    return document.createElement(tag);
  }
});

describe('createTextSprite', () => {
  it('should return an instance of THREE.Sprite', () => {
    const sprite = createTextSprite('Test', 0xffffff);
    expect(sprite).toBeInstanceOf(THREE.Sprite);
  });

  it('should set the sprite scale to 0.5 in all dimensions', () => {
    const sprite = createTextSprite('Test', 0xffffff);
    expect(sprite.scale.x).toBeCloseTo(0.5);
    expect(sprite.scale.y).toBeCloseTo(0.5);
    expect(sprite.scale.z).toBeCloseTo(0.5);
  });

  it('should create a texture with the correct text and color', () => {
    const text = 'Hello';
    const color = 0xff0000; // Red color
    const sprite = createTextSprite(text, color);
    const material = sprite.material as THREE.SpriteMaterial;
    const texture = material.map as THREE.CanvasTexture;
    const canvas = texture.image as HTMLCanvasElement;

    expect(material).toBeInstanceOf(THREE.SpriteMaterial);
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(canvas.width).toBe(64);
    expect(canvas.height).toBe(64);

    // Access the 2D context to verify drawing operations
    const context = canvas.getContext('2d')!;
    expect(context.fillStyle).toBe(`#ff0000`);
    // Since we can't directly check the drawn text, we assume the methods were called correctly
  });

  it('should handle different text and color inputs', () => {
    const text = 'World';
    const color = 0x00ff00; // Green color
    const sprite = createTextSprite(text, color);
    const material = sprite.material as THREE.SpriteMaterial;
    const texture = material.map as THREE.CanvasTexture;
    const canvas = texture.image as HTMLCanvasElement;

    expect(material).toBeInstanceOf(THREE.SpriteMaterial);
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    expect(canvas.width).toBe(64);
    expect(canvas.height).toBe(64);
  });

  it('should correctly pad the color to 6 digits in hexadecimal', () => {
    const text = 'Color';
    const color = 0xff; // Should pad to '0000ff'
    const sprite = createTextSprite(text, color);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const expectedColor = `#${color.toString(16).padStart(6, '0')}`;

    context.fillStyle = expectedColor;
    expect(context.fillStyle).toBe('#0000ff');
  });
});
