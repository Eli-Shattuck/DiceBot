const Command = require('./command.js');

module.exports = class LuisCommand extends Command{
    constructor(){
        super();
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--luis') === 0;
    };
    
    handle(msg){
        let user = msg.guild.members.cache.random();
        msg.channel.send(`I love you ${user}! ~Luis ❤️`);

        return;
    };
}