// --- CYBERNAUTICA LOCAL STORAGE (IndexedDB) ---

const CYB_DB_NAME    = 'cybernautica_db';
const CYB_DB_VERSION = 1;
const STORE_DOS  = 'dossiers';
const STORE_CHAR = 'characters';

let _db = null;

// ── ОТКРЫТИЕ БД ──────────────────────────────────────────────────────────────
function openCybDB() {
    return new Promise((resolve, reject) => {
        if (_db) { resolve(_db); return; }

        const req = indexedDB.open(CYB_DB_NAME, CYB_DB_VERSION);

        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_DOS))
                db.createObjectStore(STORE_DOS,  { keyPath: 'id' });
            if (!db.objectStoreNames.contains(STORE_CHAR))
                db.createObjectStore(STORE_CHAR, { keyPath: 'id' });
        };

        req.onsuccess = e => { _db = e.target.result; resolve(_db); };
        req.onerror   = e => { console.error('CybDB open error:', e.target.error); reject(e.target.error); };
    });
}

// ── БАЗОВЫЕ ОПЕРАЦИИ ─────────────────────────────────────────────────────────
async function dbSave(storeName, data) {
    const db = await openCybDB();
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror    = e => { console.error('dbSave error:', e.target.error); reject(e.target.error); };
    });
}

async function dbGetAll(storeName) {
    const db = await openCybDB();
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror   = e => reject(e.target.error);
    });
}

async function dbDelete(storeName, id) {
    const db = await openCybDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror    = e => reject(e.target.error);
    });
}

async function dbClear(storeName) {
    const db = await openCybDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror    = e => reject(e.target.error);
    });
}

// ── ЗАГРУЗКА В ПАМЯТЬ ПРИ СТАРТЕ ─────────────────────────────────────────────
// Мёрджит записи из IndexedDB в глобальные массивы dossiers / characters.
// Записи из БД перекрывают хардкод по id.
async function loadAllFromDB() {
    try {
        const [savedDos, savedChar] = await Promise.all([
            dbGetAll(STORE_DOS),
            dbGetAll(STORE_CHAR)
        ]);

        // Досье
        if (savedDos.length > 0 && typeof dossiers !== 'undefined') {
            const ids = new Map(dossiers.map((d, i) => [d.id, i]));
            savedDos.forEach(d => {
                d._fromDB = true;
                if (ids.has(d.id)) {
                    dossiers[ids.get(d.id)] = d;
                } else {
                    dossiers.push(d);
                    ids.set(d.id, dossiers.length - 1);
                }
            });
        }

        // Персонажи
        if (savedChar.length > 0 && typeof characters !== 'undefined') {
            const ids = new Map(characters.map((c, i) => [c.id, i]));
            savedChar.forEach(c => {
                c._fromDB = true;
                if (ids.has(c.id)) {
                    characters[ids.get(c.id)] = c;
                } else {
                    characters.push(c);
                    ids.set(c.id, characters.length - 1);
                }
            });
        }

        return { dossiers: savedDos.length, characters: savedChar.length };
    } catch (e) {
        console.error('loadAllFromDB error:', e);
        return { dossiers: 0, characters: 0 };
    }
}

// ── УДАЛЕНИЕ + УБРАТЬ ИЗ ПАМЯТИ ──────────────────────────────────────────────
async function dbDeleteDossier(id) {
    await dbDelete(STORE_DOS, id);
    if (typeof dossiers !== 'undefined') {
        const idx = dossiers.findIndex(d => d.id === id);
        if (idx !== -1) dossiers.splice(idx, 1);
    }
}

async function dbDeleteCharacter(id) {
    await dbDelete(STORE_CHAR, id);
    if (typeof characters !== 'undefined') {
        const idx = characters.findIndex(c => c.id === id);
        if (idx !== -1) characters.splice(idx, 1);
    }
}

// ── ЭКСПОРТ ВСЕГО КАК JSON-ФАЙЛ ──────────────────────────────────────────────
async function dbExportAll() {
    const [dos, chars] = await Promise.all([
        dbGetAll(STORE_DOS),
        dbGetAll(STORE_CHAR)
    ]);

    // Убираем служебный флаг _fromDB перед экспортом
    const clean = arr => arr.map(o => { const c = {...o}; delete c._fromDB; return c; });

    const backup = {
        version: 1,
        exported_at: new Date().toISOString(),
        dossiers: clean(dos),
        characters: clean(chars)
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cybernautica_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── ИМПОРТ ИЗ JSON-ФАЙЛА ─────────────────────────────────────────────────────
async function dbImportFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async e => {
            try {
                const backup = JSON.parse(e.target.result);
                let countDos = 0, countChar = 0;

                if (Array.isArray(backup.dossiers)) {
                    for (const d of backup.dossiers) {
                        await dbSave(STORE_DOS, d);
                        countDos++;
                    }
                }
                if (Array.isArray(backup.characters)) {
                    for (const c of backup.characters) {
                        await dbSave(STORE_CHAR, c);
                        countChar++;
                    }
                }

                await loadAllFromDB();
                resolve({ dossiers: countDos, characters: countChar });
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsText(file);
    });
}
