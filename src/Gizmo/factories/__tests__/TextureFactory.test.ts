import * as THREE from "three";
import { TextureFactory } from "../TextureFactory";
import { CUBE_CONSTANTS } from "../../constants";

// Mocking CUBE_CONSTANTS for testing purposes
jest.mock("../../constants", () => ({
  CUBE_CONSTANTS: {
    CANVAS_SIZE: 256,
    FONT_SIZE: "20px",
    TEXT_COLOR: "#000000",
    TEXT_ALIGN: "center",
    TEXT_BASELINE: "middle",
  },
}));

describe("TextureFactory", () => {
  it("should create a text texture with the correct properties", () => {
    // Arrange
    const inputText = "Test Text";
    const spyCreateElement = jest.spyOn(document, "createElement");
    const mockCanvas = document.createElement("canvas");

    const mockContext: Partial<CanvasRenderingContext2D> = {
      clearRect: jest.fn(),
      font: "",
      fillStyle: "",
      textAlign: undefined,
      textBaseline: undefined,
      fillText: jest.fn(),
    };

    jest
      .spyOn(mockCanvas, "getContext")
      .mockReturnValue(mockContext as CanvasRenderingContext2D);
    spyCreateElement.mockReturnValue(mockCanvas);

    // Act
    const texture = TextureFactory.createTextTexture(inputText);

    expect(texture).toBeInstanceOf(THREE.CanvasTexture);

    // Check that context methods were called with correct values
    expect(mockContext.clearRect).toHaveBeenCalledWith(
      0,
      0,
      CUBE_CONSTANTS.CANVAS_SIZE,
      CUBE_CONSTANTS.CANVAS_SIZE,
    );
    expect(mockContext.font).toBe(`${CUBE_CONSTANTS.FONT_SIZE} Arial`);
    expect(mockContext.fillStyle).toBe(CUBE_CONSTANTS.TEXT_COLOR);
    expect(mockContext.textAlign).toBe(CUBE_CONSTANTS.TEXT_ALIGN);
    expect(mockContext.textBaseline).toBe(CUBE_CONSTANTS.TEXT_BASELINE);
    expect(mockContext.fillText).toHaveBeenCalledWith(
      inputText,
      CUBE_CONSTANTS.CANVAS_SIZE / 2,
      CUBE_CONSTANTS.CANVAS_SIZE / 2,
    );

    // Cleanup
    spyCreateElement.mockRestore();
  });
});
