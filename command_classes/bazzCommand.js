//message.channel.send("My Bot's message", {files: ["https://i.imgur.com/XxxXxXX.jpg"]});

const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class BazzCommand extends Command{
    constructor(onNewResponse) {
        super(onNewResponse);
    }

    static match(msg) {
        return msg.content.toLowerCase().indexOf('--bazz') === 0;
    };
    
    handle(msg) {
        for(let i = 1; i <= 20; i++) {
            this.push(
                responses.message(
                    msg.channel, 
                    `./command_classes/bazz/baz-${i}.png`, 
                    {files: [`./command_classes/bazz/baz-${i}.png`]}
                )
            );
        //msg.channel.send("Bazz", {files: ['./command_classes/bazz/baz1.png']});
        }
        return;
    };
}
