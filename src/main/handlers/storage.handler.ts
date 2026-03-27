import { ipcMain, app } from "electron";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = app.getPath("userData");

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readFile<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath(name), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeFile(name: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

export function registerStorageHandlers() {
  ipcMain.handle(
    "storage:read",
    async (_e, name: string, fallback: unknown) => {
      return readFile(name, fallback);
    },
  );

  ipcMain.handle("storage:write", async (_e, name: string, data: unknown) => {
    await writeFile(name, data);
  });
}
