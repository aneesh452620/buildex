const databaseName = "buildex-files";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("File storage is unavailable in this browser."));
    request.onblocked = () => reject(new Error("Close other Buildex tabs and try again."));
  });
}
async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", mode);
    const request = run(tx.objectStore("files"));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(new Error("File could not be saved or read. Check browser storage space.")); };
  });
}
export async function saveFile(id: string, file: File) { await transaction("readwrite", store => store.put(file, id)); }
export async function deleteFile(id: string) { await transaction("readwrite", store => store.delete(id)); }
export async function downloadFile(id: string, name: string) {
  const blob: unknown = await transaction("readonly", store => store.get(id));
  if (!(blob instanceof Blob)) throw new Error("This file is no longer available in this browser.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
