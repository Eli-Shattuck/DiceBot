const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class ReplyCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static getCmdName(){
        return '--reply';
    }

    static match(msg){ 
        return msg.content.toLowerCase().indexOf('--reply ') === 0;
    };
    
    handle(msg){
        this.push(responses.reply(msg, msg.content.substring('--reply '.length)));
        return;
    };
}