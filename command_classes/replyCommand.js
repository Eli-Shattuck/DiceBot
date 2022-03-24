const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class ReplyCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--reply');
    }
    
    static match(msg){ 
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--reply ') === 0;
    };
    
    handle(msg){
        this.push(responses.reply(msg, msg.content.substring('--reply '.length)));
        return;
    };
}