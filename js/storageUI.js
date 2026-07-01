// --- CYBERNAUTICA STORAGE MANAGEMENT UI ---

let _storageTab = 'dossiers'; // 'dossiers' | 'characters'

// ── ОТРИСОВКА СПИСКА ЗАПИСЕЙ ─────────────────────────────────────────────────
async function renderStorageList() {
    const list = document.getElementById('storage-records-list');
    const countEl = document.getElementById('storage-count');
    if (!list) return;

    list.innerHTML = `<div class="text-gray-600 text-xs font-mono-custom text-center py-6">[ ЗАГРУЗКА... ]</div>`;

    try {
        const storeName = _storageTab === 'dossiers' ? STORE_DOS : STORE_CHAR;
        const records   = await dbGetAll(storeName);

        if (countEl) countEl.innerText = records.length;

        if (records.length === 0) {
            list.innerHTML = `<div class="text-gray-600 text-xs font-mono-custom text-center py-8 border border-dashed border-gray-800">[ ХРАНИЛИЩЕ ПУСТО ]</div>`;
            return;
        }

        list.innerHTML = '';
        records.forEach(rec => {
            const name = rec.name || '—';
            const id   = rec.id   || '—';
            const date = rec.last_update || '—';
            const extra = _storageTab === 'dossiers'
                ? (rec.affiliation || rec.district || '')
                : ([rec.race, rec.charClass].filter(Boolean).join(' / '));

            const row = document.createElement('div');
            row.className = 'storage-record-row flex items-center gap-3 p-3 border border-gray-800 bg-black/30 hover:border-gray-600 transition-colors group';
            row.innerHTML = `
                <img src="${rec.photo || ''}" class="w-10 h-10 object-cover border border-gray-700 grayscale shrink-0" onerror="this.src='https://placehold.co/40x40/0a0a0c/444?text=?'">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] theme-text font-mono-custom opacity-60">${id}</span>
                        <span class="w-1 h-1 rounded-full bg-green-600 shrink-0" title="Из локального хранилища"></span>
                    </div>
                    <div class="font-bold text-gray-200 text-sm truncate">${name}</div>
                    <div class="text-[10px] text-gray-600 font-mono-custom truncate">${extra}</div>
                </div>
                <div class="shrink-0 text-right">
                    <div class="text-[9px] text-gray-700 font-mono-custom mb-1">${date}</div>
                    
                        <button class="btn-edit-record text-blue-700 hover:text-blue-400 text-[10px] font-mono-custom font-bold transition-colors mr-3" data-id="${id}">[ РЕДАКТИРОВАТЬ ]</button>
                    <button class="btn-delete-record text-red-800 hover:text-red-400 text-[10px] font-mono-custom font-bold transition-colors" data-id="${id}">[ УДАЛИТЬ ]</button>
                </div>
            `;

            row.querySelector('.btn-delete-record').addEventListener('click', async (e) => {
                e.stopPropagation();
                const recId = e.target.dataset.id;
                const confirmed = await showStorageConfirm(`Удалить запись «${name}» (${recId}) из хранилища?`);
                if (!confirmed) return;

                try {
                    if (_storageTab === 'dossiers') {
                        await dbDeleteDossier(recId);
                        renderCards();
                    } else {
                        await dbDeleteCharacter(recId);
                        renderCharacterCards();
                    }
                    playSound(sfx.click);
                    addSystemLog(`Запись ${recId} удалена из хранилища`);
                    renderStorageList();
                } catch (err) {
                    console.error('Delete error:', err);
                }
            });

            row.querySelector('.btn-edit-record').addEventListener('click', (e) => {
                e.stopPropagation();
                closeStorageModal(); // Скрываем окно хранилища

                if (_storageTab === 'dossiers') {
                    loadDossierToForm(rec);
                } else {
                    loadCharacterToForm(rec);
                }
            });

            list.appendChild(row);
        });
    } catch (err) {
        list.innerHTML = `<div class="text-red-800 text-xs font-mono-custom text-center py-6">[ ОШИБКА ЗАГРУЗКИ: ${err.message} ]</div>`;
    }
}

// ── ДИАЛОГ ПОДТВЕРЖДЕНИЯ ─────────────────────────────────────────────────────
function showStorageConfirm(message) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm';
        overlay.innerHTML = `
            <div class="bg-[#0a0a0c] border theme-border p-8 max-w-sm w-full mx-4 font-mono-custom shadow-2xl">
                <div class="text-red-500 text-[10px] uppercase tracking-widest mb-4">! ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ</div>
                <p class="text-gray-300 text-sm mb-6 leading-relaxed">${message}</p>
                <div class="flex gap-3 justify-end">
                    <button id="confirm-cancel" class="border border-gray-700 text-gray-400 px-5 py-2 text-xs hover:text-white transition-colors">[ ОТМЕНА ]</button>
                    <button id="confirm-ok" class="bg-red-900/40 border border-red-700 text-red-400 px-5 py-2 text-xs hover:text-red-200 hover:border-red-500 transition-colors">[ УДАЛИТЬ ]</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#confirm-ok').addEventListener('click', () => { document.body.removeChild(overlay); resolve(true); });
        overlay.querySelector('#confirm-cancel').addEventListener('click', () => { document.body.removeChild(overlay); resolve(false); });
    });
}

// ── ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ ─────────────────────────────────────────────
function openStorageModal() {
    const modal = document.getElementById('storage-modal');
    const box   = document.getElementById('storage-modal-box');
    if (!modal) return;

    playSound(sfx.docOpen);
    addSystemLog('Открытие локального хранилища');
    modal.classList.remove('hidden');

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (box) box.classList.add('window-open-active');
        renderStorageList();
    }, 10);
}

function closeStorageModal() {
    const modal = document.getElementById('storage-modal');
    const box   = document.getElementById('storage-modal-box');
    playSound(sfx.click);
    if (!modal) return;
    modal.classList.add('opacity-0');
    if (box) box.classList.remove('window-open-active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// ── ИНИЦИАЛИЗАЦИЯ КОНТРОЛЛЕРОВ ──────────────────────────────────────────────
function setupStorageUI() {
    // Кнопка открытия в сайдбаре
    const btnOpen  = document.getElementById('btn-open-storage');
    const btnClose = document.getElementById('btn-close-storage');
    if (btnOpen)  btnOpen.addEventListener('click',  openStorageModal);
    if (btnClose) btnClose.addEventListener('click', closeStorageModal);

    // Вкладки Оперативники / Персонажи
    const tabDos  = document.getElementById('storage-tab-dossiers');
    const tabChar = document.getElementById('storage-tab-characters');

    function setStorageTab(tab) {
        _storageTab = tab;
        playSound(sfx.click);
        [tabDos, tabChar].forEach(t => {
            if (!t) return;
            t.classList.remove('tab-active', 'tab-inactive');
        });
        if (tab === 'dossiers') {
            tabDos?.classList.add('tab-active');
            tabChar?.classList.add('tab-inactive');
        } else {
            tabChar?.classList.add('tab-active');
            tabDos?.classList.add('tab-inactive');
        }
        renderStorageList();
    }

    if (tabDos)  tabDos.addEventListener('click',  () => setStorageTab('dossiers'));
    if (tabChar) tabChar.addEventListener('click', () => setStorageTab('characters'));

    // Экспорт всего
    const btnExport = document.getElementById('btn-storage-export');
    if (btnExport) {
        btnExport.addEventListener('click', async () => {
            playSound(sfx.click);
            try {
                await dbExportAll();
                addSystemLog('Резервная копия хранилища скачана');
            } catch (err) {
                addSystemLog('Ошибка экспорта: ' + err.message, true);
            }
        });
    }

    // Импорт из файла
    const btnImport   = document.getElementById('btn-storage-import');
    const importInput = document.getElementById('storage-import-input');
    if (btnImport && importInput) {
        btnImport.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            playSound(sfx.typing);
            try {
                const result = await dbImportFromFile(file);
                addSystemLog(`Импорт: ${result.dossiers} досье, ${result.characters} персонажей`);
                renderCards();
                renderCharacterCards();
                renderStorageList();
            } catch (err) {
                addSystemLog('Ошибка импорта: ' + err.message, true);
            }
            importInput.value = '';
        });
    }

    // Очистить текущий раздел
    const btnClear = document.getElementById('btn-storage-clear');
    if (btnClear) {
        btnClear.addEventListener('click', async () => {
            const label = _storageTab === 'dossiers' ? 'ВСЕ ДОСЬЕ' : 'ВСЕ ПЕРСОНАЖИ';
            const confirmed = await showStorageConfirm(`Удалить ${label} из локального хранилища? Хардкод-примеры не затронуты.`);
            if (!confirmed) return;

            try {
                const store = _storageTab === 'dossiers' ? STORE_DOS : STORE_CHAR;
                const records = await dbGetAll(store);

                for (const rec of records) {
                    if (_storageTab === 'dossiers') await dbDeleteDossier(rec.id);
                    else await dbDeleteCharacter(rec.id);
                }

                playSound(sfx.click);
                addSystemLog(`Хранилище очищено (${label})`);
                renderCards();
                renderCharacterCards();
                renderStorageList();
            } catch (err) {
                addSystemLog('Ошибка очистки: ' + err.message, true);
            }
        });
    }
}
