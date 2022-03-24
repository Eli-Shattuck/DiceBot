const responses = require('../io_classes/responses.js');

module.exports = class Command{
    constructor(onNewResponse, cmdName){
        this.onNewResponse = onNewResponse;
    }

    static getCmdName(){}

    static validate(content, name){
        return content.match(`^${name}(?:[\\s]+[\\S\\s]*|$)`);
    }

    static match(msg){}

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