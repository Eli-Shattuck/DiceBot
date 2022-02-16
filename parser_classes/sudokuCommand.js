const Command = require('./command.js');

module.exports = class SudokuCommand extends Command {
    
    constructor() {
      super();
      this.nums = '🟦 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣'.split(' ');
      this.nums[-1] = '⬛';
      // let this.nums = `   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 `.split('|');
      // this.nums[-1] = '###';
    }

    static getSudokuRe(){
      return /(((\d\s*){9})[\n\r]+){8}(((\d\s*){9})[\n\r]*){1}/;
    }

    match(msg){
        return msg.content.match(SudokuCommand.getSudokuRe()); //regex match
    }

    handle(msg){
        let grid = this.sanitizeInput(msg.content);
        if(this.solveGrid(grid)){
          msg.reply(this.toStringGrid(grid));
        } else {
          msg.reply('no solution exists'); 
        }	
        return;
    }

     //TODO: deal with slow unsolvable grids
    solveGrid(grid) { 
      for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
          if(grid[i][j] == 0) {
            for(let n = 1; n <= 9; n++) {
              if(this.canPlace(grid, i, j, n)) {
                grid[i][j] = n;
                if(this.solveGrid(grid)) return true;     
                grid[i][j] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    }
  
    canPlace(grid, i, j, n) {
      for(let x = 0; x < 9; x++) { 
        if(grid[i][x] == n) return false; 
        if(grid[x][j] == n) return false;
      }
      let iOff = Math.floor(i/3)*3;
      let jOff = Math.floor(j/3)*3;
  
      for(let i = iOff; i < iOff+3; i++) {
        for(let j = jOff; j < jOff+3; j++) {
          if(grid[i][j] == n) return false; 
        }
      }
      return true;
    }
  
    checkGrid(grid) {
      //check all 3x3 subgrids
      for(let iOff = 0; iOff < 9; iOff += 3) {
        for(let jOff = 0; jOff < 9; jOff += 3) {
          let cells = new Set();
          for(let i = iOff; i < iOff+3; i++) {
            for(let j = jOff; j < jOff+3; j++) {
              cells.add(grid[i][j]);
            }
          }
          if(!check9Cells(cells)) return false;
        }
      }
  
      //check all rows and cols
      for(let i = 0; i < 9; i++) {
        let cCells = new Set();
        let rCells = new Set();
        for(let j = 0; j < 9; j++) {
          cCells.add(grid[i][j]);
          rCells.add(grid[j][i]);
        }
        if(!check9Cells(cCells)) return false;
        if(!check9Cells(rCells)) return false;
      }
      return true;
    }
  
    check9Cells(cells) {
      if(cells.has(0) || cells.size!=9) {
        return false;
      } else {
        return true;
      }
    }

    sanitizeInput(unclean){
      let clean = unclean.replace(/\s/g, '');
      let grid = [
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
      ];
    
      let k = 0;
      for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
          grid[i][j] = clean[k++];
        }
      }
      return grid;
    }
  
    toStringGrid(grid) {
      let s = '';
      for(let i = 0; i < 9; i++) {
        s += (i % 3 == 0 ? ('\n'+this.nums[-1].repeat(13)+'\n') : '\n');
        for(let j = 0; j < 9; j++) {
          s += (j % 3 == 0 ? this.nums[-1] : '') + this.nums[grid[i][j]] + (j == 8 ? this.nums[-1] : '');
        }
      }
      s += '\n'+this.nums[-1].repeat(13);
      return s;
    }
  }
  