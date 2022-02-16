const Discord = require('discord.js');
const client = new Discord.Client();
require("dotenv").config();
const Parser = require('./command_classes/parser.js');

const Timer = require('./command_classes/timer_classes/timer.js');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', msg => {
    if(msg.author.bot || msg.content.indexOf('--') !== 0) return;

    let p = new Parser(msg);
    p.parse();
    //msg.reply('Hello world!');

    // let t = new Timer(10, 20);
    // t.user = msg.author;
    // t.initMessage = msg;
    // msg.channel.send("hello").then(message => {
    //     t.message = message;
    // });
    // t.start();
})

client.login(process.env.BOT_TOKEN);