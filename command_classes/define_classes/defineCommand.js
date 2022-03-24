const JsonCommand = require('../jsonCommand.js');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const jsonHandler = require('../../io_classes/jsonHandler.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;


module.exports = class DefineCommand extends JsonCommand {
    constructor(onNewResponse){
        super(onNewResponse, '--define');
    }

    static getDefineRE() {
        return /--define\s+(--\S+)\s+(\d*)\s*{([\s\S]*)}/;
    }
    
    static getDefineShowMacrosRE() {
        return /--define\s+show\s+macros/;
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
        let matchShowMacros = msg.content.match(DefineCommand.getDefineShowMacrosRE());
        let matchInspect = msg.content.match(DefineCommand.getDefineInspectRE());
        let matchDelete = msg.content.match(DefineCommand.getDefineDeleteRE());
        let matchAnchor = msg.content.match(DefineCommand.getDefineAnchorRE());
        let matchShowAnchors = msg.content.match(DefineCommand.getDefineShowAnchorsRE());
        let matchDeleteAnchor = msg.content.match(DefineCommand.getDefineDeleteAnchorRE());
        
        if(matchDefine){
            this.defineNew(msg, matchDefine);
        } else if(matchShowMacros) {
            this.showMacros(msg);
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

    getUserFilePath(user){
        return `./command_classes/define_classes/define_data/user${user.id}.json`;
    }

    getMacros(user){
        return this.getArray(user, "Macros");
    }

    defineNew(msg, matchDefine){
        let macroName = matchDefine[1];
        let argc = matchDefine[2] ? matchDefine[2] : 0;
        argc = parseInt(argc);

        let code = matchDefine[3];
        this.pushMacro(msg, 
            {
                "Name" : macroName,
                "argc" : argc,
                "Code" : code
            }
        );
        return;
    }

    pushMacro(msg, newMacro) {
        this.pushEltToArray(
            msg,
            newMacro,
            "Macros",
            (a, b) => {
                return a["Name"] == b["Name"] && a["argc"] == b["argc"];
            },
            `You have an existing macro with the name ${newMacro["Name"]} and argc ${newMacro["argc"]}. Would you like to replace it?`,
            "Your macro has been modified.",
            "Your macro has been added."
        );
    }

    showMacros(msg){
        this.showArray(
            msg,
            "Macros",
            ["Name", "argc"],
            "You have the following macros:",
            "You can inspect any of these macros using `--define inspect macroName`, or delete it with `--define delete macroName`.",
            "You have no saved macros."
        );
    }

    inspectMacro(msg, matchInspect){
        let macroName = matchInspect[1];
        this.showElt(
            msg,
            "Macros",
            elt => {
                if(elt["Name"] = macroName){
                    elt["Code"] = '```\n' + elt["Code"] + '\n```';
                    return;
                } 
            },
            "This macro has the following properties:",
            "You do not have a macro with that name. Try `--define show macros` to see your macros."
        );
    }

    deleteMacro(msg, matchDelete){
        let toDelete = matchDelete[1];
        this.deleteElt(
            msg,
            "Macros",
            elt => {
                return elt["Name"] == toDelete;
            },
            `Your macro ${toDelete} was successfully deleted.`,
            `You have no existing macros with the name "${toDelete}".`,
            'You have no existing macros.'
        );
    }

    addAnchor(msg, matchAnchor){
        let anchorName = matchAnchor[1];
        this.pushEltToArray(
            msg,
            {
                "Name": anchorName, 
                "Channel Name": msg.channel.name,
                "Server Name": msg.guild.name,
                "ID": msg.channel.id
            },
            "Anchors",
            (a, b) => {
                return a["Name"] == b["Name"];
            },
            "An anchor with the name " + anchorName + " already exits. Would you like to replace it?",
            "Your anchor has been replaced.",
            "Your anchor has been stored!"
        );
    }

    showAnchors(msg){
        this.showArray(
            msg,
            "Anchors",
            ["Name", "Channel Name", "Server Name"],
            "You have the following anchors:",
            "You can delete an anchor by using `--define delete anchor anchorName`",
            "You have no saved anchors."
        );
    }

    deleteAnchor(msg, matchDeleteAnchor){
        let toDelete = matchDeleteAnchor[1];
        this.deleteElt(
            msg,
            "Anchors",
            elt => {
                return elt["Name"] = toDelete;
            },
            `Your anchor ${toDelete} was successfully deleted.`,
            `You have no existing anchors with the name "${toDelete}".`,
            'You have no saved anchors.'
        );
    }
}