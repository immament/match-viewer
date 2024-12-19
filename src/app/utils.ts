export function round(val: number, precision = 2) {
  const v = Math.pow(10, precision);
  return Math.round(val * v) / v;
}
