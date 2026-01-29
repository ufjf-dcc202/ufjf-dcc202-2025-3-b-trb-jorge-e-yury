const levels = [
    {
        id: 1,
        width: 10, height: 10,
        map: [
            [0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,0,0,0,0],
            [0,1,0,0,0,1,0,0,0,0],
            [0,1,0,0,0,1,1,1,0,0],
            [0,1,1,0,0,0,0,1,0,0],
            [0,1,1,0,1,1,1,1,0,0],
            [0,0,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,2,0],
            [0,0,0,0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]
        ],
        start: { x: 1, y: 1, dir: 1 }
    },
    {
        id: 2,
        width: 6, height: 6,
        map: [
            [0,0,0,0,0,0],
            [0,1,1,1,1,0],
            [0,1,0,0,1,0],
            [0,1,2,2,1,0],
            [0,1,1,1,1,0],
            [0,0,0,0,0,0]
        ],
        start: { x: 1, y: 1, dir: 2 }
    },
    {
        id: 3,
        width: 6, height: 5,
        map: [
            [1,1,0,0,0,0],
            [0,1,1,0,0,0],
            [0,0,1,1,2,0],
            [0,0,0,1,1,0],
            [0,0,0,0,2,0]
        ],
        start: { x: 0, y: 0, dir: 1 }
    },
    {
        id: 4,
        width: 10, height: 10,
        map: [
            [0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,0,1,1,1,1,0],
            [0,1,0,1,0,1,0,0,1,0],
            [0,1,0,1,1,1,0,0,1,0],
            [0,1,0,0,0,1,0,1,1,0],
            [0,1,1,1,0,1,0,0,0,0],
            [0,0,0,1,0,1,1,1,1,0],
            [0,1,1,1,1,0,0,0,1,0],
            [0,1,0,0,1,1,1,0,1,0],
            [0,0,1,1,1,1,1,1,2,0]
        ],
        start: { x: 1, y: 1, dir: 1 }
    }
];

let currentLevelIdx = 0;
let level = levels[0];
let robot = { ...level.start };
let programs = { main: [], p1: [], p2: [] };
let activeBox = 'main';

let isRunning = false;
let isStepMode = false;
let stepTrigger = null;
let abortController = null;
let litTiles = []; 

function init() {
    loadLevel(currentLevelIdx);
}

function loadLevel(idx) {
    currentLevelIdx = idx;
    level = levels[idx];
    document.getElementById('level-indicator').innerText = idx + 1;
    closeModal();
    resetRobot();
}

function selectBox(boxName) {
    activeBox = boxName;
    document.querySelectorAll('.program-box').forEach(el => el.classList.remove('active'));
    document.getElementById(`box-${boxName}`).classList.add('active');
}

function addCmd(cmd) {
    if (isRunning) return;
    if (programs[activeBox].length >= 12) {
        alert("Máximo de 12 comandos por bloco!");
        return;
    }
    programs[activeBox].push(cmd);
    renderPrograms();
}

function removeLastCmd() {
    if (isRunning) return;
    programs[activeBox].pop();
    renderPrograms();
}

function clearAll() {
    if (isRunning) return;
    programs = { main: [], p1: [], p2: [] };
    renderPrograms();
    resetRobot();
}

const iconsMap = {
    fwd: '⬆️', left: 'E', right: 'D', jump: '🦘',
    light: '💡', p1: 'P1', p2: 'P2'
};

function renderPrograms() {
    ['main', 'p1', 'p2'].forEach(key => {
        const container = document.getElementById(`list-${key}`);
        container.innerHTML = '';
        programs[key].forEach((cmd, index) => {
            const div = document.createElement('div');
            div.className = 'cmd-icon';
            if (cmd === 'p1') div.style.backgroundColor = '#e67e22';
            if (cmd === 'p2') div.style.backgroundColor = '#8e44ad';
            div.innerText = iconsMap[cmd];
            div.id = `cmd-${key}-${index}`;
            container.appendChild(div);
        });
    });
}

function renderGridWithState() {
    const container = document.getElementById('grid-container');
    container.style.gridTemplateColumns = `repeat(${level.width}, 40px)`;
    container.innerHTML = '';

    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            const cellType = level.map[y][x];
            const div = document.createElement('div');
            div.classList.add('cell');
            
            if (cellType === 0) div.classList.add('empty');
            else if (cellType === 1) div.classList.add('tile');
            else if (cellType === 2) div.classList.add('blue');

            if (litTiles.some(t => t.x === x && t.y === y)) {
                div.classList.add('lit');
            }

            if (robot.x === x && robot.y === y) {
                const bot = document.createElement('div');
                bot.className = 'robot';
                bot.innerText = '🤖';
                const rotations = [0, 90, 180, 270];
                bot.style.transform = `rotate(${rotations[robot.dir]}deg)`;
                div.appendChild(bot);
            }
            container.appendChild(div);
        }
    }
}

function resetRobot() {
    robot = { ...level.start };
    litTiles = []; 
    document.getElementById('message-area').innerText = "";
    renderGridWithState();
}

function runFull() {
    if (isRunning && isStepMode) {
        isStepMode = false;
        if (stepTrigger) stepTrigger();
        return;
    }
    startExecution(false);
}

function runStep() {
    if (isRunning) {
        if (stepTrigger) stepTrigger();
    } else {
        startExecution(true);
    }
}

async function startExecution(stepMode) {
    if (isRunning) return;
    isRunning = true;
    isStepMode = stepMode;
    resetRobot();
    abortController = new AbortController();

    try {
        await executeList('main', abortController.signal, 0);
        checkWin();
    } catch (e) {
        if (e.message !== 'ABORT') console.error(e);
    } finally {
        isRunning = false;
        stepTrigger = null;
        document.querySelectorAll('.cmd-icon').forEach(el => el.classList.remove('running'));
    }
}

function stopGame() {
    if (abortController) abortController.abort('ABORT');
    isRunning = false;
    stepTrigger = null;
    resetRobot();
}

async function executeList(listName, signal, depth) {
    if (depth > 50) {
        alert("Erro: Recursão muito profunda");
        throw new Error('RECURSION_LIMIT');
    }

    const list = programs[listName];
    for (let i = 0; i < list.length; i++) {
        if (signal.aborted) throw new Error('ABORT');
        
        const cmd = list[i];
        const uiCmd = document.getElementById(`cmd-${listName}-${i}`);
        if (uiCmd) uiCmd.classList.add('running');

        if (isStepMode) {
            await new Promise(resolve => { stepTrigger = resolve; });
        } else {
            await new Promise(r => setTimeout(r, 400));
        }

        if (cmd === 'p1') await executeList('p1', signal, depth + 1);
        else if (cmd === 'p2') await executeList('p2', signal, depth + 1);
        else performAction(cmd);

        renderGridWithState();
        
        if (uiCmd) uiCmd.classList.remove('running');
        
        if (cmd === 'light') checkWin(true); 
    }
}

function performAction(cmd) {
    let nextX = robot.x;
    let nextY = robot.y;

    switch (cmd) {
        case 'left':
            robot.dir = (robot.dir + 3) % 4;
            break;
        case 'right':
            robot.dir = (robot.dir + 1) % 4;
            break;
        case 'fwd':
            if (robot.dir === 0) nextY--;
            if (robot.dir === 1) nextX++;
            if (robot.dir === 2) nextY++;
            if (robot.dir === 3) nextX--;

            if (isValidMove(nextX, nextY)) {
                robot.x = nextX;
                robot.y = nextY;
            }
            break;
        case 'jump':
            let jumpX = robot.x;
            let jumpY = robot.y;
            
            if (robot.dir === 0) jumpY -= 2;
            if (robot.dir === 1) jumpX += 2;
            if (robot.dir === 2) jumpY += 2;
            if (robot.dir === 3) jumpX -= 2;

            if (isValidMove(jumpX, jumpY)) {
                robot.x = jumpX;
                robot.y = jumpY;
            }
            break;
        case 'light':
            if (level.map[robot.y][robot.x] === 2) {
                const alreadyLit = litTiles.some(t => t.x === robot.x && t.y === robot.y);
                if (!alreadyLit) {
                    litTiles.push({x: robot.x, y: robot.y});
                }
            }
            break;
    }
}

function isValidMove(x, y) {
    if (x < 0 || x >= level.width || y < 0 || y >= level.height) return false;
    return level.map[y][x] !== 0;
}

function checkWin(silent = false) {
    let totalTargets = 0;
    level.map.forEach(row => row.forEach(cell => { if (cell === 2) totalTargets++; }));
    
    let litCount = 0;
    litTiles.forEach(tile => {
        if (level.map[tile.y][tile.x] === 2) litCount++;
    });

    const msg = document.getElementById('message-area');

    if (totalTargets > 0 && totalTargets === litCount) {
        if (!silent) {
            msg.innerText = "Fase Concluída!";
            msg.style.color = "#2ecc71";
            stopGame();
            showWinModal();
        }
    }
}

function showWinModal() {
    const modal = document.getElementById('win-modal');
    const nextBtn = document.getElementById('btn-next-level');
    
    modal.classList.remove('hidden');
    
    if (currentLevelIdx >= levels.length - 1) {
        nextBtn.style.display = 'none';
        document.querySelector('.modal-content h2').innerText = "🎉 Jogo Zerado!";
        document.querySelector('.modal-content p').innerText = "Parabéns, você completou todos os níveis.";
    } else {
        nextBtn.style.display = 'inline-block';
    }
}

function closeModal() {
    document.getElementById('win-modal').classList.add('hidden');
}

function nextLevel() {
    if (currentLevelIdx < levels.length - 1) {
        loadLevel(currentLevelIdx + 1);
        clearAll();
    }
}

init();