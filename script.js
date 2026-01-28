const level = {
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
};

let robot = { ...level.start };
let programs = { main: [], p1: [], p2: [] };
let activeBox = 'main';

function renderGrid() {
    const container = document.getElementById('grid-container');
    container.style.gridTemplateColumns = `repeat(${level.width}, 50px)`;
    container.innerHTML = '';
    
    for(let y=0; y<level.height; y++) {
        for(let x=0; x<level.width; x++) {
            const type = level.map[y][x];
            const div = document.createElement('div');
            div.className = 'cell';
            
            if(type === 0) div.classList.add('empty');
            else {
                div.classList.add('tile');
                if(type === 2) div.classList.add('blue');
            }

            if (robot.x === x && robot.y === y) {
                const bot = document.createElement('div');
                bot.className = 'robot';
                bot.innerText = '🤖';
                const deg = [0, 90, 180, 270];
                bot.style.transform = `rotate(${deg[robot.dir]}deg)`;
                div.appendChild(bot);
            }
            container.appendChild(div);
        }
    }
}

renderGrid();

function selectBox(name) {
    activeBox = name;
    document.querySelectorAll('.program-box').forEach(el => el.classList.remove('active'));
    document.getElementById(`box-${name}`).classList.add('active');
}

function addCmd(cmd) {
    programs[activeBox].push(cmd);
    renderPrograms();
}

function removeLastCmd() {
    programs[activeBox].pop();
    renderPrograms();
}

function renderPrograms() {
    ['main', 'p1', 'p2'].forEach(key => {
        const div = document.getElementById(`list-${key}`);
        div.innerHTML = '';
        programs[key].forEach(c => {
            const span = document.createElement('span');
            span.className = 'cmd-icon';
            span.innerText = c === 'fwd' ? '⬆' : c.substring(0,2);
            div.appendChild(span);
        });
    });
}
let isRunning = false;

async function runGame() {
    if (isRunning) return;
    isRunning = true;
    resetRobot();
    await executeList('main');
    isRunning = false;
}

function resetRobot() {
    robot = { ...level.start };
    renderGrid();
}

async function executeList(listName) {
    const list = programs[listName];
    for (let i = 0; i < list.length; i++) {
        const cmd = list[i];
        await new Promise(r => setTimeout(r, 500));
        
        if (cmd === 'left') robot.dir = (robot.dir + 3) % 4;
        else if (cmd === 'right') robot.dir = (robot.dir + 1) % 4;
        else if (cmd === 'fwd') moveForward();
        
        renderGrid();
    }
}

function moveForward() {
    let nx = robot.x, ny = robot.y;
    if (robot.dir === 0) ny--;
    if (robot.dir === 1) nx++;
    if (robot.dir === 2) ny++;
    if (robot.dir === 3) nx--;
    
    if (nx >= 0 && nx < level.width && ny >= 0 && ny < level.height) {
        if (level.map[ny][nx] !== 0) {
            robot.x = nx;
            robot.y = ny;
        }
    }
}