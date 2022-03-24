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

    static getCmdName(){
        return '--define';
    }

    static match(msg){
        return DefineCommand.validate(msg.content, DefineCommand.getCmdName());
    };

    static getUserFilePath(user){
        return `./command_classes/define_classes/define_data/user${user.id}.json`;
    }

    static getMacros(user){
        let userObject = jsonHandler.getObject(
            DefineCommand.getUserFilePath(user)
        );
        return userObject ? userObject.macros : [];
    }

    static getAnchors(user){
        let userObject = jsonHandler.getObject(
            DefineCommand.getUserFilePath(user)
        );
        return userObject ? userObject.anchors : [];
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

    static getDefineAnchorRE() {
        return /--define\s+anchor\s+(\S+)/;
    }

    static getDefineShowAnchorsRE() {
        return /--define\s+show\s+anchors/;
    }

    static getDefineDeleteAnchorRE() {
        return /--define\s+deleteanchor\s+(\S+)/;
    }
    
    handle(msg){
        let matchDefine = msg.content.match(DefineCommand.getDefineRE());
        let matchShowAll = msg.content.match(DefineCommand.getDefineShowAllRE());
        let matchInspect = msg.content.match(DefineCommand.getDefineInspectRE());
        let matchDelete = msg.content.match(DefineCommand.getDefineDeleteRE());
        let matchAnchor = msg.content.match(DefineCommand.getDefineAnchorRE());
        let matchShowAnchors = msg.content.match(DefineCommand.getDefineShowAnchorsRE());
        let matchDeleteAnchor = msg.content.match(DefineCommand.getDefineDeleteAnchorRE());
        
        if(matchDefine){
            this.defineNew(msg, matchDefine);
        } else if(matchShowAll) {
            this.showAll(msg);
        } else if(matchInspect) {
            this.inspectMacro(msg, matchInspect);
        } else if(matchDelete) {
            this.deleteMacro(msg, matchDelete);
        } else if(matchAnchor) {
            this.addAnchor(msg, matchAnchor);
        } else if(matchShowAnchors) {
            this.showAnchors(msg);
        } else if(matchDeleteAnchor) {
            this.deleteAnchor(msg, matchDeleteAnchor);
        } else { 
            this.error(msg, "Your command did not match the expected format.");
            return;
        }
    };

    defineNew(msg, matchDefine){
        let macroName = matchDefine[1];
        
        let argc = matchDefine[2] ? matchDefine[2] : 0;
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
            if(userMacros[i]["name"] == newMacro["name"] && userMacros[i]["argc"] == newMacro["argc"]){
                this.push(
                    responses.reply(
                        msg, 
                        `You have an existing macro with the name ${newMacro["name"]} and argc ${newMacro["argc"]}. Would you like to replace it?`,
                        undefined,
                        message => {
                            reactionHandler.addCallback(
                                [YES],
                                message,
                                (reaction, user) => {
                                    userMacros[i] = newMacro;
                                    let isErr = jsonHandler.saveObject(
                                        DefineCommand.getUserFilePath(msg.author), 
                                        {
                                            macros: userMacros,
                                            anchors: DefineCommand.getAnchors(msg.author)
                                        }
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
            DefineCommand.getUserFilePath(msg.author), 
            {
                macros: userMacros,
                anchors: DefineCommand.getAnchors(msg.author)
            }
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
                    DefineCommand.getUserFilePath(msg.author), 
                    {
                        macros: userMacros,
                        anchors: DefineCommand.getAnchors(msg.author)
                    }
                );
                if(isErr){
                    this.push(responses.reply(msg, "There was an error writing to your file."));
                } else {
                    this.push(responses.reply(msg, `Your macro ${toDelete} was successfully deleted.`));
                }
            }
        } else {
            this.push(
                responses.reply(msg, 'You have no existing macros')
            )
        }
    }

    addAnchor(msg, matchAnchor){
        let anchorName = matchAnchor[1];
        let userAnchors = DefineCommand.getAnchors(msg.author);
        userAnchors.push({
            "name": anchorName, 
            "chName": msg.channel.name,
            "serName": msg.guild.name,
            "id": msg.channel.id
        });

        let isErr = jsonHandler.saveObject(
            DefineCommand.getUserFilePath(msg.author),
            {
                macros : DefineCommand.getMacros(msg.author),
                anchors : userAnchors
            }
        )
        if(isErr){
            this.push(responses.reply(msg, "There was an error storing your anchor."));
        } else {
            this.push(responses.reply(msg, "Successfully stored anchor!"));
        }
    }

    showAnchors(msg){
        let userAnchors = DefineCommand.getAnchors(msg.author);
        let toWrite = "You have the following anchors:";
        for(let a of userAnchors){
            toWrite += `\n"${a["name"]}" : #${a["chName"]} in ${a["serName"]}`;
        }
        toWrite += "";
        this.push(responses.reply(msg, toWrite));
    }

    deleteAnchor(msg, matchDeleteAnchor){
        let toDelete = matchDeleteAnchor[1];
        let userAnchors = DefineCommand.getAnchors(msg.author);
        let initialLen = userAnchors.length;
        if(initialLen > 0){
            for(let i = 0; i < initialLen; i++){
                if(userAnchors[i]["name"] == toDelete){
                    userAnchors.splice(i, 1);
                    break;
                }
            }
            if(userAnchors.length == initialLen){
                this.push(
                    responses.reply(msg, `You have no existing anchors with the name "${toDelete}".`)
                )
            } else {
                let isErr = jsonHandler.saveObject(
                    DefineCommand.getUserFilePath(msg.author), 
                    {
                        macros: DefineCommand.getMacros(msg.author),
                        anchors: userAnchors
                    }
                );
                if(isErr){
                    this.push(responses.reply(msg, "There was an error writing to your file."));
                } else {
                    this.push(responses.reply(msg, `Your anchor ${toDelete} was successfully deleted.`));
                }
            }
        } else {
            this.push(
                responses.reply(msg, 'You have no existing anchors')
            )
        }
    }
}