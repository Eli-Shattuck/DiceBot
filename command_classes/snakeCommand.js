const Command = require('./command.js');
const Discord = require('discord.js');

module.exports = class SnakeCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--sn ') === 0;
    };
    
    handle(msg){
        //console.log('-----NEW MESSAGE-----');
        msg.content = msg.content.substring('--sn '.length);
        const Snarser = require('./snarser.js');
        //console.log(Snarser);
        let s = new Snarser(msg);
        s.snarse();        
    };
}