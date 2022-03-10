const Command = require('../command.js');
const Discord = require('discord.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const responses = require('../../io_classes/responses.js');
const fs = require('fs');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;
const NUMS = UIEmojis.NUMS;

module.exports = class RollShortcutCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
        this.embedMessage;
        this.sentResponse;
    }

    static getRollShortReTitle(){
        return /--roll-shortcut\s+new\s+(.+)/;
    }

    static getRollShortReRow(){
        return /"(.+)"\s+(\S+)\s+(\d*[dD]\d+)\s*([+-]\d+)?\s*(.+)?/;
    }

    static getRollShortReFetch(){
        return /--roll-shortcut\s+fetch\s+(.+)/;
    }

    static getFilePath(user){
        return `./command_classes/shortcut_classes/shortcut_data/user${user.id}.json`;
    }

    static match(msg){
        return msg.content.indexOf('--roll-shortcut ') === 0;
    }

    handle(msg){
        let filePath = RollShortcutCommand.getFilePath(msg.author);
        let playerShortcuts = [];
        try{
            playerShortcuts = JSON.parse(
                fs.readFileSync(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        throw err;
                    }
                    console.log(data);
                })
            ).data;
            console.log('PlayerShortcuts: ', playerShortcuts);
        } catch(err) {
            console.log('Did not find existing file')
        }

        let shortcut = this.makeShortcut(msg);
        if(!shortcut) return;
        this.push(responses.reply(msg, "Made shortcut. Trying to store..."));
        console.log('shortcut: ', shortcut);

        let oldShortcutIndex = undefined;
        for(let i = 0; i < playerShortcuts.length; i++){
            if(playerShortcuts[i].name == shortcut.name) oldShortcutIndex = i;
        }

        if(oldShortcutIndex != undefined){ //if there is already a shortcut with this name
            this.push(
                responses.reply(
                    msg,
                    `A shortcut with the name ${shortcut.name} already exists. Would you like to replace it?`,
                    undefined,
                    message => {
                        reactionHandler.addCallback(
                            [YES],
                            message,
                            (reaction, user) => {
                                playerShortcuts[oldShortcutIndex] = shortcut;
                                try{
                                    let toWrite = JSON.stringify({data: playerShortcuts});
                                    fs.writeFileSync(filePath, toWrite);
                                } catch(err) {
                                    console.log('Unable to write to file', err);
                                    return;
                                }
                                reactionHandler.removeAllCallbacks(message); 
                                message.delete();
                                this.push(responses.reply(msg, "Successfully stored shortcut!"));
                                this.openShortcut(msg, shortcut);
                            }
                        )
                        reactionHandler.addCallback(
                            [STOP],
                            message,
                            (reaction, user) => {
                                reactionHandler.removeAllCallbacks(message); 
                                message.delete();
                            }
                        );
                        reactionHandler.addReactions([YES, STOP], message);
                    }
                )
            );
        } else {
            playerShortcuts.push(shortcut);
            try{
                let toWrite = JSON.stringify({data: playerShortcuts});
                fs.writeFileSync(filePath, toWrite);
            } catch(err) {
                console.log('Unable to write to file', err);
                return;
            }
            this.push(responses.reply(msg, "Successfully stored shortcut!"));
            this.openShortcut(msg, shortcut);
        }
    }

    makeShortcut(msg){
        let shortcut = {};
        let lines = msg.content.split('\n');
        let title = lines[0].match(RollShortcutCommand.getRollShortReTitle());
        console.log(lines);

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
                    console.log(`Line ${i+1} of the message did not match the expected format`);
                    return;
                }
            }
            return shortcut;
        } else {
            this.error(msg, 'Your message did not match the expected format');
            console.log('The message did not match the expected format')
        }
    }

    openShortcut(msg, shortcut) {
        if(shortcut == undefined) {
            try{
                playerShortcuts = JSON.parse(
                    fs.readFileSync(filePath, 'utf-8', (err, data) => {
                        if (err) {
                            throw err;
                        }
                        console.log(data);
                    })
                ).data;
                console.log(playerShortcuts);
            } catch(err) {
                this.error(`You have no existing shortcuts.`);
                return;
            }
            let name = msg.content.match(RollShortcutCommand.getRollShortReFetch());

            for(let sc of playerShortcuts){
                if(sc.name == name[1]) shortcut = sc;
            }

            if(shortcut == undefined){
                this.error('You have no existing shortcuts with that name.')
            }
        }

        this.sendEmbed(msg, shortcut)
    }

    sendEmbed(msg, shortcut){
        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(shortcut.name)
            .setFooter(`Created by ${msg.author.username}`)
        let i = 1;
        let actions = []; //array of strings that are commands
        for(let action in shortcut){
            if(action == 'name') continue;
            messageEmbed.addField('``` Action Name ```', action, true);
            if(shortcut[action].attackRoll){
                messageEmbed.addField('```' + i + ': Attack Roll```', shortcut[action].attackRoll, true);
                actions[i++] = '--roll ' + shortcut[action].attackRoll + ' -sum';
            } else if(shortcut[action].saveThrow){
                messageEmbed.addField('```' + i + ': Saving Throw```', shortcut[action].saveThrow, true);
                actions[i++] = '--reply Make a ' + shortcut[action].saveThrow + ' saving throw';
            }
            let type = shortcut[action].damageType ? ' ' + shortcut[action].damageType : "";
            messageEmbed.addField('```' + i + ': Damage Roll```', shortcut[action].damageRoll + type, true);
            actions[i++] = '--roll ' + shortcut[action].damageRoll + ' -sum';
        }

        console.log(actions);

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
                            if(user.id != msg.author.id) return;
                            let actionIndex = NUMS.findIndex(elt => elt.id === reaction.emoji.id);
                            if(this.sentResponse) this.sentResponse.delete();
                            this.parse(msg, actions[actionIndex]);
                        }
                    );
                }
            )
        )
    }

    parse(msg, str) {
        console.log('parsing{\n'+str+'\n}');
        let oldContent = msg.content;
        msg.content = str;
        let Parser = require('./rollShortcutParser.js');
        let p = new Parser(msg, this);
        p.parse(); 
        msg.content = oldContent;       
    }
}