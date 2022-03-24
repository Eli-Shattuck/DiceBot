const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class ReplyCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--reply');
    }

    match(msg){ 
        return msg.content.toLowerCase().indexOf(this.cmdName + ' ') === 0;
    };
    
    handle(msg){
        this.push(responses.reply(msg, msg.content.substring(this.cmdName.length+1)));
        return;
    };
}