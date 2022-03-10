const Parser = require('../../parser.js');
const responses = require('../../io_classes/responses.js');
const { message } = require('prompt');

module.exports = class RollShortcutParser extends Parser{
    constructor(msg, shortcutCommand){
        super(msg);
        this.shortcutCommand = shortcutCommand;
        this.cmdType = undefined;
    }

    parse(){
        this.cmdType = (this.msg.content.indexOf('--roll ') === 0);
        super.parse();
    }

    respond(response){
        if(this.cmdType){
            let damage = parseInt(response.content);
            if(isNaN(damage)) return;
            this.shortcutCommand.push(
                responses.reply(
                    response.msg, 
                    `Your action deals ${damage} damage!`, 
                    undefined,
                    message => {
                        this.shortcutCommand.sentResponse = message;
                    }
                )
            )
        } else {
            this.shortcutCommand.push(
                responses.reply(
                    response.msg, 
                    response.content, 
                    undefined,
                    message => {
                        this.shortcutCommand.sentResponse = message;
                    }
                )
            )
        }
    }
}