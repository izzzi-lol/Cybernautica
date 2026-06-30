// --- CYBERNAUTICA CITY MAP MODULE ---

function expandNodes(nodeNames, padding) {
    return nodeNames.map(name => {
        const [x, y] = nodes[name];
        const dx = x - 500; const dy = y - 500;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const ratio = (dist + padding) / dist;
        return [500 + dx * ratio, 500 + dy * ratio];
    });
}

function calculateCentroid(pts) {
    let x = 0, y = 0;
    pts.forEach(p => { x += p[0]; y += p[1]; });
    return [x / pts.length, y / pts.length];
}

function buildMap() {
    if(typeof nodes === 'undefined') return;
    
    const outskirtsPts = expandNodes(baseOuterNodeNames, 40);
    const outskirtsPath = "M " + outskirtsPts.map(p => p.join(',')).join(' L ') + " Z";
    const mapOutskirts = document.getElementById('map-outskirts');
    if(mapOutskirts) mapOutskirts.innerHTML = `<path d="${outskirtsPath}" fill="rgba(30, 5, 5, 0.7)" stroke="rgba(220, 20, 20, 0.2)" stroke-width="2" stroke-dasharray="10,5"/><text x="180" y="200" fill="rgba(220, 20, 20, 0.3)" font-family="Oswald" font-size="28" transform="rotate(-45 180,200)" font-weight="bold" letter-spacing="10">ЗОНА ОТКЛЮЧЕНИЯ</text><text x="1000" y="200" fill="rgba(220, 20, 20, 0.3)" font-family="Oswald" font-size="28" transform="rotate(45 1000,200)" font-weight="bold" letter-spacing="10">ЗОНА ОТКЛЮЧЕНИЯ</text>`;

    const railsPts = expandNodes(baseOuterNodeNames, 100);
    const railsPath = "M " + railsPts.map(p => p.join(',')).join(' L ') + " Z";
    const mapRails = document.getElementById('map-rails');
    if(mapRails) mapRails.innerHTML = `<path d="${railsPath}" fill="none" stroke="rgba(220,20,20,0.2)" stroke-width="4"/><path d="${railsPath}" fill="none" stroke="rgba(220,20,20,0.8)" stroke-width="14" stroke-dasharray="4, 20"/>`;

    const cityPts = baseOuterNodeNames.map(n => nodes[n]);
    const cityPath = "M " + cityPts.map(p => p.join(',')).join(' L ') + " Z";
    let districtsSvg = `<path d="${cityPath}" fill="#0a0303" />`;

    districtDefinitions.forEach(dist => {
        const pts = dist.nodes.map(n => nodes[n]);
        const pathStr = "M " + pts.map(p => p.join(',')).join(' L ') + " Z";
        const centroid = calculateCentroid(pts);
        const hasBranch = activeBranches.includes(dist.id);
        
        districtsSvg += `<g class="district-group"><path class="district-path" d="${pathStr}" /><text class="district-label-letter" x="${centroid[0]}" y="${centroid[1] + 5}">${dist.id}</text><text class="district-label-num" x="${centroid[0]}" y="${centroid[1] + 20}">СЕКТОР ${dist.num}</text>${hasBranch ? `<image href="assets/logo_xana.png" xlink:href="assets/logo_xana.png" x="${centroid[0]-22}" y="${centroid[1]-65}" width="44" height="44" opacity="0.95" style="filter: drop-shadow(0 0 4px rgba(0,0,0,0.8));"/>` : ''}</g>`;
    });
    
    const mapContainer = document.getElementById('map-districts');
    if (mapContainer) {
        mapContainer.innerHTML = districtsSvg;
        document.querySelectorAll('.district-group').forEach(g => g.addEventListener('mouseenter', () => playSound(sfx.mapHover)));
    }
}

// Управление модальным окном карты
function setupMapControls() {
    const mapModal = document.getElementById('map-modal');
    const svgContainer = document.getElementById('svg-container');

    if(document.getElementById('btn-open-map')) {
        document.getElementById('btn-open-map').addEventListener('click', () => {
            playSound(sfx.click);
            addSystemLog('Радар карты сектора активирован');
            mapModal.classList.remove('hidden');
            
            setTimeout(() => { 
                mapModal.classList.remove('opacity-0');
                svgContainer.classList.remove('opacity-0');
                playSound(sfx.mapOpen);
                svgContainer.classList.add('window-open-active');
            }, 10);
        });
    }

    if(document.getElementById('btn-close-map')) {
        document.getElementById('btn-close-map').addEventListener('click', () => {
            playSound(sfx.click);
            mapModal.classList.add('opacity-0');
            svgContainer.classList.remove('window-open-active');
            setTimeout(() => { mapModal.classList.add('hidden'); }, 300);
        });
    }
}