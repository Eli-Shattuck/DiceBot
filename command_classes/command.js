const responses = require('../io_classes/responses.js');

module.exports = class Command{
    constructor(onNewResponse, cmdName){
        this.onNewResponse = onNewResponse;
        this.cmdName = cmdName;
    }

    static validate(content, name){
        return content.match(`^${name}(?:[\\s]+[\\S\\s]*|$)`);
    }

    match(msg){
        return Command.validate(msg.content, this.cmdName);
    }

    handle(msg){}

    error(msg, errMsg) {
        this.push( 
            responses.reply(msg, `${errMsg} Try --help for more info.`) 
        );
    }

    push(res) {
        this.onNewResponse(res);
    }
}