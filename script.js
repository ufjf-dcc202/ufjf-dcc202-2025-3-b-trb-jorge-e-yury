const levels = [
    {
        id: 1,
        width: 10,
        height: 10,
        map: [
            [0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,0,0,0,0],
            [0,1,0,0,0,1,0,0,0,0],
            [0,1,0,0,0,1,1,1,0,0],
            [0,1,1,0,0,0,0,1,0,0],
            [0,0,1,0,1,1,1,1,0,0],
            [0,0,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,2,0],
            [0,0,0,0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]
        ],
        start: { x: 1, y: 1, dir: 1 }
    },
    {
        id: 2,
        width: 6,
        height: 6,
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
        width: 6,
        height: 5,
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
        width: 12,
        height: 12,
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,0,1,1,1,1,1,0,0],
            [0,1,0,1,0,1,0,0,0,1,1,0],
            [0,1,0,1,1,1,0,1,0,0,1,0],
            [0,1,0,0,0,1,0,1,1,1,1,0],
            [0,1,1,1,0,1,0,0,0,0,1,0],
            [0,0,0,1,0,1,1,1,1,0,1,0],
            [0,1,1,1,1,0,0,0,1,0,1,0],
            [0,1,0,0,1,1,1,0,1,1,1,0],
            [0,1,1,0,0,0,1,0,0,0,1,0],
            [0,0,1,1,1,1,1,1,1,2,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0]
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
let abortController = null;

function init() {
    loadLevel(currentLevelIdx);
}

function loadLevel(idx) {
    currentLevelIdx = idx;
    level = levels[idx];
    document.getElementById('level-indicator').innerText = idx + 1;
    resetRobot();
    updateUI();
}

function selectBox(boxName) {
    activeBox = boxName;
    document.querySelectorAll('.program-box').forEach(el => el.classList.remove('active'));
    document.getElementById(`box-${boxName}`).classList.add('active');
}

function addCmd(cmd) {
    if (isRunning) return;
    if (programs[activeBox].length >= 12) return;
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
    fwd: '⬆️',
    left: '🔄E',
    right: '🔄D',
    jump: '🦘',
    light: '💡',
    p1: 'P1',
    p2: 'P2'
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

function renderGrid() {
    const container = document.getElementById('grid-container');
    container.style.gridTemplateColumns = `repeat(${level.width}, 50px)`;
    container.innerHTML = '';

    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            const cellType = level.map[y][x];
            const div = document.createElement('div');
            div.classList.add('cell');
            div.id = `cell-${x}-${y}`;

            if (cellType === 0) div.classList.add('empty');
            else if (cellType === 1) div.classList.add('tile');
            else if (cellType === 2) div.classList.add('blue');

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
    document.querySelectorAll('.lit').forEach(el => el.classList.remove('lit'));
    document.getElementById('message-area').innerText = "";
    renderGrid();
}

async function runGame() {
    if (isRunning) return;
    isRunning = true;
    resetRobot();
    abortController = new AbortController();

    try {
        await executeList('main', abortController.signal);
        checkWin();
    } catch {}
    finally {
        isRunning = false;
        document.querySelectorAll('.cmd-icon').forEach(el => el.classList.remove('running'));
    }
}

function stopGame() {
    if (abortController) abortController.abort();
    isRunning = false;
}

async function executeList(listName, signal) {
    const list = programs[listName];

    for (let i = 0; i < list.length; i++) {
        if (signal.aborted) throw new Error();
        const cmd = list[i];
        const uiCmd = document.getElementById(`cmd-${listName}-${i}`);
        if (uiCmd) uiCmd.classList.add('running');
        await new Promise(r => setTimeout(r, 500));

        if (cmd === 'p1') await executeList('p1', signal);
        else if (cmd === 'p2') await executeList('p2', signal);
        else performAction(cmd);

        renderGrid();
        if (uiCmd) uiCmd.classList.remove('running');
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
        case 'jump':
            if (robot.dir === 0) nextY--;
            if (robot.dir === 1) nextX++;
            if (robot.dir === 2) nextY++;
            if (robot.dir === 3) nextX--;

            if (isValidMove(nextX, nextY)) {
                robot.x = nextX;
                robot.y = nextY;
            }
            break;
        case 'light':
            if (level.map[robot.y][robot.x] === 2) {
                const cellDiv = document.getElementById(`cell-${robot.x}-${robot.y}`);
                if (cellDiv) cellDiv.classList.add('lit');
            }
            break;
    }
}

function isValidMove(x, y) {
    if (x < 0 || x >= level.width || y < 0 || y >= level.height) return false;
    return level.map[y][x] !== 0;
}

function checkWin() {
    let totalTargets = 0;
    level.map.forEach(row => row.forEach(cell => { if (cell === 2) totalTargets++; }));
    const litCount = document.querySelectorAll('.lit').length;
    const msg = document.getElementById('message-area');

    if (totalTargets > 0 && totalTargets === litCount) {
        msg.innerText = "🎉 FASE CONCLUÍDA! 🎉";
        msg.style.color = "#2ecc71";
        setTimeout(() => {
            if (currentLevelIdx < levels.length - 1) {
                loadLevel(currentLevelIdx + 1);
                clearAll();
            }
        }, 1000);
    } else {
        msg.innerText = "Tente novamente...";
        msg.style.color = "#e74c3c";
    }
}

init();
