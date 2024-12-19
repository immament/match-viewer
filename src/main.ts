import { World } from "./World/World";
import "./style.css";

async function main() {
  const container = document.getElementById("app");

  if (!container) {
    throw new Error("Html element not found.");
  }

  const world = new World(container);

  await world.init();

  // start the animation loop
  world.start();
}

main();
// .catch((err) => {
//   console.error("main error:", err);
// });
