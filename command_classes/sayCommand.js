const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class SayCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--say');
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf(this.cmdName) === 0;
    };
    
    handle(msg){
        this.push(responses.message(msg, msg.content.substring(this.cmdName.length+1)));
        return;
    };
}