const Discord = require('discord.js');

const openMessages = new Map();

class Pages {
    constructor(res) {
        this.pages = [];
        this.shouldBreak = res.shouldBreak;
        this.currPageIndex = 0;
        this.edit(res);
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
            if((shouldBreak && shouldBreak(tmp)) || tmp.length >= 1999) {
                this.pages.push(tmp);
                tmp = '';
            }
        }
        if(tmp.length > 0 && tmp.length < 2000) {
            this.pages.push(tmp);
        } else {
            console.log("WTF???");
        }
    }
}

function sendMessage(response) {
    if(response.thenLambda){
        response.msg.channel.send(response.content, response.attachment).then(response.thenLambda);
    } else {
        response.msg.channel.send(response.content, response.attachment);
    }
}

function replyMessage(response) {
    if(response.thenLambda){
        response.msg.reply(response.content, response.attachment).then(response.thenLambda);
    } else {
        response.msg.reply(response.content, response.attachment);
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
        sendMessage(response);
    } else if(response.isReply) {
        let pages = new Pages(response);
        response.content = pages.getCurrPage();
        replyMessage(response);
    } else if(response.isEdit) {
        editMessage(response);
    } else {
        response.msg.reply("There was an error responding to your command.")
    }
}

module.exports = {
    paginate: (response) => {
        if(response.content instanceof Discord.MessageEmbed) {
            handleEmbed(response);
        } else if(response.content.constructor.name === "String") {
            handleString(response);
        } else {
            console.log('unrecognized message type?????');
        }
    }
}