import { createWorld } from "./World/world.factory";
import "./style.css";

const DEBUG_MODE = true;

async function main() {
  const container = document.getElementById("app");

  if (!container) {
    throw new Error("Html element not found.");
  }
  const world = await createWorld(container, DEBUG_MODE);

  // start the animation loop
  world.start();
}

main();
// .catch((err) => {
//   console.error("main error:", err);
// });
