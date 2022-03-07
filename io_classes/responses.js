const Discord = require('discord.js');

module.exports = {
    message: (channel, content, thenLambda) => {
        return {isMessage: true, channel, content, thenLambda}
    },

    reply: (msg, content, thenLambda) => {
        return {isReply: true, msg, content, thenLambda}
    },

    edit: (msg, content, thenLambda) => {
        return {isEdit: true, msg, content, thenLambda}
    }
}