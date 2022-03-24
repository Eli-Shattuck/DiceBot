const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class LuisCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--luis');
    }

    handle(msg){
        let user = msg.guild.members.cache.random();
        this.push(responses.message(msg, `I love you ${user}! ~Luis ❤️`));
        return;
    };
}