const Command = require('../command.js');
const DefineCommand = require('./defineCommand.js');
const responses = require('../../io_classes/responses.js');

module.exports = class MacroCommand extends Command {
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static match(msg){
        //console.log(msg.content.toLowerCase());
        for(let macro of DefineCommand.getMacros(msg.author))
            if(DefineCommand.validate(msg.content, macro["name"])) {
                return true;
            }
        return false;
    };
    
    handle(msg){
        let found;
        for(let macro of DefineCommand.getMacros(msg.author))
            if(DefineCommand.validate(msg.content, macro["name"])) {
                found = macro;
                break;
            }
        
        if(!found){
            console.log("A macro has been matched in match but not found in handle.");
            return;
        }

        let f = new Function('args', 'dicebot', found["code"]);
        //console.log('argc: ' + argc);

        let matchRE = found["name"] + '\\s+(.+)'.repeat(isNaN(found["argc"]) ? 0 : found["argc"]);
            
        let args = msg.content.match(matchRE);
        args = args.splice(1, args.length) // only keep args
        //console.log(matchRE + " => " + args);
        try{
            f(args, {
                parse: (str) => { this.parse(str, msg); }
            });
        } catch (e) {
            this.push(responses.message(msg, `JS runtime error: [${e}]`));
        }
    };

    parse(str, message) {
        //console.log('parsing{\n'+str+"\n}");
        let oldContent = message.content;
        message.content = str;
        let Parser = require('../../parser.js');
        let p = new Parser(message);
        p.parse(); 
        message.content = oldContent;       
    }
}