const SudokuCommand = require("./sudokuCommand");

module.exports = [
    new (require('./ilyCommand.js'))(),
    new (require('./SudokuCommand.js'))(),
    new (require('./rollCommand.js'))(),
    new (require('./bazzCommand.js'))(),
    new (require('./timer_classes/timerCommand.js'))(),
    new (require('./timer_classes/combatTimerCommand.js'))(),
    new (require('./luisCommand.js'))(),
    new (require('./helpCommand.js'))(),
    new (require('./rubiksCubeCommand.js'))(),
    new (require('./snakeCommand.js'))(),
    new (require('./replyCommand.js'))(),
    new (require('./sayCommand.js'))(),
]