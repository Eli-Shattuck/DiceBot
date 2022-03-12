const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

module.exports = class BazzCommand extends Command{
    constructor(onNewResponse) {
        super(onNewResponse);
    }

    static match(msg) {
        return BazzCommand.validate(msg.content, '--bazz');
    };
    
    handle(msg) {
        for(let i = 1; i <= 20; i++) {
            this.push(
                responses.message(
                    msg, 
                    `./command_classes/bazz/baz-${i}.png`, 
                    {files: [`./command_classes/bazz/baz-${i}.png`]}
                )
            );
        //msg.channel.send("Bazz", {files: ['./command_classes/bazz/baz1.png']});
        }
        return;
    };
}
