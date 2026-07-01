// --- CYBERNAUTICA ENTRY POINT & GLOBAL EVENTS ---

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        const map_modal = document.getElementById('map-modal');
        const archive_modal = document.getElementById('archive-modal');
        const submit_modal = document.getElementById('submit-modal');
        const character_modal = document.getElementById('character-modal');
        const character_submit_modal = document.getElementById('character-submit-modal');
        const lightbox = document.getElementById('lightbox');
        const storage_modal = document.getElementById('storage-modal');

        if(lightbox && !lightbox.classList.contains('hidden')) { closeLightbox(); return; }
        if(modal && !modal.classList.contains('hidden')) closeModal();
        if(map_modal && !map_modal.classList.contains('hidden')) { document.getElementById('btn-close-map').click(); }
        if(archive_modal && !archive_modal.classList.contains('hidden')) { document.getElementById('btn-close-archive').click(); }
        if(submit_modal && !submit_modal.classList.contains('hidden')) { document.getElementById('btn-close-submit').click(); }
        if(character_modal && !character_modal.classList.contains('hidden')) { closeCharacterModal(); }
        if(character_submit_modal && !character_submit_modal.classList.contains('hidden')) { document.getElementById('btn-close-character-submit').click(); }
        if(storage_modal && !storage_modal.classList.contains('hidden')) { closeStorageModal(); }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    try { buildMap(); } catch(e) {}
    try { setupMapControls(); } catch(e) {}
    try { setupArchiveControls(); } catch(e) {}
    try { setupSubmitControls(); } catch(e) {}
    try { setupViewToggle(); } catch(e) {}
    try { setupCharacterSubmitControls(); } catch(e) {}
    try { setupStorageUI(); } catch(e) { console.error('storageUI init error:', e); }
    
    const searchInput = document.getElementById('search-input');
    const filterDistrict = document.getElementById('filter-district');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (typeof current_view_mode !== 'undefined' && current_view_mode === 'characters') {
                renderCharacterCards();
            } else {
                renderCards();
            }
        });
    }
    if (filterDistrict) {
        filterDistrict.addEventListener('change', () => {
            playSound(sfx.click);
            renderCards(); 
        });
    }

    const themeSelect = document.getElementById('ui-theme-select');
    const headerLogo = document.getElementById('header-logo');
    const factionLogos = { dzen: 'assets/logo_dzen.png', eon: 'assets/logo_eon.png', xana: 'assets/logo_xana.png', neutral: 'assets/logo_dzen.png' };
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            playSound(sfx.click);
            document.body.setAttribute('data-theme', e.target.value);
            if (headerLogo && factionLogos[e.target.value]) headerLogo.src = factionLogos[e.target.value];
            addSystemLog(`Протокол фракции переключён на ${e.target.value.toUpperCase()}`);
        });
    }

    const initScreen = document.getElementById('init-screen');
    const boot_screen = document.getElementById('boot-screen');
    const main_ui = document.getElementById('main-ui');
    
    const idCard = document.getElementById('id-card');
    const idSlot = document.getElementById('id-slot');
    const slotLed = document.getElementById('slot-led');
    const crtFlash = document.getElementById('crt-flash');

    if (idCard && idSlot) {
        idCard.addEventListener('dragstart', (e) => {
            playSound(sfx.hover);
            e.dataTransfer.setData('text/plain', 'vanguard-id');
            e.dataTransfer.effectAllowed = 'move';
            
            const clone = idCard.cloneNode(true);
            clone.classList.add('dragged-clone');
            clone.style.position = 'absolute';
            clone.style.top = '-9999px'; 
            clone.style.opacity = '1';
            document.body.appendChild(clone);

            const rect = idCard.getBoundingClientRect();
            e.dataTransfer.setDragImage(clone, e.clientX - rect.left, e.clientY - rect.top);

            setTimeout(() => {
                document.body.removeChild(clone);
                idCard.style.opacity = '0.2'; 
            }, 0);
        });

        idCard.addEventListener('dragend', () => {
            idCard.style.opacity = '1';
        });

        idSlot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            idSlot.classList.add('drag-over');
        });

        idSlot.addEventListener('dragleave', () => {
            idSlot.classList.remove('drag-over');
        });

        idSlot.addEventListener('drop', (e) => {
            e.preventDefault();
            idSlot.classList.remove('drag-over');
            const data = e.dataTransfer.getData('text/plain');
            
            if (data === 'vanguard-id') {
                processIdCard();
            }
        });
        
        idCard.addEventListener('click', processIdCard);
        idCard.addEventListener('touchstart', processIdCard, {passive: true});
    }

    function processIdCard() {
        if(!idCard || idCard.style.display === 'none') return;
        
        idCard.style.display = 'none'; 
        playSound(sfx.click); 
        
        if (slotLed) {
            slotLed.classList.remove('idle');
            slotLed.classList.add('granted');
        }
        
        if (idSlot) {
            idSlot.innerHTML = `<span class="theme-text font-mono-custom text-sm font-bold tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.8)] px-4 py-2 bg-emerald-900/20 border theme-border">[ ID VERIFIED ]</span>`;
        }
        
        setTimeout(() => {
            triggerCRTFlash();
        }, 500);
    }

    function triggerCRTFlash() {
        playSound(sfx.docOpen); 
        if(initScreen) initScreen.style.display = 'none';
        if(crtFlash) crtFlash.classList.add('active');
        document.body.classList.add('terminal-active');
        setTimeout(() => unlockTerminal(), 300);
    }

    async function unlockTerminal() {
        const boot_text = document.getElementById('boot-text');
        const lines = ["> ДОСТУП ПОДТВЕРЖДЁН...", "> ПОДКЛЮЧЕНИЕ К СЕТИ DZEN...", "> СИНХРОНИЗАЦИЯ БАЗ ДАННЫХ...", "> ДОСТУП РАЗРЕШЁН."];
        
        if (typeof encrypted_lore !== 'undefined') {
            encrypted_lore.forEach(enc_data => {
                const full_str = Array.isArray(enc_data) ? enc_data.join('').replace(/\s/g, '') : enc_data.replace(/\s/g, '');
                const decoded = decryptData(full_str);
                if(decoded) {
                    try { lore_chapters.push(JSON.parse(decoded)); } catch(e) {}
                }
            });
        }

        if (typeof populateDistricts === 'function') populateDistricts();

        // Загружаем сохранённые записи из IndexedDB
        try {
            const loaded = await loadAllFromDB();
            if (loaded.dossiers > 0 || loaded.characters > 0) {
                addSystemLog(`Хранилище: загружено ${loaded.dossiers} досье, ${loaded.characters} персонажей`);
            }
        } catch(e) { console.error('DB load on boot error:', e); }

        if(boot_text) {
            for (let line of lines) { 
                await typeLine(boot_text, line); 
                await new Promise(r => setTimeout(r, 200)); 
            }
        }
        
        sfx.ambient.play().catch(() => {});
        boot_screen.style.opacity = '0'; 
        boot_screen.style.pointerEvents = 'none';
        
        setTimeout(() => {
            boot_screen.style.display = 'none';
            main_ui.classList.remove('hidden');
            setTimeout(() => { 
                main_ui.style.opacity = '1'; 
                renderCards(); 
                initGlobalSounds(); 
                scrambleText(document.querySelectorAll('#main-ui .glitch-text'));
            }, 50);
        }, 500);
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const dossierGridContainer = document.querySelector('main > div.flex-1'); 
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            playSound(sfx.click); 
            const aside = document.querySelector('aside');
            if (aside) {
                if (aside.classList.contains('hidden-mobile')) {
                    aside.classList.remove('hidden', 'hidden-mobile');
                    // ИСПРАВЛЕНИЕ: Добавлены justify-center и items-center для мобилок
                    aside.classList.add('visible-mobile', 'fixed', 'inset-0', 'bg-black/95', 'backdrop-blur-sm', 'z-[90]', 'p-6', 'justify-center', 'items-center');
                    mobileMenuBtn.innerText = '[ ЗАКРЫТЬ ]';
                    mobileMenuBtn.classList.add('text-red-500');
                    if(dossierGridContainer) dossierGridContainer.style.display = 'none';
                } else {
                    aside.classList.remove('visible-mobile', 'fixed', 'inset-0', 'bg-black/95', 'backdrop-blur-sm', 'z-[90]', 'p-6', 'justify-center', 'items-center');
                    aside.classList.add('hidden', 'hidden-mobile');
                    mobileMenuBtn.innerText = '[ МЕНЮ ]';
                    mobileMenuBtn.classList.remove('text-red-500');
                    if(dossierGridContainer) dossierGridContainer.style.display = 'block';
                }
            }
        });
    }
});