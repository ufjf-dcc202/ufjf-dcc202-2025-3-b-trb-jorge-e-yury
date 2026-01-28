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