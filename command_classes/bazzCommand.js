//message.channel.send("My Bot's message", {files: ["https://i.imgur.com/XxxXxXX.jpg"]});

const Command = require('./command.js');

module.exports = class BazzCommand extends Command{
    constructor() {
        super();
    }

    match(msg) {
        return msg.content.toLowerCase().indexOf('--bazz') === 0;
    };
    
    handle(msg) {
        for(let i = 1; i <= 20; i++) {
            msg.channel.send(`./command_classes/bazz/baz-${i}.png`, {files: [`./command_classes/bazz/baz-${i}.png`]});
        //msg.channel.send("Bazz", {files: ['./command_classes/bazz/baz1.png']});
        }
        return;
    };
}
