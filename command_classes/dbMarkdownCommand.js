const Command = require('./command.js');
const responses = require('../io_classes/responses.js');
const doMarkdown = require('../io_classes/db-markdown/markdown.js');

module.exports = class DBMarkdownCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--db-markdown');
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf(this.cmdName) === 0;
    };
    
    handle(msg){
        let content = msg.content.substring(this.cmdName.length+1);
        content = doMarkdown(content);
        if(content === null) {
            this.error(msg, "Formatting error")
        }
        console.log(content);
        this.push(responses.message(msg, content));
        return;
    };
}