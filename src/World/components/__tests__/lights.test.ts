import { beforeAll, describe, expect, it, vi } from "vitest";
import { createLights } from "../lights";
import { threeMockSetup } from "/test-setup/three.mock.setup";

vi.mock("three");

describe("lights", () => {
  beforeAll(() => {
    threeMockSetup({ lights: true });
  });

  it("createLights", () => {
    const expected = { aspect: 3 };
    const { lights } = createLights();

    expect(lights).toBeDefined();
    expect(lights).length.gt(0);
  });
});
