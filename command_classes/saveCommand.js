const Command = require('./command.js');


module.exports = class SaveCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--save')
    }

    handle(msg){
        let attatchments = msg.attatchments
    }
}