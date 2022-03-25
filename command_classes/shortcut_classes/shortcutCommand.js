const JSONCommand = require('../jsonCommand.js');
const Discord = require('discord.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const responses = require('../../io_classes/responses.js');

const NUMS = UIEmojis.NUMS;

module.exports = class ShortcutCommand extends JSONCommand{
    constructor(onNewResponse){
        super(onNewResponse, '--shortcut')
    }

    static getShortcutReTitle(){
        return /--shortcut\s+new\s+(.+)/;
    }

    static getShortcutReRow(){
        return /"(.+)"\s+(--.+)/;
    }

    static getShortcutReFetch(){
        return /--shortcut\s+fetch\s+(.+)/;
    }

    static getShortcutReShow(){
        return /--shortcut\s+show\s+all/;
    }

    static getShortcutReDelete(){
        return /--shortcut\s+delete\s+(.+)/;
    }

    handle(msg){
        let matchSave = msg.content.split('\n')[0].match(ShortcutCommand.getShortcutReTitle());
        let matchFetch = msg.content.match(ShortcutCommand.getShortcutReFetch());
        let matchShow = msg.content.match(ShortcutCommand.getShortcutReShow());
        let matchDelete = msg.content.match(ShortcutCommand.getShortcutReDelete());

        if(matchSave){
            this.newShortcut(msg, matchSave);
        } else if (matchFetch) {
            this.fetchShortcut(msg, matchFetch);
        } else if (matchShow) {
            this.showShortcuts(msg, matchShow);
        } else if (matchDelete) {
            this.deleteShortcut(msg, matchDelete);
        } else {
            this.error(msg, 'Your command did not match the expected format.');
        }
    }

    getUserFilePath(user){
        return `./command_classes/shortcut_classes/shortcut_data/user${user.id}.json`;
    }

    newShortcut(msg, matchSave){
        let shortcut = {};
        shortcut["Name"] = matchSave[1];
        let cmds = [];
        let lines = msg.content.split('\n');
        let matchLine;
        for(let i = 1; i < lines.length; i++){
            matchLine = lines[i].match(ShortcutCommand.getShortcutReRow());
            if(matchLine){
                cmds.push({
                    "Name" : matchLine[1],
                    "Command" : matchLine[2]
                })
            } else {
                this.error(msg, `Row ${i+1} of your command did not match the expected format.`)
            }
        }
        if(cmds.length >= 10){
            this.push(responses.reply(msg, 'You cannot create a shortcut with 10 or more commands.'));
            return;
        }
        shortcut["Commands"] = cmds;

        this.pushEltToArray(
            msg,
            shortcut,
            "Shortcuts",
            (a, b) => {
                return a["Name"] == b["Name"];
            },
            `You already have a shortcut with the name ${shortcut["Name"]}. Would you like to replace it?`,
            'The shortcut has been replaced.',
            'Your shortcut has been stored.'
        );

        this.openShortcut(msg, shortcut);
    }

    fetchShortcut(msg, matchFetch){
        let shortcut = this.getElt(
            msg.author,
            "Shortcuts",
            elt => {
                return elt["Name"] == matchFetch[1];
            }
        )
        if(!shortcut) {
            this.push(responses.reply(msg, 'You do not have any saved shortcuts with that name.'));
            return;
        }
        this.openShortcut(msg, shortcut);
    }

    showShortcuts(msg, matchShow){
        this.showArray(
            msg,
            "Shortcuts",
            ["Name"],
            'You have the following shortcuts:',
            'You may retrieve any of the above shortcuts with `--shortcut fetch Name`',
            'You have no shortcuts saved.'
        )
    }

    deleteShortcut(msg, matchDelete){
        this.deleteElt(
            msg,
            "Shortcuts",
            elt => {
                return elt["Name"] == matchDelete[1];
            },
            'Your shortcut has been deleted.',
            'You have no shortcuts with that name.',
            'You have no saved shortcuts'
        );
    }

    openShortcut(msg, shortcut){
        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(shortcut["Name"])
            .setFooter(`Created by ${msg.author.username}`)
            .attachFiles([
                new Discord.MessageAttachment('./assets/writing.png', 'writing.png'),
            ])
            .setThumbnail('attachment://writing.png')

        let cmds = shortcut["Commands"];
        for(let i in cmds){
            messageEmbed.addField(
                `\` ${parseInt(i)+1}: ${cmds[i]["Name"]} \``,
                '⠀' + cmds[i]["Command"],
                false
            )
        }

        this.sendEmbed(msg, messageEmbed, shortcut);
    }

    sendEmbed(msg, messageEmbed, shortcut){
        let cmds = shortcut["Commands"];

        this.push(
            responses.message(
                msg,
                messageEmbed,
                undefined,
                message => {
                    reactionHandler.addReactions(NUMS.slice(1, cmds.length + 1), message);
                    reactionHandler.addCallback(
                        NUMS.slice(1, cmds.length + 1),
                        message,
                        (reaction, user) => {
                            let cmdIndex = NUMS.findIndex(elt => elt.id === reaction.emoji.id) - 1;
                            this.parse(msg, cmds[cmdIndex]["Command"]);
                            reaction.users.remove(user.id);
                        }
                    );
                }
            )
        )
    }

    parse(msg, cmdText) {
        let oldContent = msg.content;
        msg.content = cmdText;
        let Parser = require('../../parser.js');
        let p = new Parser(msg);
        p.parse(); 
        msg.content = oldContent;       
    }
}