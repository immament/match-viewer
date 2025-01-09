import { beforeAll, describe, expect, test, vi } from "vitest";
import { createLabelRenderer, createRenderer } from "../renderer";
import { threeMockSetup } from "/test-setup/three.mock.setup";

vi.mock("three");
vi.mock("three/examples/jsm/renderers/CSS2DRenderer.js");

describe("renderer", () => {
  beforeAll(() => {
    threeMockSetup({ webGLRenderer: true, css2DRenderer: true });
  });

  test("create renderer", () => {
    const container = document.createElement("div");
    const renderer = createRenderer(container);
    expect(renderer).toBeTruthy();
    expect(container.children).length(1);
    expect(renderer.setSize).toHaveBeenCalledTimes(1);
  });

  test("create label renderer", () => {
    const container = document.createElement("div");
    // const label = new CSS2DRenderer();
    // const label2 = new CSS2DRenderer();
    // console.log("test CSS2DRenderer", CSS2DRenderer.prototype);
    // console.log(
    //   "labelRenderer",
    //   label.domElement ? "ok" : label.domElement,
    //   label.domElement === label.domElement,
    //   label.domElement === label2.domElement
    // );

    const renderer = createLabelRenderer(container);

    expect(renderer).toBeTruthy();
    // expect(container.children).length(1);
  });
});
