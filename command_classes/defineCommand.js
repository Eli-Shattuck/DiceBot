const Command = require('./command.js');
const responses = require('../io_classes/responses.js');

let Parser = undefined;

let globalMacros = [];

module.exports = class DefineCommand extends Command {
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static pushMacro(user, macro) {
        console.log("push_macro: ", user.id);
        globalMacros.push(macro);
    }

    static getMacros(user) {
        console.log("get_macro: ", user.id);
        return globalMacros;
    }

    static getDefineRE() {
        return /--define\s+(--\S+)\s+(\d*)\s*{([\s\S]*)}/;
    } 
    
    static match(msg){
        //console.log(msg.content);
        return DefineCommand.validate(msg.content, '--define');
        //return msg.content.match(DefineCommand.getMatchRE());
    };
    
    handle(msg){
        let matchDefine = msg.content.match(DefineCommand.getDefineRE());

        //console.log(matchDefine);

        let macroName = matchDefine[1];
        
        let argc = matchDefine[2];
        argc = parseInt(argc);
        
        let code = matchDefine[3];
        
        let f = new Function('args', 'dicebot', code);
        //console.log('argc: ' + argc);

        let matchRE = macroName+'\\s+(.+)'.repeat(isNaN(argc) ? 0 : argc);
        DefineCommand.pushMacro(msg.author, 
            {match: (message) => DefineCommand.validate(message.content, macroName), 
            handle: (message) => {
                let args = message.content.match(matchRE);
                args = args.splice(1, args.length) // only keep args
                //console.log(matchRE + " => " + args);
                try{
                    f(args, {
                        parse: (str) => { this.parse(str, message); }
                    });
                } catch (e) {
                    this.push(responses.message(message, `JS runtime error: [${e}]`));
                }
            }}
        );

        return;
    };

    parse(str, message) {
        //console.log('parsing{\n'+str+"\n}");
        let oldContent = message.content;
        message.content = str;
        if(!Parser) Parser = require('../parser.js');
        let p = new Parser(message);
        p.parse(); 
        message.content = oldContent;       
    }
}