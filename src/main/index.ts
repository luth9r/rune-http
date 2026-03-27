import { app } from "electron";

import { makeAppWithSingleInstanceLock } from "lib/electron-app/factories/app/instance";
import { makeAppSetup } from "lib/electron-app/factories/app/setup";
import { loadReactDevtools } from "lib/electron-app/utils";
import { ENVIRONMENT } from "shared/constants";
import { MainWindow } from "./windows/main";
import { waitFor } from "shared/utils";
import { registerCollectionsIpc } from "./ipc/collections.ipc";
import { registerHttpIpc } from "./ipc/http.ipc";
import { registerStorageHandlers } from "./handlers/storage.handler";

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady();
  registerStorageHandlers();
  registerHttpIpc();
  registerCollectionsIpc();

  const window = await makeAppSetup(MainWindow);

  if (ENVIRONMENT.IS_DEV) {
    await loadReactDevtools();
    /* This trick is necessary to get the new
      React Developer Tools working at app initial load.
      Otherwise, it only works on manual reload.
    */
    window.webContents.once("devtools-opened", async () => {
      await waitFor(1000);
      window.webContents.reload();
    });
  }
});
