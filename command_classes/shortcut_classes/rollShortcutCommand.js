const Command = require('../command.js');
const Discord = require('discord.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const jsonHandler = require('../../io_classes/jsonHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const responses = require('../../io_classes/responses.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;
const NUMS = UIEmojis.NUMS;

module.exports = class RollShortcutCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
        this.shortcut;
        this.creator;
        this.embedMessage;
        this.sentResponse;
    }
        
    static getCmdName(){
        return '--roll-shortcut';
    }
  
    static match(msg){
        return RollShortcutCommand.validate(msg.content, RollShortcutCommand.getCmdName());
    };

    static getRollShortReTitle(){
        return /--roll-shortcut\s+new\s+(.+)/;
    }

    static getRollShortReRow(){
        return /"(.+)"\s+(\S+)\s+(\d*[dD]\d+)\s*([+-]\d+)?\s*(\S+)?/;
    }

    static getRollShortReFetch(){
        return /--roll-shortcut\s+fetch\s+(.+)/;
    }

    static getRollShortReDelete(){
        return /--roll-shortcut\s+delete\s+(.+)/;
    }

    static getRollShortReShowAll(){
        return /--roll-shortcut\s+show\s+all/;
    }

    static getPlayerFilePath(user){
        return `./command_classes/shortcut_classes/shortcut_data/user${user.id}.json`;
    }

    static getPlayerShortcuts(user){
        let playerShortcuts = jsonHandler.getObject(
            RollShortcutCommand.getPlayerFilePath(user), 
        );
        return playerShortcuts ? playerShortcuts.data : [];
    }

    handle(msg){
        let showAll = msg.content.match(RollShortcutCommand.getRollShortReShowAll());
        let toDelete = msg.content.match(RollShortcutCommand.getRollShortReDelete());
        let fetch = msg.content.match(RollShortcutCommand.getRollShortReFetch());
        if(showAll){
            this.showAll(msg);
        }else if(toDelete){
            this.deleteShortcut(msg, toDelete[1]);
        }else if(fetch){
            this.openShortcut(msg, fetch);
        } else {
            this.newShortcut(msg);
        }
    }

    showAll(msg){
        let playerShortcuts = RollShortcutCommand.getPlayerShortcuts(msg.author);
        if(playerShortcuts.length > 0){
            let toSend = 'You have the following shortcuts:'
            for(let sc of playerShortcuts){
                toSend += `\n\t\t\t\t${sc.name}`
            }
            toSend += '\nCall  `--roll-shortcut fetch name`  for any of the above names to view it.'
            this.push(
                responses.reply(msg, toSend)
            )
        } else {
            this.push(
                responses.reply(msg, 'You have no existing shortcuts')
            )
        }
    }

    deleteShortcut(msg, toDelete){
        let playerShortcuts = RollShortcutCommand.getPlayerShortcuts(msg.author);
        let initialLen = playerShortcuts.length;
        if(initialLen > 0){
            for(let i = 0; i < initialLen; i++){
                if(playerShortcuts[i].name == toDelete){
                    playerShortcuts.splice(i, 1);
                    break;
                }
            }
            if(playerShortcuts.length == initialLen){
                this.push(
                    responses.reply(msg, `You have no existing shortcuts with the name "${toDelete}".`)
                )
            } else {
                let isErr = jsonHandler.saveObject(
                    RollShortcutCommand.getPlayerFilePath(msg.author), 
                    {data: playerShortcuts}
                );
                if(isErr){
                    this.push(responses.reply(msg, "There was an error writing to your file."));
                } else {
                    this.push(responses.reply(msg, `The shortcut ${toDelete} was successfully deleted.`));
                }
            }
        } else {
            this.push(
                responses.reply(msg, 'You have no existing shortcuts')
            )
        }
    }

    newShortcut(msg){
        let playerShortcuts = RollShortcutCommand.getPlayerShortcuts(msg.author);

        this.makeShortcut(msg);
        if(!this.shortcut){
            return; //makeShortcut called this.error
        } 

        let oldShortcutIndex = undefined;
        for(let i = 0; i < playerShortcuts.length; i++){
            if(playerShortcuts[i].name == this.shortcut.name) oldShortcutIndex = i;
        }

        if(oldShortcutIndex != undefined){ //if there is already a shortcut with this name
            this.push(
                responses.reply(
                    msg,
                    `A shortcut with the name ${this.shortcut.name} already exists. Would you like to replace it?`,
                    undefined,
                    message => {
                        reactionHandler.addCallback(
                            [YES],
                            message,
                            (reaction, user) => {
                                playerShortcuts[oldShortcutIndex] = this.shortcut;
                                jsonHandler.saveObject(
                                    RollShortcutCommand.getPlayerFilePath(msg.author),
                                    {data: playerShortcuts}
                                )
                                reactionHandler.removeAllCallbacks(message); 
                                message.delete();
                                this.push(responses.reply(msg, "Successfully stored shortcut!"));
                                this.openShortcut(msg);
                            }
                        )
                        reactionHandler.addCallback(
                            [STOP],
                            message,
                            (reaction, user) => {
                                this.shortcut = playerShortcuts[oldShortcutIndex]
                                this.openShortcut(msg);
                                reactionHandler.removeAllCallbacks(message); 
                                message.delete();
                            }
                        );
                        reactionHandler.addReactions([YES, STOP], message);
                    }
                )
            );
        } else {
            playerShortcuts.push(this.shortcut);
            let isErr = jsonHandler.saveObject(
                RollShortcutCommand.getPlayerFilePath(msg.author), 
                {data: playerShortcuts}
            );
            if(isErr){
                this.push(responses.reply(msg, "There was an error writing to your file."));
            } else {
                this.push(responses.reply(msg, "Successfully stored shortcut!"));
                this.openShortcut(msg);
            }
        }
    }

    makeShortcut(msg){
        let shortcut = {};
        let lines = msg.content.split('\n');
        let title = lines[0].match(RollShortcutCommand.getRollShortReTitle());

        if(lines.length > 5){ //only can use 1-9, and each action has 2 commands
            this.error(msg, "You cannot create a shortcut with more than 4 actions.");
            return;
        }

        if(title){
            shortcut.name = title[1];
            for(let i = 1; i < lines.length; i++){
                let row = lines[i].match(RollShortcutCommand.getRollShortReRow());
                if(row){
                    let action = {};
                    let atkBonus = parseInt(row[2])
                    if(isNaN(atkBonus)){
                        action.saveThrow = row[2];
                    } else {
                        action.attackRoll = 'd20 +' + atkBonus;
                    }
                    let modifier = row[4] || '';
                    action.damageRoll = row[3] + modifier;
                    action.damageType = row[5];

                    shortcut[row[1]] = action;
                } else {
                    this.error(msg, `Line ${i+1} of your message did not match the expected format`);
                    return;
                }
            }
            this.shortcut = shortcut;
        } else {
            this.error(msg, 'Your message did not match the expected format');
        }
    }

    openShortcut(msg, name) {
        if(this.shortcut == undefined) {
            let playerShortcuts = RollShortcutCommand.getPlayerShortcuts(msg.author);

            for(let sc of playerShortcuts){
                if(sc.name == name[1]) this.shortcut = sc;
            }
            if(this.shortcut == undefined){
                this.error(msg, 'You have no existing shortcuts with that name.')
            }
        }
        this.creator = msg.author;
        this.sendEmbed(msg)
    }

    sendEmbed(msg){
        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(this.shortcut.name)
            .setFooter(`Created by ${msg.author.username}`)
            .attachFiles([
                new Discord.MessageAttachment('./assets/writing.png', 'writing.png'),
            ])
            .setThumbnail('attachment://writing.png')

        let i = 1;
        let actions = []; //array of objects with command type and string
        for(let action in this.shortcut){
            if(action == 'name') continue;
            messageEmbed.addField('``` Action Name ```', '⠀' + action, true);
            if(this.shortcut[action].attackRoll){
                messageEmbed.addField('``` ' + i + ': Attack Roll ```', '⠀' + this.shortcut[action].attackRoll, true);
                actions[i++] = {
                    cmdType: 'attack', 
                    cmd: '--roll ' + this.shortcut[action].attackRoll + ' -sum'
                };
            } else if(this.shortcut[action].saveThrow){
                messageEmbed.addField('``` ' + i + ': Saving Throw ```', '⠀' + this.shortcut[action].saveThrow, true);
                actions[i++] = {
                    cmdType: 'save', 
                    cmd: '--reply Make a ' + this.shortcut[action].saveThrow + ` saving throw for ${this.shortcut.name}`
                };
            }
            let type = this.shortcut[action].damageType ? ' ' + this.shortcut[action].damageType : "";
            messageEmbed.addField('``` ' + i + ': Damage Roll ```', '⠀' + this.shortcut[action].damageRoll + type, true);
            actions[i++] = {
                cmdType: 'damage', 
                cmd: '--roll ' + this.shortcut[action].damageRoll + ' -sum',
                dmgType: this.shortcut[action].damageType
            };
        }

        this.push(
            responses.message(
                msg,
                messageEmbed,
                undefined,
                message => {
                    this.embedMessage = message;
                    reactionHandler.addReactions(NUMS.slice(1, i), message);
                    reactionHandler.addCallback(
                        NUMS.slice(1, i),
                        message,
                        (reaction, user) => {
                            //if(user.id != msg.author.id) return; //can make only the creator be able to use it
                            let actionIndex = NUMS.findIndex(elt => elt.id === reaction.emoji.id);
                            this.parse(msg, actions[actionIndex]);
                            reaction.users.remove(user.id);
                        }
                    );
                }
            )
        )
    }

    parse(msg, action) {
        let oldContent = msg.content;
        msg.content = action.cmd;
        let Parser = require('./rollShortcutParser.js');
        let p = new Parser(msg, this);
        p.parse(action); 
        msg.content = oldContent;       
    }
}