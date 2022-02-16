const Command = require('./command.js');

module.exports = class ILYCommand extends Command{
    constructor(){
        super();
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--i love you') === 0;
    };
    
    handle(msg){
        msg.reply('I love you too <3');
        return;
    };
}