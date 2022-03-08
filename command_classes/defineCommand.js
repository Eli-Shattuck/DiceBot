const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

let Parser = undefined;

module.exports = class DefineCommand extends Command {
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static getDefineRE() {
        return /--define\s+(--\S+)\s+(\d)*\s*{([\s\S]*)}/;
    } 
    
    static match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.indexOf('--define') === 0;
    };
    
    handle(msg){
        let matchDefine = msg.content.match(DefineCommand.getDefineRE());

        let macroName = matchDefine[1];
        
        let argc = matchDefine[2];
        argc = parseInt(argc);
        
        let code = matchDefine[3];

        let args = ['1', '2'];
        let f = new Function('args', '__parse', code + ';console.log("test");');

        this.push(responses.reply(msg, 'running\n'+code));

        f(args, DefineCommand.parse);

        return;
    };

    static parse(str) {
        if(!Parser) Parser = require('../parser.js');
        let p = new Parser(str);
        p.parse();        
    }
}