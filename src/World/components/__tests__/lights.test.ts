import { describe, expect, test, vi } from "vitest";
import { createLights } from "../lights";
// import { threeMockSetup } from "/test-setup/three.mock.setup";

vi.mock("three");

describe("lights", () => {
  // beforeAll(() => {
  //   threeMockSetup({ lights: true });
  // });

  test("should create lights with default values", () => {
    const { lights } = createLights();

    expect(lights.length).gt(0);
  });

  test("should create lights with shadow", () => {
    const { lights } = createLights(true);

    expect(lights.length).gt(0);
  });
});
