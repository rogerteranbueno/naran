const DB_NAME = 'naran-offline-db';
const STORE_NAME = 'pending-logs';
const DB_VERSION = 1;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLogOffline(logData) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({ ...logData, savedAt: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingLogs() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function removePendingLog(localId) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(localId);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncPendingLogs(entitiesClient) {
  const logs = await getPendingLogs();
  if (logs.length === 0) return 0;
  let synced = 0;
  for (const log of logs) {
    try {
      await entitiesClient.ConflictLog.create({
        user_email: log.user_email || '',
        original_text: log.original_text,
        cognitive_note: log.cognitive_note,
        reframe_message: log.reframe_message,
        action_taken: log.action_taken,
        status: 'pending',
      });
      await removePendingLog(log.localId);
      synced++;
    } catch {
      // Will retry next time
    }
  }
  return synced;
}