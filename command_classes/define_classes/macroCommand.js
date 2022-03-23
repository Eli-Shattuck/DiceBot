const Command = require('../command.js');
const DefineCommand = require('./defineCommand.js');
const responses = require('../../io_classes/responses.js');

module.exports = class MacroCommand extends Command {
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static match(msg){
        //console.log(msg.content.toLowerCase());
        for(let macro of DefineCommand.getMacros(msg.author))
            if(macro.match(msg)) {
                return true;
            }
        return false;
    };
    
    handle(msg){
        let found;
        for(let macro of DefineCommand.getMacros(msg.author))
            if(macro.match(msg)) {
                found = macro;
                break;
            }
        found.handle(msg);
    };
}