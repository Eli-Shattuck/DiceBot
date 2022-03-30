const Discord = require('discord.js');
const reactionHandler = require('./reactionHandler.js');
const UIEmojis = require('./uiEmojis.js');

const INCREASE = UIEmojis.INCREASE;
const DECREASE = UIEmojis.DECREASE;
const TRASH = UIEmojis.TRASH;

const openMessages = new Map();

class Pages {
    constructor(res) {
        this.pages = [];
        this.author = res.msg.author;
        this.shouldBreak = res.shouldBreak;
        this.currPageIndex = 0;
        this.edit(res);
    }

    getLength() {
        return this.pages.length;
    }

    getCurrPage() {
        return this.pages[this.currPageIndex];
    }

    edit(res) {
        this.pages = [];
        let tmp = '';
        let shouldBreak = res.shouldBreak || this.shouldBreak;
        for(let i = 0; i < res.content.length; i++) {
            tmp += res.content[i];
            if((shouldBreak && shouldBreak(tmp)) || tmp.length >= 1999-'\npage: ### / ###'.length) {
                if(tmp[tmp.length-1] != '\n') tmp += '\n';
                tmp += `\`Page: ${this.pages.length + 1} / `;
                this.pages.push(tmp);
                tmp = '';
            }
        }
        if(tmp.length > 0 && tmp.length < 2000) {
            if(tmp[tmp.length-1] != '\n') tmp += '\n';
            if(this.pages.length >= 1) tmp += `\`Page: ${this.pages.length + 1} / `;
            this.pages.push(tmp);
        } else {
            console.log("WTF???");
        }

        if(this.pages.length > 1){
            for(let pageNum in this.pages){
                this.pages[pageNum] = `${this.pages[pageNum]}${this.pages.length}\``;
            }
        }
    }
}

function messageSetUp(message, pages){
    if(!pages || pages.getLength() <= 1) return;

    openMessages.set(message.id, pages);

    reactionHandler.addCallback(
        [INCREASE],
        message,
        (reaction, user) => {
            pages.currPageIndex = (pages.currPageIndex - 1 + pages.getLength()) % pages.getLength();
            reaction.users.remove(user.id);
            message.edit(pages.getCurrPage());
        }
    );
    reactionHandler.addCallback(
        [DECREASE],
        message,
        (reaction, user) => {
            pages.currPageIndex = (pages.currPageIndex + 1) % pages.getLength();
            reaction.users.remove(user.id);
            message.edit(pages.getCurrPage());
        }
    );
    reactionHandler.addCallback(
        [TRASH],
        message,
        (reaction, user) => {
            if(user != pages.author) return;
            message.delete();
            openMessages.delete(message.id);
        }
    );
    reactionHandler.addReactions(
        [TRASH, INCREASE, DECREASE],
        message
    );
}

function sendMessage(response, pages) {
    if(response.thenLambda){
        response.msg.channel.send(response.content, response.attachment).then(
            message =>{
                messageSetUp(message, pages);
                response.thenLambda(message);
            }
        );
    } else {
        response.msg.channel.send(response.content, response.attachment).then(
            message =>{
                messageSetUp(message, pages);
            }
        );
    }
}

function replyMessage(response, pages) {
    if(response.thenLambda){
        response.msg.reply(response.content, response.attachment).then(
            message =>{
                messageSetUp(message, pages);
                response.thenLambda(message);
            }
        );
    } else {
        response.msg.reply(response.content, response.attachment).then(
            message =>{
                messageSetUp(message, pages);
            }
        );
    }
}

function editMessage(response) {
    if(response.thenLambda){
        response.msg.edit(response.content, response.attachment).then(response.thenLambda);
    } else {
        response.msg.edit(response.content, response.attachment);
    }
}

function handleEmbed(response) {
    if(response.isMessage) {
        sendMessage(response);
    } else if(response.isReply) {
        replyMessage(response);
    } else if(response.isEdit) {
        editMessage(response);
    } else {
        response.msg.reply("There was an error responding to your command.")
    }
}

function handleString(response) {
    if(response.isMessage) {
        let pages = new Pages(response);
        response.content = pages.getCurrPage();
        sendMessage(response, pages);
    } else if(response.isReply) {
        let pages = new Pages(response);
        response.content = pages.getCurrPage();
        replyMessage(response, pages);
    } else if(response.isEdit) {
        let pages = openMessages.get(response.msg.id);
        if(pages){
            pages.edit(response);
            response.content = pages.getCurrPage();
        }
        editMessage(response, pages);
    } else {
        response.msg.reply("There was an error responding to your command.")
    }
}

module.exports = {
    paginate: (response) => {
        //console.log(response);
        if(response.content instanceof Discord.MessageEmbed) {
            handleEmbed(response);
        } else if(response.content.constructor.name === "String") {
            handleString(response);
        } else {
            console.log('unrecognized message type?????');
        }
    }
}