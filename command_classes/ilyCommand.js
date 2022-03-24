const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class ILYCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }
                
    static getCmdName(){
        return '--i love you';
    }

    static match(msg){
        return ILYCommand.validate(msg.content.toLowerCase(), '--i love you');
    }
    
    handle(msg){
        this.push(responses.reply(msg, 'I love you too <3'));
        return;
    }
}