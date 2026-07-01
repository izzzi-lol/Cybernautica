// --- CYBERNAUTICA CHARACTER SHEET → DISCORD EXPORT MODULE ---

// Убираем терминальную разметку из текста (STAMP, [c:], ||, [h], ***)
function stripTerminalMarkup(text) {
    if (!text) return '';
    return text
        .replace(/\[STAMP:\s*\w+\]/gi, '')
        .replace(/\[c:[^\]]+\](.*?)\[\/c\]/gi, '$1')
        .replace(/\[h\](.*?)\[\/h\]/gi, '**$1**')
        .replace(/\|\|(.*?)\|\|/g, '~~$1~~')
        .replace(/\*\*\*(.*?)\*\*\*/g, '**$1**')
        .replace(/^!\s+/gm, '⚠ ')
        .replace(/^>\s+/gm, '> ')
        .trim();
}

// Разбивает текст на строки, возвращая массив непустых строк
function textToLines(text) {
    return stripTerminalMarkup(text || '').split('\n').map(l => l.trim()).filter(Boolean);
}

// Главная функция конвертации
function charToDiscord(data) {
    const lines = [];
    const sep = '> ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯';

    // ── ШАПКА ──
    const classLine = [data.race, data.charClass, data.subclass].filter(Boolean).join(' / ');
    lines.push(`# ${(data.name || 'НЕИЗВЕСТНО').toUpperCase()}`);
    if (classLine) lines.push(`> *${classLine}*`);
    lines.push(sep);
    lines.push('');

    // ── ОСНОВНЫЕ ПАРАМЕТРЫ ──
    const basics = [];
    if (data.age)    basics.push(`**Возраст** — \`${data.age}\``);
    if (data.height) basics.push(`**Рост** — \`${data.height}\``);
    if (basics.length > 0) {
        lines.push('## Основные параметры');
        basics.forEach(b => lines.push(`- ${b}`));
        lines.push('');
    }

    // ── ХАРАКТЕР ──
    if (data.personality && data.personality.trim()) {
        lines.push('## Характер');
        textToLines(data.personality).forEach(l => lines.push(`- ${l}`));
        lines.push('');
    }

    // ── ИСТОРИЯ ──
    if (data.history && data.history.trim()) {
        lines.push('## История');
        textToLines(data.history).forEach(l => lines.push(`- ${l}`));
        lines.push('');
    }

    // ── СПОСОБНОСТИ ──
    if (data.abilities && data.abilities.length > 0) {
        lines.push('## Способности');
        lines.push('');

        data.abilities.forEach(ability => {
            const name = ability.name || 'БЕЗ НАЗВАНИЯ';
            const desc = stripTerminalMarkup(ability.description);

            if (desc) {
                lines.push(`> **${name}**`);
                lines.push(`- ${desc}`);
            } else {
                lines.push(`> **${name}**`);
            }

            // Параметры способности
            if (ability.tags && ability.tags.length > 0) {
                ability.tags.forEach(tag => lines.push(`  - **[${tag}]**`));
            }

            // Под-способности
            if (ability.subAbilities && ability.subAbilities.length > 0) {
                ability.subAbilities.forEach(sub => {
                    const subName = sub.name || 'БЕЗ НАЗВАНИЯ';
                    const subDesc = stripTerminalMarkup(sub.description);
                    if (subDesc) {
                        lines.push(`  - **${subName}** — \`\`${subDesc}\`\``);
                    } else {
                        lines.push(`  - **${subName}**`);
                    }
                    if (sub.tags && sub.tags.length > 0) {
                        sub.tags.forEach(tag => lines.push(`    - **[${tag}]**`));
                    }
                });
            }

            lines.push('');
        });
    }

    // ── СЛАБОСТИ ──
    if (data.weaknesses && data.weaknesses.trim()) {
        lines.push('## Слабости');
        textToLines(data.weaknesses).forEach(l => lines.push(`- ${l}`));
        lines.push('');
    }

    // ── ИНВЕНТАРЬ ──
    if (data.inventory && data.inventory.length > 0) {
        lines.push('## Инвентарь');
        lines.push('');
        data.inventory.forEach(item => {
            const name = item.name || 'БЕЗ НАЗВАНИЯ';
            const desc = stripTerminalMarkup(item.description);
            if (desc) {
                lines.push(`- **${name}** — \`\`${desc}\`\``);
            } else {
                lines.push(`- **${name}**`);
            }
        });
        lines.push('');
    }

    // ── ВНЕШНОСТЬ ──
    if (data.appearance && data.appearance.trim()) {
        lines.push('## Внешность');
        textToLines(data.appearance).forEach(l => lines.push(`- ${l}`));
        lines.push('');
    }

    // ── ПОДВАЛ ──
    lines.push(sep);
    lines.push(`> *ID: ${data.id || '—'} · Обновлено: ${data.last_update || '—'}*`);

    return lines.join('\n');
}

// ── РЕНДЕР ПРЕДПРОСМОТРА (HTML-имитация Discord) ──
function renderDiscordPreview(text) {
    if (!text) return '';

    const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const renderInline = raw => {
        return raw
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<span style="text-decoration:line-through;opacity:0.5">$1</span>')
            .replace(/``(.*?)``/g, '<code class="dc-code">$1</code>')
            .replace(/`(.*?)`/g, '<code class="dc-code">$1</code>');
    };

    const htmlLines = [];
    const rawLines = text.split('\n');
    let i = 0;
    while (i < rawLines.length) {
        const raw = rawLines[i];
        const trimmed = raw.trimStart();

        if (trimmed.startsWith('# ')) {
            htmlLines.push(`<div class="dc-h1">${renderInline(escHtml(trimmed.slice(2)))}</div>`);
        } else if (trimmed.startsWith('## ')) {
            htmlLines.push(`<div class="dc-h2">${renderInline(escHtml(trimmed.slice(3)))}</div>`);
        } else if (trimmed.startsWith('> ')) {
            htmlLines.push(`<div class="dc-blockquote">${renderInline(escHtml(trimmed.slice(2)))}</div>`);
        } else if (trimmed.startsWith('    - ')) {
            htmlLines.push(`<div class="dc-li dc-li--3">${renderInline(escHtml(trimmed.slice(6)))}</div>`);
        } else if (trimmed.startsWith('  - ')) {
            htmlLines.push(`<div class="dc-li dc-li--2">${renderInline(escHtml(trimmed.slice(4)))}</div>`);
        } else if (trimmed.startsWith('- ')) {
            htmlLines.push(`<div class="dc-li dc-li--1">${renderInline(escHtml(trimmed.slice(2)))}</div>`);
        } else if (trimmed === '') {
            htmlLines.push('<div class="dc-spacer"></div>');
        } else {
            htmlLines.push(`<div class="dc-text">${renderInline(escHtml(trimmed))}</div>`);
        }
        i++;
    }
    return htmlLines.join('');
}

// ── ПОКАЗАТЬ ЭКСПОРТ В МОДАЛКЕ ПРОСМОТРА ──
function showCharacterExport(charIndex) {
    if (typeof characters === 'undefined' || !characters[charIndex]) return;
    const data = characters[charIndex];
    const text = charToDiscord(data);

    const exportPanel = document.getElementById('char-export-panel');
    const exportRaw   = document.getElementById('char-export-raw');
    const exportPreview = document.getElementById('char-export-preview');

    if (exportRaw)     exportRaw.value = text;
    if (exportPreview) exportPreview.innerHTML = renderDiscordPreview(text);
    if (exportPanel)   exportPanel.classList.remove('hidden');

    playSound(sfx.docOpen);
    addSystemLog(`Экспорт ${data.id || ''} → Discord`);
}

// ── ОБНОВИТЬ ЭКСПОРТ ИЗ ФОРМЫ СОЗДАНИЯ ──
function updateCharacterExportPreview() {
    if (typeof buildCharacterData !== 'function') return;
    const data = buildCharacterData();
    const text = charToDiscord(data);

    const exportRaw     = document.getElementById('char-export-form-raw');
    const exportPreview = document.getElementById('char-export-form-preview');

    if (exportRaw)     exportRaw.value = text;
    if (exportPreview) exportPreview.innerHTML = renderDiscordPreview(text);
}
