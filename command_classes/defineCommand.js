const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

let Parser = undefined;

let globalMacros = [];

module.exports = class DefineCommand extends Command {
    constructor(onNewResponse){
        super(onNewResponse);
        this.msg;
    }

    static pushMacro(macro) {
        globalMacros;
    }

    static getDefineRE() {
        return /--define\s+(--\S+)\s+(\d)*\s*{([\s\S]*)}/;
    } 
    
    static match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.indexOf('--define') === 0;
    };
    
    handle(msg){
        this.msg = msg;
        let matchDefine = msg.content.match(DefineCommand.getDefineRE());

        let macroName = matchDefine[1];
        
        let argc = matchDefine[2];
        argc = parseInt(argc);
        
        let code = matchDefine[3];

        //let args = ['1', '2'];
        let f = new Function('args', '__parse', code);

        //f(args, this.parse.bind(this));

        return;
    };

    parse(str) {
        //console.log('parsing\n'+str);
        let oldContent = this.msg.content;
        this.msg.content = str;
        if(!Parser) Parser = require('../parser.js');
        let p = new Parser(this.msg);
        p.parse(); 
        this.msg.content = oldContent;       
    }
}