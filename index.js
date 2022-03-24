require("dotenv").config();
const Parser = require('./parser.js');
const reactionHandler = require('./io_classes/reactionHandler.js');
const client = require('./clientSource.js');


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('messageReactionAdd', (reaction, user) => {
    if(user.bot) return;
    reactionHandler.onReaction(reaction, user);
    //reactionHandler.onReaction(reaction.emoji.name, reaction.message, user);
});

client.on('message', msg => {
    //if(msg.author.bot || msg.content.indexOf('--') !== 0) return;
    let match = msg.content.match(/(?:```\S*\s+)(--[\S\s]*)(?:\s*```)/);
    if(!match) match = msg.content.match(/(--[\S\s]*)/);
    if(msg.author.bot || !match ) return;

    msg.content = match[1];
    let p = new Parser(msg);
    p.parse();
    //msg.reply('Hello world!');
})

client.login(process.env.BOT_TOKEN);