const SudokuCommand = require("./sudokuCommand");

module.exports = [
    new (require('./ilyCommand.js'))(),
    new (require('./SudokuCommand.js'))(),
    new (require('./rollCommand.js'))(),
    new (require('./bazzCommand.js'))(),
    new (require('./timer_classes/timerCommand.js'))(),
]