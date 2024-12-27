import GUI from "lil-gui";
import { World } from "../../World";
import { logger, LogLevels, logLevels } from "/app/logger";

export function createSettingsPanel(world: World) {
  const _panel = new GUI({ closeFolders: true });

  const _settings = {
    "start loop": () => world.start(),
    "stop loop": () => world.stop(),
    "stadium visible": true,
    "log level": "DEBUG"
  };

  createFolders(_panel, _settings);

  world.stadiumVisible(_settings["stadium visible"]);

  return _panel;

  // ****************************************************************************************

  function createFolders(panel: GUI, settings: typeof _settings) {
    const generalFolder = panel.addFolder("General");
    generalFolder
      .add(settings, "log level", logLevels)
      .onChange((level: LogLevels) => logger.setLevel(level));

    const pausingFolder = panel.addFolder("Start/Stop");
    pausingFolder.add(settings, "start loop");
    pausingFolder.add(settings, "stop loop");

    const sceneFolder = panel.addFolder("Scene");
    sceneFolder
      .add(settings, "stadium visible")
      .onChange((v: boolean) => world.stadiumVisible(v));

    //panel.onChange((c) => console.log("panel.onChange", c));

    // pausingFolder.open();
    panel.open();
  }
}
