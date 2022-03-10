const Parser = require('../../parser.js');
const responses = require('../../io_classes/responses.js');
const { message } = require('prompt');

module.exports = class RollShortcutParser extends Parser{
    constructor(msg, shortcutCommand){
        super(msg);
        this.shortcutCommand = shortcutCommand;
        this.shortcutName;
        this.cmdType;
        this.dmgType;
    }

    parse(action){
        this.shortcutName = action.name;
        this.cmdType = action.cmdType;
        this.dmgType = action.dmgType;
        super.parse();
    }

    respond(response){
        let send = this.shortcutCommand.sentResponse ? responses.edit : responses.message;
        let msg = this.shortcutCommand.sentResponse ? this.shortcutCommand.sentResponse : response.msg;
        if(this.cmdType == 'attack'){
            let attackRoll = parseInt(response.content);
            if(isNaN(attackRoll)) return;
            this.shortcutCommand.push(
                send(
                    msg, 
                    `${this.shortcutCommand.creator}, ${this.shortcutName} rolled a ${attackRoll} for their attack!`, 
                    undefined,
                    message => {
                        this.shortcutCommand.sentResponse = message;
                    }
                )
            )
        } else if(this.cmdType == 'damage'){
            let damage = parseInt(response.content);
            if(isNaN(damage)) return;
            if(!this.dmgType) this.dmgType = ''; 
            this.shortcutCommand.push(
                send(
                    msg, 
                    `${this.shortcutCommand.creator}, ${this.shortcutName} deals ${damage} ${this.dmgType} damage!`, 
                    undefined,
                    message => {
                        this.shortcutCommand.sentResponse = message;
                    }
                )
            )
        } else if(this.cmdType == 'save'){
            this.shortcutCommand.push(
                send(
                    msg, 
                    `${this.shortcutCommand.creator}, ` + response.content, 
                    undefined,
                    message => {
                        this.shortcutCommand.sentResponse = message;
                    }
                )
            )
        } else {
            this.shortcutCommand.push(response);
        }
    }
}