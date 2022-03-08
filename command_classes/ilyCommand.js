const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class ILYCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static match(msg){
        console.log(msg);
        return msg.content.toLowerCase().indexOf('--i love you') === 0;
    };
    
    handle(msg){
        this.push(responses.reply(msg, 'I love you too <3'));
        return;
    };
}