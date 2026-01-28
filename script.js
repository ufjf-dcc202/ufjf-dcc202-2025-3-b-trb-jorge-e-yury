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
    ]
};

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
            container.appendChild(div);
        }
    }
}

renderGrid();