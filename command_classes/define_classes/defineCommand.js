const Command = require('../command.js');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const jsonHandler = require('../../io_classes/jsonHandler.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;

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
        let userMacros = jsonHandler.getObject(
            DefineCommand.getUserFilePath(user)
        );
        return userMacros ? userMacros.data : [];
    }

    static getDefineRE() {
        return /--define\s+(--\S+)\s+(\d*)\s*{([\s\S]*)}/;
    }
    
    static getDefineShowAllRE() {
        return /--define\s+show\s+all/;
    }

    static getDefineInspectRE() {
        return /--define\s+inspect\s+(--\S+)/;
    }

    static getDefineDeleteRE() {
        return /--define\s+delete\s+(--\S+)/;
    }
    
    static match(msg){
        //console.log(msg.content);
        return DefineCommand.validate(msg.content, '--define');
        //return msg.content.match(DefineCommand.getMatchRE());
    };
    
    handle(msg){
        let matchDefine = msg.content.match(DefineCommand.getDefineRE());
        let matchShowAll = msg.content.match(DefineCommand.getDefineShowAllRE());
        let matchInspect = msg.content.match(DefineCommand.getDefineInspectRE());
        let matchDelete = msg.content.match(DefineCommand.getDefineDeleteRE());
        if(matchDefine){
            this.defineNew(msg, matchDefine);
        } else if(matchShowAll) {
            this.showAll(msg);
        } else if(matchInspect) {
            this.inspectMacro(msg, matchInspect);
        } else if(matchDelete) {
            this.deleteMacro(msg, matchDelete);
        } else { 
            this.error(msg, "Your command did not match the expected format.");
            return;
        }
    };

    defineNew(msg, matchDefine){
        let macroName = matchDefine[1];
        
        let argc = matchDefine[2];
        argc = parseInt(argc);
        
        let code = matchDefine[3];
        
        this.pushMacro(msg, 
            {
                "name" : macroName,
                "argc" : argc,
                "code" : code
            }
        );
        return;
    }

    pushMacro(msg, newMacro) {
        let userMacros = DefineCommand.getMacros(msg.author);
        //console.log("UserMacros:", userMacros);
        for(let i in userMacros){
            //console.log("macro", macro, "\nnewMacro", newMacro);
            if(userMacros[i]["name"] == newMacro["name"]){
                this.push(
                    responses.reply(
                        msg, 
                        `You have an existing macro with the name ${newMacro["name"]}. Would you like to replace it?`,
                        undefined,
                        message => {
                            reactionHandler.addCallback(
                                [YES],
                                message,
                                (reaction, user) => {
                                    userMacros[i] = newMacro;
                                    let isErr = jsonHandler.saveObject(
                                        DefineCommand.getPlayerFilePath(msg.author), 
                                        {data: userMacros}
                                    );
                                    if(isErr){
                                        this.push(responses.reply(msg, "There was an error writing to your file."));
                                    } else {
                                        this.push(responses.reply(msg, "Your macro has been modified."));
                                    }
                                    reactionHandler.removeAllCallbacks(message); 
                                    message.delete();
                                    
                                }
                            )
                            reactionHandler.addCallback(
                                [STOP],
                                message,
                                (reaction, user) => {
                                    reactionHandler.removeAllCallbacks(message); 
                                    message.delete();
                                    this.push(responses.reply(msg, "Your macro has not been changed."));
                                }
                            );
                            reactionHandler.addReactions([YES, STOP], message);
                        }
                    )
                );
                return;
            }
        }
        //console.log("newMacro: ", JSON.stringify(newMacro));
        userMacros.push(newMacro);
        let isErr = jsonHandler.saveObject(
            DefineCommand.getPlayerFilePath(msg.author), 
            {data: userMacros}
        );
        if(isErr){
            this.push(responses.reply(msg, "There was an error writing to your file."));
        } else {
            this.push(responses.reply(msg, "Your macro has been stored."));
        }        
    }

    showAll(msg){
        let userMacros = DefineCommand.getMacros(msg.author);
        let toWrite = "You have the following macros:";
        for(let macro of userMacros){
            toWrite += `\n${macro["name"]}`;
        }
        toWrite += "\nYou can inspect any of these macros by typing --define inspect `macroName`, or delete it with --define delete `macroName`"
        this.push(responses.reply(msg, toWrite));
    }

    inspectMacro(msg, matchInspect){
        let macroName = matchInspect[1];
        let userMacros = DefineCommand.getMacros(msg.author);
        let found;
        for(let macro of userMacros){
            if(macro["name"] == macroName){
                found = macro;
                break;
            }
        }
        if(!found){
            this.push(responses.reply(msg, "You do not have a macro with that name. Try --define show all to see your macros."));
            return;
        }

        let num = isNaN(parseInt(found["argc"])) ? 0 : found["argc"];
        let toWrite = `Your macro ${found["name"]} takes ${num} arguments, and runs the following code:\n`;
        toWrite += `\`\`\`${found["code"]}\`\`\``;
        this.push(responses.reply(msg, toWrite));
    }

    deleteMacro(msg, matchDelete){
        let toDelete = matchDelete[1];
        let userMacros = DefineCommand.getMacros(msg.author);
        let initialLen = userMacros.length;
        if(initialLen > 0){
            for(let i = 0; i < initialLen; i++){
                if(userMacros[i]["name"] == toDelete){
                    userMacros.splice(i, 1);
                    break;
                }
            }
            if(userMacros.length == initialLen){
                this.push(
                    responses.reply(msg, `You have no existing macros with the name "${toDelete}".`)
                )
            } else {
                let isErr = jsonHandler.saveObject(
                    DefineCommand.getPlayerFilePath(msg.author), 
                    {data: userMacros}
                );
                if(isErr){
                    this.push(responses.reply(msg, "There was an error writing to your file."));
                } else {
                    this.push(responses.reply(msg, `Your macro ${toDelete} was successfully deleted.`));
                }
            }
        } else {
            this.push(
                responses.reply(msg, 'You have no existing shortcuts')
            )
        }
    }
}