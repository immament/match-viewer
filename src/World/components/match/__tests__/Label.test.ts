import { Object3D, Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";
import { Label } from "../Label";

vi.mock("three");
vi.mock("three/examples/jsm/renderers/CSS2DRenderer.js");

describe("Label", () => {
  it("should initialize with default values", () => {
    const label = new Label();
    expect(label).toBeInstanceOf(Label);
  });

  it("should set position and text", () => {
    const position = new Vector3(1, 2, 3);
    const text = "Test Label";

    const label = new Label({ position, text });

    expect(label["_label"].position).toEqual(position);
    expect(label["_labelDiv"].textContent).toBe(text);
  });

  it("should add label to an object", () => {
    const object = new Object3D();

    const label = new Label();
    label.addTo(object);

    expect(object.add).lastCalledWith(label["_label"]);
  });

  it("should remove label from its parent", () => {
    const object = new Object3D();

    const label = new Label();
    label.addTo(object);
    label.remove();

    expect(object.remove).lastCalledWith(label["_label"]);
  });

  it("should update text content", () => {
    const newText = "Updated Text";

    const label = new Label();
    label.setText(newText);

    expect(label["_labelDiv"].textContent).toBe(newText);
  });
});
