const DefineCommand = require('./defineCommand.js');
const responses = require('../../io_classes/responses.js');
const client = require('../../clientSource.js');

module.exports = class MacroCommand extends DefineCommand {
    constructor(onNewResponse){
        super(onNewResponse);
    }

    match(msg){
        for(let macro of this.getMacros(msg.author)){
            if(MacroCommand.validate(msg.content, macro["Name"])) {
                return true;
            }
        }
        return false;
    };
    
    handle(msg){
        let found;
        for(let macro of this.getMacros(msg.author)){
            if(
                MacroCommand.validate(msg.content, macro["Name"]) &&
                msg.content.split(' ').length - 1 == macro["argc"]
            ) {
                found = macro;
                break;
            }
        }
        if(!found){
            console.log("A macro has been matched in match but not found in handle.");
            this.push(responses.reply("There was an unexpected error retrieving your macro."));
            return;
        }

        let f = new Function('args', 'dicebot', found["Code"]);

        let matchRE = found["Name"] + '\\s+(.+)'.repeat(isNaN(found["argc"]) ? 0 : found["argc"]);
            
        let args = msg.content.match(matchRE);
        args = args.splice(1, args.length) // only keep args
        try{
            f(args, {
                parse: (str, anchor) => { this.parseAnchor(str, msg, anchor); },
            });
        } catch (e) {
            this.push(responses.message(msg, `JS runtime error: [${e}]`));
        }
    };

    parseAnchor(str, message, anchorName) {
        if(anchorName){
            let saveChannel;
            let anchors = this.getAnchors(message.author);
            let anchor = anchors.find(elt => elt["Name"] == anchorName);
            if(anchor){
                saveChannel = message.channel;
                client.channels.fetch(anchor["ID"])
                    .then(ch => {
                        message.channel = ch;
                        this.parse(str, message);
                        message.channel = saveChannel;    
                    });
            } else {
                this.push(responses.reply(message, "You do not have a saved anchor with the given name."));
            }
        } else {
            this.parse(str, message);
        }
    }

    parse(str, message){
        let oldContent = message.content;
        message.content = str;
        let Parser = require('../../parser.js');
        let p = new Parser(message);
        p.parse(); 
        message.content = oldContent;
    }
}