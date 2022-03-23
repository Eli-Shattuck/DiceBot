const Command = require('../command.js');
const responses = require('../../io_classes/responses.js');
const fs = require('fs');

let Parser = undefined;

let globalMacros = [];

module.exports = class DefineCommand extends Command {
    constructor(onNewResponse){
        super(onNewResponse);
    }

    static getUserFilePath(user){
        return `./command_classes/define_classes/define_data/user${user.id}.json`;
    }

    static getMacros(user) {
        let filePath = DefineCommand.getUserFilePath(user);
        let userMacros = [];
        try{
            userMacros = JSON.parse(
                fs.readFileSync(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        throw err;
                    }
                })
            ).data;
        } catch(err) {
            console.log(`No existing files were found for user "${user.username}", ID: ${user.id}.`);
        }

        return userMacros;
    }

    pushMacro(msg, newMacro) {
        let userMacros = DefineCommand.getMacros(msg.author);
        for(let macro in userMacros){
            if(macro.name == newMacro.name){
                this.push(
                    responses.reply(msg, "You have an existing macro with that name.")
                );
                return;
            }
        }
        console.log("newMacro: ", JSON.stringify(newMacro));
        userMacros.push(newMacro);
        try{
            let toWrite = JSON.stringify({data: userMacros});
            fs.writeFileSync(
                DefineCommand.getUserFilePath(msg.author), 
                toWrite
            );
        } catch(err) {
            console.log('There was an error trying to write to the file.', err);
            return;
        }
        console.log("User macros successfully updated.");
        this.push(
            responses.reply(msg, "Your macro has been stored.")
        );
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

        if(!matchDefine){
            this.error(msg, "Your command did not match the expected format.");
            return;
        }
        //console.log(matchDefine);

        let macroName = matchDefine[1];
        
        let argc = matchDefine[2];
        argc = parseInt(argc);
        
        let code = matchDefine[3];
        
        let f = new Function('args', 'dicebot', code);
        //console.log('argc: ' + argc);

        let matchRE = macroName+'\\s+(.+)'.repeat(isNaN(argc) ? 0 : argc);
        this.pushMacro(msg, 
            {   name: macroName,
                match: (message) => DefineCommand.validate(message.content, macroName), 
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
                }
            }
        );

        return;
    };

    parse(str, message) {
        //console.log('parsing{\n'+str+"\n}");
        let oldContent = message.content;
        message.content = str;
        if(!Parser) Parser = require('../../parser.js');
        let p = new Parser(message);
        p.parse(); 
        message.content = oldContent;       
    }
}