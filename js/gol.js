
const height = 200;
const width = 200;
const zoom = 3;
const max_T = 2000;
const pause = 0;


// arrays containing current and next statuses for each cell
let curr_board = Array(height).fill().map(() => Array(width).fill(0));
let next_board = Array(height).fill().map(() => Array(width).fill(0));

// utility function for loading a pattern defined as a smaller 2d array into curr_board
let load_pattern = ({pattern, offset_row, offset_col}) => {
    pattern.forEach(
	(row, i) => {
	    row.forEach((cell, j) => {
		curr_board[(i+offset_row+height)%height][(j+offset_col+width)%width] = cell;
	    });
	});
};

// count neighbors of a given cell
let count_neighbors = (i, j) => {
    return curr_board[(i-1+height) % height][(j-1+width) % width]
	+ curr_board[(i-1+height) % height][(j+width) % width]
	+ curr_board[(i-1+height) % height][(j+1+width) % width]
	+ curr_board[(i+height) % height][(j-1+width) % width]
	+ curr_board[(i+height) % height][(j+1+width) % width]
	+ curr_board[(i+1+height) % height][(j-1+width) % width]
	+ curr_board[(i+1+height) % height][(j+width) % width]
	+ curr_board[(i+1+height) % height][(j+1+width) % width]; };

// computes the next status for a given cell
let evolve_cell = (i,j) => {
    let neighbours = count_neighbors(i,j) ;
    if ((curr_board[i][j] == 0) && (neighbours == 3)) return Math.min(curr_board[i][j] + 1, 1);
    else if ((curr_board[i][j] != 0) && (neighbours != 2) && (neighbours != 3)) return Math.max(curr_board[i][j] - 1, 0);
    else return curr_board[i][j]; 
};

// evolve the whole board, store the temporary results into next_board and then copies it back into curr_board
let evolve = () => {
    curr_board.forEach((row, i) => {
	row.forEach((cell, j) => {
	    next_board[i][j] = evolve_cell(i,j);
	});
    });
    next_board.forEach((row,i) => {
	row.forEach((cell, j) => {
	    curr_board[i][j] = next_board[i][j];
	});
    });
};


// select svg element
let svg = d3.select('body') 
    .select('svg')
    .attrs({width:width*zoom, height: height*zoom});

// clears svg and show board
let show = () => {
    return Promise.resolve()
	.then(() => { // reset svg
	    return svg.selectAll('*').remove(); })
	.then(() => { // filter out dead cells
	    return curr_board 
		     .map((row,i) => {return row.map((val, j) => {return {val:val, row: i, col: j};});})
		     .flat()
		     .filter(cell => cell.val !== 0 );})
	.then(data => {
	    // code below works without filtering dead cells
	    // svg.selectAll('g')
	    // 	.data(curr_board)
	    // 	.enter().append('g')
	    // 	.selectAll('rect')
	    // 	.data((row,i) => {return row.map(cell => {return {val:cell, row: i};}) ;})
	    // 	.enter().append('rect')
	    // 	.attr("x", (cell, j) => {return j * zoom;})
	    // 	.attr("y", (cell, j) => {return cell.row * zoom;})
	    // 	.attrs({width:10, height:10})
	    // 	.attr("fill", (cell,j) => {if (cell.val == 0) {return 'blue';} else {return 'yellow';};});

	    // code working for creating black rects for live cells only
	    return svg.selectAll('rect')
		.data(data)
		.enter().append('rect')
		.attr('x', cell => cell.col * zoom)
		.attr('y', cell => cell.row * zoom)
		.attr('fill', 'black')
		.attrs({width:zoom, height:zoom});
	});
};

// delays a function
let delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// loop (wait, show current_board, evolve)
let loop = (t) => {return delay(pause)
		   .then(show)
		   .then(evolve)
		   .then(() => {console.log(t); return t+1;}) ;};

const line_10 = {
    pattern: [[1,1,1,1,1,1,1,1,1,1]],
    offset_row: 50,
    offset_col: 45
};

const route = {
    pattern: [[1,0,1,0,0,0,0,0],
	      [0,0,1,0,0,0,0,0],
	      [0,0,0,0,1,0,0,0],
	      [0,0,0,0,1,0,1,0],
	      [0,0,0,0,1,0,1,1],
	      [0,0,0,0,0,0,1,0]],
    offset_row: Math.floor(height/2),
    offset_col: Math.floor(width/2)
};

const canon = {
    pattern: [[0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
	      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
	      [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
	      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
	      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
	      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]],
    offset_row: Math.floor(height/2),
    offset_col: Math.floor(width/2)
};

const glider = {
    pattern: [[1,0,0],
	      [1,0,1],
	      [1,1,0]],
    offset_row: Math.floor(height/2),
    offset_col: Math.floor(width/2)
};

const spaceship_1 = {
    pattern: [[0,1,1,1,1],
	      [1,0,0,0,1],
	      [0,0,0,0,1],
	      [1,0,0,1,0]],
    offset_row: Math.floor(height/2),
    offset_col: Math.floor(width/2)
};

const spaceship_2 = {
    pattern: [[1,1,0,0,1,1,0,0,0,0,0],
	      [0,0,0,0,0,1,1,0,0,0,0],
	      [0,0,1,1,0,1,0,0,0,0,0],
	      [0,0,1,0,0,0,0,0,0,1,0],
	      [0,0,0,0,0,0,0,0,0,1,0],
	      [0,0,0,1,0,0,0,0,0,0,1],
	      [0,0,0,0,1,0,1,0,1,1,0],
	      [1,0,1,0,0,0,0,0,1,1,0],
	      [1,1,1,1,1,1,1,1,0,0,0]],
    offset_row: Math.floor(height/2),
    offset_col: Math.floor(width/2)
};

const spaceship_3 = {
    pattern: [[1,1,0,0,1,1,0,0,0,0,0],
	      [0,0,0,0,0,1,1,0,0,0,0],
	      [0,0,1,1,0,1,0,0,0,0,0],
	      [0,0,1,0,0,0,0,0,0,1,0],
	      [0,0,0,0,0,0,0,0,0,1,0],
	      [0,0,0,1,0,0,0,0,0,0,1],
	      [0,0,0,0,1,0,1,0,1,1,0],
	      [1,0,1,0,0,0,0,0,1,1,0],
	      [1,1,1,1,1,1,1,1,0,0,0],
	      [0,0,0,0,0,0,0,0,0,0,0],
	      [1,1,1,1,1,1,1,1,0,0,0],
	      [1,0,1,0,0,0,0,0,1,1,0],
	      [0,0,0,0,1,0,1,0,1,1,0],
	      [0,0,0,1,0,0,0,0,0,0,1],
	      [0,0,0,0,0,0,0,0,0,1,0],
	      [0,0,1,0,0,0,0,0,0,1,0],
	      [0,0,1,1,0,1,0,0,0,0,0],
	      [0,0,0,0,0,1,1,0,0,0,0],
	      [1,1,0,0,1,1,0,0,0,0,0]],
    offset_row: Math.floor(height/2),
    offset_col: Math.floor(width/2)
};

// load_pattern(line_10);
load_pattern(spaceship_3);

Array(max_T)
    .fill(0)
    .reduce((p,f) => p.then(i => {return loop(i);}), Promise.resolve(0));
