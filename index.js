const Discord = require('discord.js');
require("dotenv").config();
const Parser = require('./command_classes/parser.js');
const reactionHandler = require('./io_classes/reactionHandler.js');

const client = new Discord.Client();


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('messageReactionAdd', (reaction, user) => {
    if(user.bot) return;
    
    reactionHandler.onReaction(reaction.emoji.name, reaction.message, user)
});

client.on('message', msg => {
    if(msg.author.bot || msg.content.indexOf('--') !== 0) return;

    let p = new Parser(msg);
    p.parse();
    //msg.reply('Hello world!');
})

client.login(process.env.BOT_TOKEN);