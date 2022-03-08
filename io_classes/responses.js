const Discord = require('discord.js');

module.exports = {
    message: (channel, content, attachment, thenLambda) => {
        return {isMessage: true, channel, content, attachment, thenLambda}
    },

    reply: (msg, content, attachment, thenLambda) => {
        return {isReply: true, msg, content, attachment, thenLambda}
    },

    edit: (msg, content, attachment, thenLambda) => {
        return {isEdit: true, msg, content, attachment, thenLambda}
    }
}