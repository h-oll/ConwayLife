import logging
from pathlib import Path
import csv
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time

logging.basicConfig(format='%(asctime)s | %(name)s | %(levelname)s | %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

def create_board(col_length, row_length):
    board =  np.zeros((col_length, row_length))
    return board

def load_pattern(filename, offset_x, offset_y, board):
    with Path(filename).open() as file:
        col_length, row_length = board.shape
        csvfile = csv.reader(file, delimiter=',')
        row_index = 0
        for row in csvfile:
            col_index = 0
            for cell in row:
                if ((row_index + offset_y) >= col_length) or ((col_index + offset_x) >= row_length):
                    logger.warn('Wraping pattern at load')
                board[(row_index + offset_y) % col_length, (col_index + offset_x) % row_length] = cell
                col_index = col_index + 1
            row_index = row_index + 1

def load_pattern_x_flip(filename, offset_x, offset_y, board):
    with Path(filename).open() as file:
        col_length, row_length = board.shape
        csvfile = csv.reader(file, delimiter=',')
        row_index = 0
        for row in csvfile:
            col_index = 0
            for cell in row:
                if ((row_index + offset_y) >= col_length) or ((-col_index + offset_x) >= row_length):
                    logger.warn('Wraping pattern at load')
                board[(row_index + offset_y) % col_length, (-col_index + offset_x) % row_length] = cell
                col_index = col_index + 1
            row_index = row_index + 1

            
def count_neighbors(x, y, board):
    col_length, row_length = board.shape
    counter = 0
    for i in range(-1, 2):
        for j in range(-1, 2):
            counter = counter + board[(y + j) % col_length, (x + i) % row_length]
    counter = counter - board[y, x]
    return counter

def evolve_cell(x, y, board):
    neighbors = count_neighbors(x, y, board) 
    if board[y, x] == 0 and (neighbors == 3): return board[y, x] + 1
    if board[y, x] != 0 and (not neighbors in [2, 3]): return max(0, board[y, x] - 1)
    else: return board[y,x]

def evolve(old_board, new_board):
    col_length, row_length = old_board.shape
    #evolved_board = create_board(col_length, row_length)
    for y in range(0, col_length):
        for x in range(0, row_length):
            new_board[y, x] = evolve_cell(x, y, old_board)
            
#print(create_board(3,6))
fig = plt.figure(dpi=400) # https://stackoverflow.com/questions/25385216/python-real-time-varying-heat-map-plotting
#ax = fig.add_subplot(1,1,1)
old_board = create_board(200, 200)
new_board = np.copy(old_board)
# load_pattern('./blinker.csv', 1, 2, board)
# load_pattern('./10line.csv', 50, 50, board)
# load_pattern('./truc.csv', 250, 250, board)
# load_pattern('./spaceship.csv', 50, 50, board)
# load_pattern('./glider.csv', 50, 50, board)
# load_pattern('./canon.csv', 100, 100, board)
# load_pattern('./route.csv', 150, 150, board)
# load_pattern('./15line.csv', 100, 92, board)
# load_pattern('./16line.csv', 100, 92, old_board)
# load_pattern('./canon.csv', 50, 150, old_board)
# load_pattern_x_flip('./canon.csv', 149, 150, old_board)
# load_pattern('./spaceinvader.csv', 100, 100, old_board)
load_pattern('./spaceship3.csv', 20, 100, old_board)
im = plt.imshow(old_board, cmap='hot', animated=True)
#im = ax.imshow(board, cmap='hot')
plt.show(block=False)

for i in range(1500):
    logger.info(f'Iteration: {i}')
    #time.sleep(.1)
    evolve(old_board, new_board)
    old_board = np.copy(new_board)
    im.set_array(old_board)
    fig.canvas.draw()
    
#anim = animation.FuncAnimation(fig,animate)

