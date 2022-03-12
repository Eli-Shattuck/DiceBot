const Command = require('./command.js');
const Discord = require('discord.js');

module.exports = class SnakeCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static match(msg){
        //console.log(msg.content.toLowerCase());
        return SnakeCommand.validate(msg.content, '--sn');
    };
    
    handle(msg){
        //console.log('-----NEW MESSAGE-----');
        msg.content = msg.content.substring('--sn '.length).trim();
        const Snarser = require('./snarser.js');
        //console.log(Snarser);
        let s = new Snarser(msg, this);
        s.snarse();        
    };
}