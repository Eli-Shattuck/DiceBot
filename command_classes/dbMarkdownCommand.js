const Command = require('./command.js');
const responses = require('../io_classes/responses.js');
const doMarkdown = require('../io_classes/db-markdown/markdown.js');

/*
          0       /   1
    0 sans-serif  /  serif
    1 bold        /   not
    2 italic      /   not
    3 cal         /   not
    4 fraktur     /   not
    5 mono        /   not
    6 bb          /   not
*/

module.exports = class DBMarkdownCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--db-markdown');
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf(this.cmdName + ' ') === 0;
    };
    
    handle(msg){
        let content = msg.content.substring(this.cmdName.length+1);
        let res = doMarkdown(content);
        console.log("res", res);
        if(!res.sucsess) {
            this.error(msg, res.msg);
            return;
        }
        //console.log(res.val);
        this.push(responses.message(msg, res.val));
        return;
    };
}