const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class SayCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static getCmdName(){
        return '--say';
    }

    static match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--say') === 0;
    };
    
    handle(msg){
        this.push(responses.message(msg, msg.content.substring('--say '.length)));
        return;
    };
}