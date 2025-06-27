export interface IElectronAPI {
  openFile: () => Promise<Electron.OpenDialogReturnValue>;
  saveFile: () => Promise<Electron.SaveDialogReturnValue>;
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}