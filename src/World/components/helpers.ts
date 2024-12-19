import { AxesHelper, GridHelper } from "three";

export function createAxesHelper() {
  const helper = new AxesHelper(2);
  helper.position.set(-1, 0, -1);
  return helper;
}

export function createGridHelper() {
  const helper = new GridHelper(100, 20);
  return helper;
}
