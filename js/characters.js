// --- CYBERNAUTICA CHARACTER SHEETS MODULE (VIEW) ---

let current_view_mode = 'dossiers'; // 'dossiers' | 'characters'

// --- ОБЩИЕ РЕНДЕРЕРЫ (используются и модалкой просмотра, и live-превью формы создания) ---

function renderAbilityHTML(ability, isSub) {
    const name = ability.name || 'БЕЗ НАЗВАНИЯ';
    const desc = ability.description || '';
    const tags = Array.isArray(ability.tags) ? ability.tags : [];
    const subs = Array.isArray(ability.subAbilities) ? ability.subAbilities : [];

    const tagsHtml = tags.map(t => `<div class="text-[10px] theme-text font-mono-custom mt-1">[ ${t} ]</div>`).join('');
    const subsHtml = subs.map(sub => renderAbilityHTML(sub, true)).join('');

    return `
        <div class="${isSub ? 'ml-4 md:ml-6 mt-3 pl-4 border-l-2 theme-border' : 'mb-5 p-4 border theme-border bg-black/30'}">
            <div class="font-bold ${isSub ? 'text-xs text-gray-300' : 'text-sm theme-text uppercase tracking-wide'}">${isSub ? '<span class="text-gray-500 normal-case font-normal">Под-способность: </span>' : ''}${name}</div>
            ${desc ? `<div class="text-gray-400 text-xs font-mono-custom bg-black/40 border border-gray-800 p-2 mt-2 rounded leading-relaxed">${desc}</div>` : ''}
            ${tagsHtml}
            ${subsHtml}
        </div>
    `;
}

function renderAbilitiesHTML(abilities) {
    if (!Array.isArray(abilities) || abilities.length === 0) {
        return `<div class="text-gray-600 text-xs font-mono-custom">[ ДАННЫЕ О СПОСОБНОСТЯХ ОТСУТСТВУЮТ ]</div>`;
    }
    return abilities.map(a => renderAbilityHTML(a, false)).join('');
}

function renderInventoryHTML(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<div class="text-gray-600 text-xs font-mono-custom">[ ИНВЕНТАРЬ ПУСТ ]</div>`;
    }
    return items.map(it => `
        <div class="flex gap-3 p-3 border theme-border bg-black/20 mb-3">
            ${it.photo ? `<img src="${it.photo}" alt="${it.name || ''}" class="w-16 h-16 shrink-0 object-cover border theme-border cursor-pointer hover:opacity-80 transition-opacity" onclick="openLightbox('${String(it.photo).replace(/'/g, "\\'")}')">` : ''}
            <div class="flex-1 min-w-0">
                <div class="font-bold text-sm text-gray-200">${it.name || 'БЕЗ НАЗВАНИЯ'}</div>
                ${it.description ? `<div class="text-gray-400 text-xs mt-1 leading-relaxed">${it.description}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function renderGalleryHTML(photos) {
    if (!Array.isArray(photos) || photos.length === 0) return '';
    return `<div class="flex flex-wrap gap-2 mt-3">${photos.map(p => `<img src="${p}" class="w-20 h-20 object-cover border theme-border cursor-pointer hover:opacity-80 transition-opacity" onclick="openLightbox('${String(p).replace(/'/g, "\\'")}')">`).join('')}</div>`;
}

// --- LIGHTBOX (просмотр фото инвентаря/внешности) ---

function openLightbox(url) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lightbox || !img || !url) return;
    img.src = url;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    playSound(sfx.click);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
}

// --- КАРТОЧКИ ПЕРСОНАЖЕЙ В ОСНОВНОЙ СЕТКЕ ---

function renderCharacterCards() {
    const grid = document.getElementById('dossier-grid');
    if (!grid || typeof characters === 'undefined') return;

    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    grid.innerHTML = '';

    characters.forEach((char, index) => {
        const matchSearch = (char.name || '').toLowerCase().includes(searchTerm) || (char.id || '').toLowerCase().includes(searchTerm);
        if (!matchSearch) return;

        const card = document.createElement('div');
        card.className = `dossier-card p-4 flex flex-col h-full`;
        card.addEventListener('click', () => { playSound(sfx.click); openCharacterModal(index); });

        card.addEventListener('mousemove', (e) => {
            card.style.zIndex = "50";
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.zIndex = "1";
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });

        const classLine = [char.race, char.charClass, char.subclass].filter(Boolean).join(' // ');
        const charDBIcon = char._fromDB ? `<span class="text-green-700 text-[10px]" title="Сохранено локально">💾</span>` : '';

        card.innerHTML = `<div class="flex gap-4 mb-4 relative z-10"><img src="${char.photo || ''}" class="w-16 h-16 object-cover border theme-border grayscale"><div class="flex-1 min-w-0"><div class="text-[10px] font-mono-custom theme-text opacity-50 mb-1 glitch-text flex justify-between items-center" data-val="${char.id || ''}"><span>${char.id || ''}</span>${charDBIcon}</div><h3 class="font-bold text-gray-100 uppercase truncate text-sm glitch-text" data-val="${char.name || ''}">${char.name || ''}</h3><div class="text-xs theme-text opacity-70 truncate font-mono-custom glitch-text" data-val="${classLine}">${classLine}</div></div></div><div class="mt-auto relative z-10 space-y-2"><div class="flex justify-between text-[10px] font-mono-custom theme-text opacity-70 border-t theme-border pt-2"><span>Возраст: ${char.age ?? '—'}</span><span>${char.height || ''}</span></div></div>`;
        grid.appendChild(card);
    });
}

// --- МОДАЛКА ПРОСМОТРА ПЕРСОНАЖА ---

function openCharacterModal(index) {
    const char = characters[index];
    if (!char) return;

    document.getElementById('char-modal-photo').src = char.photo || '';
    document.getElementById('char-modal-id').innerText = char.id || '';
    document.getElementById('char-modal-name').innerText = char.name || '';

    const classLine = [char.race, char.charClass, char.subclass].filter(Boolean).join(' // ');
    document.getElementById('char-modal-class').innerText = classLine;
    document.getElementById('char-modal-age').innerText = char.age ?? '—';
    document.getElementById('char-modal-height').innerText = char.height || '—';

    document.getElementById('char-modal-personality').innerHTML = typeof parseLogText === 'function' ? parseLogText(char.personality || '') : (char.personality || '');
    document.getElementById('char-modal-history').innerHTML = typeof parseLogText === 'function' ? parseLogText(char.history || '') : (char.history || '');
    document.getElementById('char-modal-weaknesses').innerHTML = typeof parseLogText === 'function' ? parseLogText(char.weaknesses || '') : (char.weaknesses || '');
    document.getElementById('char-modal-appearance').innerHTML = typeof parseLogText === 'function' ? parseLogText(char.appearance || '') : (char.appearance || '');
    document.getElementById('char-modal-appearance-gallery').innerHTML = renderGalleryHTML(char.appearance_photos);

    document.getElementById('char-modal-abilities').innerHTML = renderAbilitiesHTML(char.abilities);
    document.getElementById('char-modal-inventory').innerHTML = renderInventoryHTML(char.inventory);

    const modal = document.getElementById('character-modal');
    const modalBox = document.getElementById('character-modal-box');
    modal.classList.remove('hidden');
    addSystemLog(`Открытие листа персонажа ${char.id || ''}`);
    if (typeof window._setCurrentViewCharIndex === 'function') window._setCurrentViewCharIndex(index);

    // Сбрасываем Discord-панель при открытии нового персонажа
    const prevEl = document.getElementById('char-view-discord-preview');
    const rawEl  = document.getElementById('char-view-discord-raw');
    if (prevEl) prevEl.innerHTML = '<div style="color:#72767d;font-size:13px;text-align:center;margin-top:30px;">[ НАЖМИТЕ «ПРЕДПРОСМОТР» ]</div>';
    if (rawEl)  rawEl.value = '';

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalBox.classList.remove('opacity-0');
        playSound(sfx.docOpen);
        modalBox.classList.add('window-open-active');
        if (typeof scrambleText === 'function') scrambleText(modal.querySelectorAll('.glitch-text'));
    }, 10);
}

function closeCharacterModal() {
    playSound(sfx.click);
    document.getElementById('character-modal').classList.add('opacity-0');
    document.getElementById('character-modal-box').classList.remove('window-open-active');
    setTimeout(() => { document.getElementById('character-modal').classList.add('hidden'); }, 300);
}

// --- ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМА СЕТКИ (ОПЕРАТИВНИКИ / ПЕРСОНАЖИ) ---

function setupViewToggle() {
    const btnDossiers = document.getElementById('btn-view-dossiers');
    const btnCharacters = document.getElementById('btn-view-characters');
    const filterDistrict = document.getElementById('filter-district');
    if (!btnDossiers || !btnCharacters) return;

    function setMode(mode) {
        current_view_mode = mode;
        if (mode === 'dossiers') {
            btnDossiers.classList.add('tab-active'); btnDossiers.classList.remove('tab-inactive');
            btnCharacters.classList.add('tab-inactive'); btnCharacters.classList.remove('tab-active');
            if (filterDistrict) filterDistrict.parentElement.style.display = '';
            renderCards();
        } else {
            btnCharacters.classList.add('tab-active'); btnCharacters.classList.remove('tab-inactive');
            btnDossiers.classList.add('tab-inactive'); btnDossiers.classList.remove('tab-active');
            if (filterDistrict) filterDistrict.parentElement.style.display = 'none';
            renderCharacterCards();
        }
    }

    btnDossiers.addEventListener('click', () => { playSound(sfx.click); setMode('dossiers'); });
    btnCharacters.addEventListener('click', () => { playSound(sfx.click); setMode('characters'); });
}
