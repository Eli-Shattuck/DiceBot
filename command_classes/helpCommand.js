const Command = require('./command.js');
const Discord = require('discord.js');
const reactionHandler = require('../io_classes/reactionHandler.js');
const UIEmojis = require('../io_classes/uiEmojis.js');
const responses = require('../io_classes/responses.js');

module.exports = class HelpCommand extends Command{
    constructor(onNewResponse) {
        super(onNewResponse);

        this.fs = require('fs');

        let rawdata = this.fs.readFileSync('./command_classes/help_data/help.JSON');
        this.helpData = JSON.parse(rawdata);
        this.chapters = this.helpData.chapters;

        //console.log('---ELI---')
        //console.log(this.helpData);
        //console.log('---ELI---')
    }

    static match(msg){
        //console.log(msg.content.toLowerCase());
        return HelpCommand.validate(msg.content, '--help');
    };
    
    handle(msg){
        let args = msg.content.split(/\s/);
        this.chapterIndex = -1;
        this.pageIndex = -1;
        if(args[1]) {
            this.chapterIndex = this.chapters.findIndex(elt => elt.name === args[1].toLowerCase());
        } else {
            this.chapterIndex = 0;
        }

        if(this.chapterIndex < 0) {
            this.error(msg, `Invalid argument to --help, "${args[1]}"`);
            return;
        }

        if(args[2]) {
            this.pageIndex = this.chapters[this.chapterIndex].pages.findIndex(elt => elt === args[2].toLowerCase());
            if(this.pageIndex < 0) {
                this.error(msg, `Invalid argument to --help, "${args[2]}"`);
                return;
            }
        } else {
            this.pageIndex = 0;
        }      

        this.push(
            responses.message(
                msg,
                this.makeEmbed(),
                undefined,
                message => {
                    reactionHandler.addCallback(
                        [UIEmojis.TRASH, UIEmojis.PREVIOUS, UIEmojis.NEXT],
                        message,
                        this.onReaction.bind(this)
                    );
                    reactionHandler.addReactions([UIEmojis.TRASH, UIEmojis.PREVIOUS, UIEmojis.NEXT], message);
                }
            )
        )
        return;
    };

    onReaction(reaction, user) {
        if(reaction.emoji.id === UIEmojis.TRASH.id) {
            reaction.message.delete();
            return;
        }

        let msg = reaction.message;

        let scrollDirection = reaction.emoji.id === UIEmojis.NEXT.id ? 1 : -1;
        //console.log(scrollDirection);

        this.pageIndex += scrollDirection;
        let overOrUnderflow = false;

        if(this.pageIndex >= this.chapters[this.chapterIndex].pages.length || this.pageIndex < 0) {
            this.chapterIndex += scrollDirection;
            if(this.chapterIndex >= this.chapters.length) {
                this.chapterIndex = 0;
            } else if (this.chapterIndex < 0) {
                this.chapterIndex = this.chapters.length-1;
            }
            if(scrollDirection > 0) this.pageIndex = 0;
            else this.pageIndex = this.chapters[this.chapterIndex].pages.length - 1;
        }

        this.push(
            responses.edit(msg, this.makeEmbed())
        )

        reaction.users.remove(user.id);
    }

    makeNice(text) {
        //return text
        return text.replaceAll('\\t', '\u1CBC\u1CBC\u1CBC\u1CBC')
        .replaceAll('*', '\\*')
        .replaceAll('\\DiceBot', '🎲DiceBot🎲')
        .replaceAll('\\it', '*')
    }

    makeEmbed() {
        //console.log(this.pageIndex, this.chapterIndex);
        let chapter = this.chapters[this.chapterIndex];
        let page = chapter.pages[this.pageIndex];

        let helpText;
        try {
            //console.log('./command_classes/help_data/'+chapter.helpTextFileName.replace('#', page));
            helpText = this.fs.readFileSync('./command_classes/help_data/'+chapter.helpTextFileName.replace('#', page), 'utf8')
            //console.log(helpText);
            helpText = this.makeNice(helpText);
            //console.log(helpText);
        } catch (err) {
            console.error(err)
        }
        let header = helpText.split('\n');
        helpText = header.slice(1);
        header = header[0];
          
        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(`Help - ${chapter.name}`)
            .setDescription('DiceBot help pages!')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/5406/5406026.png')
            .setFooter(`chapter ${this.chapterIndex+1}/${this.chapters.length} - page ${this.pageIndex+1}/${chapter.pages.length}`);
            messageEmbed.addField(header, helpText);
        
        return messageEmbed;
    }

}