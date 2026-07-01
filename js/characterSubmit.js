// --- CYBERNAUTICA CHARACTER SHEET SUBMISSION MODULE ---

let _pendingCharacter = null; // Последний сгенерированный персонаж для сохранения в DB

function getMoscowTimeChar() {
    return typeof getMoscowTime === 'function' ? getMoscowTime() : new Date().toISOString();
}

// --- ДОБАВЛЕНИЕ БЛОКОВ СПОСОБНОСТЕЙ (С ПОД-СПОСОБНОСТЯМИ) ---

function addAbilityBlock() {
    playSound(sfx.click);
    const container = document.getElementById('char-abilities-container');
    const entry = document.createElement('div');
    entry.className = "char-ability-entry border theme-border bg-black/30 p-3 flex flex-col gap-2 relative mb-4";

    entry.innerHTML = `
        <button class="btn-remove-ability absolute top-2 right-2 text-red-700 hover:text-red-400 text-[10px] font-bold transition-colors ui-element">[ УДАЛИТЬ СПОСОБНОСТЬ ]</button>
        <input type="text" placeholder="Название способности (напр. Мы только начали)" class="char-ability-name w-full bg-black border border-gray-800 text-xs theme-text p-2 pr-32 focus-theme transition-colors ui-element">
        <textarea placeholder="Описание способности..." class="char-ability-desc w-full min-h-[70px] bg-black border border-gray-800 text-xs text-gray-300 p-2 focus-theme transition-colors resize-none custom-scrollbar ui-element"></textarea>
        <textarea placeholder="Параметры, по одному на строку (напр. Для активации: 3 поста)" class="char-ability-tags w-full min-h-[60px] bg-black border border-gray-800 text-[11px] text-gray-400 p-2 focus-theme transition-colors resize-none custom-scrollbar ui-element"></textarea>
        <div class="char-subability-list pl-4 border-l-2 border-gray-800 space-y-2"></div>
        <button class="btn-add-subability self-start theme-text text-[9px] hover:text-white border theme-border px-3 py-1 ui-element transition-colors theme-bg-faint hover:theme-bg-heavy font-bold">[+ ДОБАВИТЬ ПОД-СПОСОБНОСТЬ ]</button>
    `;

    entry.querySelector('.btn-remove-ability').addEventListener('click', () => { playSound(sfx.click); entry.remove(); });
    entry.querySelector('.btn-add-subability').addEventListener('click', () => addSubAbilityBlock(entry.querySelector('.char-subability-list')));

    entry.querySelectorAll('.ui-element').forEach(el => {
        el.addEventListener('mouseenter', () => playSound(sfx.hover));
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.addEventListener('focus', () => playSound(sfx.click));
    });

    container.appendChild(entry);
}

function addSubAbilityBlock(listContainer) {
    playSound(sfx.click);
    const sub = document.createElement('div');
    sub.className = "char-subability-entry border theme-border bg-black/20 p-2 flex flex-col gap-2 relative";

    sub.innerHTML = `
        <button class="btn-remove-subability absolute top-1 right-1 text-red-700 hover:text-red-400 text-[9px] font-bold transition-colors ui-element">[ X ]</button>
        <input type="text" placeholder="Название под-способности (напр. Фантом)" class="char-subability-name w-full bg-black border border-gray-800 text-[11px] theme-text p-2 pr-10 focus-theme transition-colors ui-element">
        <textarea placeholder="Описание под-способности..." class="char-subability-desc w-full min-h-[50px] bg-black border border-gray-800 text-[11px] text-gray-300 p-2 focus-theme transition-colors resize-none custom-scrollbar ui-element"></textarea>
        <textarea placeholder="Параметры, по одному на строку" class="char-subability-tags w-full min-h-[40px] bg-black border border-gray-800 text-[10px] text-gray-400 p-2 focus-theme transition-colors resize-none custom-scrollbar ui-element"></textarea>
    `;

    sub.querySelector('.btn-remove-subability').addEventListener('click', () => { playSound(sfx.click); sub.remove(); });

    sub.querySelectorAll('.ui-element').forEach(el => {
        el.addEventListener('mouseenter', () => playSound(sfx.hover));
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.addEventListener('focus', () => playSound(sfx.click));
    });

    listContainer.appendChild(sub);
}

// --- ИНВЕНТАРЬ (С ФОТО) ---

function addInventoryItem() {
    playSound(sfx.click);
    const container = document.getElementById('char-inventory-container');
    const entry = document.createElement('div');
    entry.className = "char-inventory-entry border theme-border bg-black/30 p-3 flex flex-col gap-2 relative mb-4";

    entry.innerHTML = `
        <button class="btn-remove-inventory absolute top-2 right-2 text-red-700 hover:text-red-400 text-[10px] font-bold transition-colors ui-element">[ УДАЛИТЬ ПРЕДМЕТ ]</button>
        <input type="text" placeholder="Название предмета" class="char-inventory-name w-full bg-black border border-gray-800 text-xs theme-text p-2 pr-32 focus-theme transition-colors ui-element">
        <textarea placeholder="Описание предмета..." class="char-inventory-desc w-full min-h-[60px] bg-black border border-gray-800 text-xs text-gray-300 p-2 focus-theme transition-colors resize-none custom-scrollbar ui-element"></textarea>
        <input type="text" placeholder="Ссылка на фото предмета (необязательно)" class="char-inventory-photo w-full bg-black border border-gray-800 text-xs theme-text opacity-80 p-2 focus-theme transition-colors ui-element">
    `;

    entry.querySelector('.btn-remove-inventory').addEventListener('click', () => { playSound(sfx.click); entry.remove(); });

    entry.querySelectorAll('.ui-element').forEach(el => {
        el.addEventListener('mouseenter', () => playSound(sfx.hover));
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.addEventListener('focus', () => playSound(sfx.click));
    });

    container.appendChild(entry);
}

// --- ФОТО ВНЕШНОСТИ (ОСОБЫЕ ПРЕДМЕТЫ / ГАЛЕРЕЯ) ---

function addAppearancePhoto() {
    playSound(sfx.click);
    const container = document.getElementById('char-appearance-photos-container');
    const row = document.createElement('div');
    row.className = "char-appearance-photo-entry flex gap-2 items-center";
    row.innerHTML = `
        <input type="text" placeholder="Ссылка на фото (напр. https://i.imgur.com/image.jpg)" class="char-appearance-photo-url flex-1 bg-black border border-gray-800 text-xs theme-text p-2 focus-theme transition-colors ui-element">
        <button class="btn-remove-appearance-photo text-red-700 hover:text-red-400 text-[10px] font-bold transition-colors ui-element px-2">[ X ]</button>
    `;
    row.querySelector('.btn-remove-appearance-photo').addEventListener('click', () => { playSound(sfx.click); row.remove(); });
    row.querySelectorAll('.ui-element').forEach(el => {
        el.addEventListener('mouseenter', () => playSound(sfx.hover));
        if (el.tagName === 'INPUT') el.addEventListener('focus', () => playSound(sfx.click));
    });
    container.appendChild(row);
}

// --- СБОР ДАННЫХ ИЗ ФОРМЫ В ОБЪЕКТ ---

function collectAbilitiesFromDOM() {
    const abilities = [];
    document.querySelectorAll('#char-abilities-container > .char-ability-entry').forEach(entry => {
        const name = entry.querySelector('.char-ability-name').value.trim() || "БЕЗ НАЗВАНИЯ";
        const description = entry.querySelector('.char-ability-desc').value.trim();
        const tags = entry.querySelector('.char-ability-tags').value.split('\n').map(t => t.trim()).filter(t => t);

        const subAbilities = [];
        const subList = entry.querySelector('.char-subability-list');
        if (subList) {
            subList.querySelectorAll('.char-subability-entry').forEach(sub => {
                const subName = sub.querySelector('.char-subability-name').value.trim() || "БЕЗ НАЗВАНИЯ";
                const subDesc = sub.querySelector('.char-subability-desc').value.trim();
                const subTags = sub.querySelector('.char-subability-tags').value.split('\n').map(t => t.trim()).filter(t => t);
                subAbilities.push({ name: subName, description: subDesc, tags: subTags });
            });
        }

        abilities.push({ name, description, tags, subAbilities });
    });
    return abilities;
}

function collectInventoryFromDOM() {
    const inventory = [];
    document.querySelectorAll('#char-inventory-container > .char-inventory-entry').forEach(entry => {
        const name = entry.querySelector('.char-inventory-name').value.trim() || "БЕЗ НАЗВАНИЯ";
        const description = entry.querySelector('.char-inventory-desc').value.trim();
        const photo = entry.querySelector('.char-inventory-photo').value.trim();
        inventory.push({ name, description, photo });
    });
    return inventory;
}

function collectAppearancePhotosFromDOM() {
    const photos = [];
    document.querySelectorAll('#char-appearance-photos-container .char-appearance-photo-url').forEach(input => {
        const url = input.value.trim();
        if (url) photos.push(url);
    });
    return photos;
}

function loadCharacterToForm(data) {
    // 1. Заполняем простые поля
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setVal('char-id', data.id);
    setVal('char-name', data.name);
    setVal('char-race', data.race);
    setVal('char-class', data.charClass);
    setVal('char-subclass', data.subclass);
    setVal('char-age', data.age);
    setVal('char-height', data.height);
    setVal('char-photo', data.photo);
    setVal('char-personality', data.personality);
    setVal('char-history', data.history);
    setVal('char-weaknesses', data.weaknesses);
    setVal('char-appearance', data.appearance);

    // 2. Способности и под-способности
    const abContainer = document.getElementById('char-abilities-container');
    if (abContainer) {
        abContainer.innerHTML = '';
        if (data.abilities && data.abilities.length > 0) {
            data.abilities.forEach(ab => {
                addAbilityBlock();
                const abEl = abContainer.lastElementChild;

                abEl.querySelector('.char-ability-name').value = ab.name || '';
                abEl.querySelector('.char-ability-desc').value = ab.description || '';
                // Теги способностей объединяем переносом строки
                abEl.querySelector('.char-ability-tags').value = (ab.tags || []).join('\n');

                const subContainer = abEl.querySelector('.char-subability-list');
                if (ab.subAbilities && ab.subAbilities.length > 0) {
                    ab.subAbilities.forEach(sub => {
                        addSubAbilityBlock(subContainer);
                        const subEl = subContainer.lastElementChild;

                        subEl.querySelector('.char-subability-name').value = sub.name || '';
                        subEl.querySelector('.char-subability-desc').value = sub.description || '';
                        subEl.querySelector('.char-subability-tags').value = (sub.tags || []).join('\n');
                    });
                }
            });
        } else {
            addAbilityBlock(); // Оставляем один пустой блок, если способностей нет
        }
    }

    // 3. Инвентарь
    const invContainer = document.getElementById('char-inventory-container');
    if (invContainer) {
        invContainer.innerHTML = '';
        if (data.inventory && data.inventory.length > 0) {
            data.inventory.forEach(item => {
                addInventoryItem();
                const itemEl = invContainer.lastElementChild;
                itemEl.querySelector('.char-inventory-name').value = item.name || '';
                itemEl.querySelector('.char-inventory-desc').value = item.description || '';
                itemEl.querySelector('.char-inventory-photo').value = item.photo || '';
            });
        } else {
            addInventoryItem();
        }
    }

    // 4. Галерея внешности
    const photoContainer = document.getElementById('char-appearance-photos-container');
    if (photoContainer) {
        photoContainer.innerHTML = '';
        if (data.appearance_photos && data.appearance_photos.length > 0) {
            data.appearance_photos.forEach(url => {
                addAppearancePhoto();
                const photoEl = photoContainer.lastElementChild;
                photoEl.querySelector('.char-appearance-photo-url').value = url || '';
            });
        }
    }

    // 5. Имитируем клик по кнопке для открытия терминала
    const openBtn = document.getElementById('btn-open-character-submit');
    if (openBtn) openBtn.click();
}

function buildCharacterData() {
    const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

    const name = get('char-name') || "НЕИЗВЕСТНЫЙ ПЕРСОНАЖ";
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const photo_input = get('char-photo');
    const final_photo = photo_input.length > 5 ? photo_input : `https://placehold.co/400x400/0a0a0c/10b981?text=${initials}`;

    return {
        id: get('char-id') || "CHAR-XXX",
        name: name,
        race: get('char-race') || "Неизвестно",
        charClass: get('char-class') || "Неизвестно",
        subclass: get('char-subclass') || "",
        age: parseInt(get('char-age')) || 0,
        height: get('char-height') || "—",
        photo: final_photo,
        personality: get('char-personality'),
        history: get('char-history'),
        abilities: collectAbilitiesFromDOM(),
        weaknesses: get('char-weaknesses'),
        inventory: collectInventoryFromDOM(),
        appearance: get('char-appearance'),
        appearance_photos: collectAppearancePhotosFromDOM(),
        last_update: getMoscowTimeChar()
    };
}

// --- LIVE-ПРЕВЬЮ ---

function updateCharacterLivePreview() {
    const previewContainer = document.getElementById('char-preview-container');
    if (!previewContainer) return;

    const data = buildCharacterData();
    const classLine = [data.race, data.charClass, data.subclass].filter(Boolean).join(' // ');
    const personalityHtml = typeof parseLogText === 'function' ? parseLogText(data.personality) : data.personality;
    const historyHtml = typeof parseLogText === 'function' ? parseLogText(data.history) : data.history;
    const weaknessesHtml = typeof parseLogText === 'function' ? parseLogText(data.weaknesses) : data.weaknesses;
    const appearanceHtml = typeof parseLogText === 'function' ? parseLogText(data.appearance) : data.appearance;

    previewContainer.innerHTML = `
        <div class="flex gap-4 border-b theme-border pb-4 mb-6">
            <img src="${data.photo}" class="w-20 h-20 object-cover border theme-border grayscale">
            <div>
                <div class="text-[10px] theme-text mb-1">ID: ${data.id}</div>
                <h2 class="text-2xl font-bold text-gray-100 uppercase tracking-tight">${data.name}</h2>
                <div class="text-xs theme-text font-mono-custom mt-1">${classLine}</div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-6 text-xs font-mono-custom">
            <div class="text-gray-600">Возраст: <span class="text-gray-300 ml-2">${data.age}</span></div>
            <div class="text-gray-600">Рост: <span class="text-gray-300 ml-2">${data.height}</span></div>
        </div>
        <div class="mb-6"><div class="text-gray-600 text-[10px] mb-2 uppercase">Характер:</div><div class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${personalityHtml || '—'}</div></div>
        <div class="mb-6"><div class="text-gray-600 text-[10px] mb-2 uppercase">История:</div><div class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${historyHtml || '—'}</div></div>
        <div class="mb-6"><div class="text-gray-600 text-[10px] mb-2 uppercase">Способности:</div>${renderAbilitiesHTML(data.abilities)}</div>
        <div class="mb-6"><div class="text-gray-600 text-[10px] mb-2 uppercase">Слабости:</div><div class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${weaknessesHtml || '—'}</div></div>
        <div class="mb-6"><div class="text-gray-600 text-[10px] mb-2 uppercase">Инвентарь:</div>${renderInventoryHTML(data.inventory)}</div>
        <div class="mb-6"><div class="text-gray-600 text-[10px] mb-2 uppercase">Внешность:</div><div class="text-gray-300 text-sm leading-relaxed whitespace-pre-line">${appearanceHtml || '—'}</div>${renderGalleryHTML(data.appearance_photos)}</div>
    `;
}

// --- НАСТРОЙКА КОНТРОЛЛЕРОВ ---

function setupCharacterSubmitControls() {
    const modal = document.getElementById('character-submit-modal');
    const box = document.getElementById('character-submit-box');
    const btn_open = document.getElementById('btn-open-character-submit');
    const btn_close = document.getElementById('btn-close-character-submit');
    const btn_add_ability = document.getElementById('btn-add-ability');
    const btn_add_inventory = document.getElementById('btn-add-inventory-item');
    const btn_add_appearance_photo = document.getElementById('btn-add-appearance-photo');
    const btn_generate = document.getElementById('btn-generate-character');
    const btn_copy = document.getElementById('btn-copy-character-hash');
    const output_hash = document.getElementById('character-submit-output');

    const abilitiesContainer = document.getElementById('char-abilities-container');
    const inventoryContainer = document.getElementById('char-inventory-container');

    if (abilitiesContainer && abilitiesContainer.children.length === 0) addAbilityBlock();
    if (inventoryContainer && inventoryContainer.children.length === 0) addInventoryItem();

    const tabBtns = document.querySelectorAll('.char-sub-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(sfx.click);
            tabBtns.forEach(b => { b.classList.remove('tab-active'); b.classList.add('tab-inactive'); });

            const targets = ['char-tab-content-guide', 'char-tab-content-basic', 'char-tab-content-abilities', 'char-tab-content-inventory', 'char-tab-content-preview', 'char-tab-content-transmit', 'char-tab-content-discord'];
            targets.forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.classList.add('hidden'); el.classList.remove('flex', 'flex-col'); }
            });

            btn.classList.remove('tab-inactive');
            btn.classList.add('tab-active');

            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetId === 'char-tab-content-preview') updateCharacterLivePreview();
            if (targetEl) {
                targetEl.classList.remove('hidden');
                targetEl.classList.add('flex', 'flex-col');
            }
        });
    });

    if (btn_add_ability) btn_add_ability.addEventListener('click', addAbilityBlock);
    if (btn_add_inventory) btn_add_inventory.addEventListener('click', addInventoryItem);
    if (btn_add_appearance_photo) btn_add_appearance_photo.addEventListener('click', addAppearancePhoto);

    if (btn_open) {
        btn_open.addEventListener('click', () => {
            playSound(sfx.click);
            addSystemLog('Открытие терминала создания листа персонажа');
            if (output_hash) output_hash.value = '';
            if (tabBtns.length > 0) tabBtns[0].click();
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                if (box) box.classList.add('window-open-active');
                playSound(sfx.docOpen);
            }, 10);
        });
    }

    if (btn_close) {
        btn_close.addEventListener('click', () => {
            playSound(sfx.click);
            modal.classList.add('opacity-0');
            if (box) box.classList.remove('window-open-active');
            setTimeout(() => { modal.classList.add('hidden'); }, 300);
        });
    }

    if (btn_generate) {
        btn_generate.addEventListener('click', () => {
            playSound(sfx.click);
            playSound(sfx.typing);
            const data = buildCharacterData();
            _pendingCharacter = data;
            const json_str = JSON.stringify(data, null, 4);
            if (output_hash) output_hash.value = json_str + ",\n";
            addSystemLog('Лист персонажа успешно скомпилирован.');
        });
    }

    if (btn_copy) {
        btn_copy.addEventListener('click', () => {
            if (!output_hash || !output_hash.value) return;
            navigator.clipboard.writeText(output_hash.value).then(() => {
                playSound(sfx.click);
                addSystemLog('Лист персонажа скопирован в буфер обмена');
                const original_text = btn_copy.innerText;
                btn_copy.innerText = "[ СКОПИРОВАНО ]";
                setTimeout(() => { btn_copy.innerText = original_text; }, 2000);
            });
        });
    }

    const btn_save_char_db = document.getElementById('btn-save-character-db');
    if (btn_save_char_db) {
        btn_save_char_db.addEventListener('click', async () => {
            if (!_pendingCharacter) { addSystemLog('Сначала сгенерируйте лист персонажа', true); return; }
            try {
                await dbSave(STORE_CHAR, _pendingCharacter);
                const idx = characters.findIndex(c => c.id === _pendingCharacter.id);
                const saved = { ..._pendingCharacter, _fromDB: true };
                if (idx !== -1) characters[idx] = saved; else characters.push(saved);
                renderCharacterCards();
                playSound(sfx.docOpen);
                addSystemLog(`Персонаж ${_pendingCharacter.id} сохранён в хранилище`);
                const orig = btn_save_char_db.innerText;
                btn_save_char_db.innerText = '[ ✓ СОХРАНЕНО ]';
                btn_save_char_db.classList.add('text-green-400', 'border-green-800');
                setTimeout(() => {
                    btn_save_char_db.innerText = orig;
                    btn_save_char_db.classList.remove('text-green-400', 'border-green-800');
                }, 2500);
            } catch (err) {
                addSystemLog('Ошибка сохранения: ' + err.message, true);
            }
        });
    }
}
