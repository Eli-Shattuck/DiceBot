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
        globalMacros.push(macro);
    }

    static getMacros() {
        return globalMacros;
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
        
        let f = new Function('args', '__parse', code);

        let matchRE = macroName+'\\s+(.+)'.repeat(isNaN(argc) ? 0 : argc);
        DefineCommand.pushMacro({match: (msg)=>msg.content.indexOf(macroName) === 0, handle: (msg) => {
            let args = msg.content.match(matchRE);
            args = args.splice(1, args.length) // only keep args
            console.log(matchRE + " => " + args);
            f(args, this.parse.bind(this));
        }});

        return;
    };

    parse(str) {
        console.log('parsing{\n'+str+"\n}");
        let oldContent = this.msg.content;
        this.msg.content = str;
        if(!Parser) Parser = require('../parser.js');
        let p = new Parser(this.msg);
        p.parse(); 
        this.msg.content = oldContent;       
    }
}