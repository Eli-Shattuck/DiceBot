const Command = require('./command.js');
const Discord = require('discord.js');

module.exports = class HelpCommand extends Command{
    constructor() {
        super();

        this.fs = require('fs');

        let rawdata = this.fs.readFileSync('./command_classes/help_data/help.JSON');
        this.helpData = JSON.parse(rawdata);
        this.pages = this.helpData.pages;

        this.totalPages = this.pages.length;
        for(let page of this.pages) {
            this.totalPages += page.subpages.length;
        }

        //console.log('---ELI---')
        //console.log(this.helpData);
        //console.log('---ELI---')
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf('--help') === 0;
    };
    
    handle(msg){
        let args = msg.content.split(/\s/);
        let pageIndex = -1;
        if(args[1]) {
            pageIndex = this.helpData.findIndex(elt => elt.name === args[1]);
        } else {
            pageIndex = 0;
        }

        if(pageIndex < 0) {
            this.error(msg, `Invalid argument to --help, "${args[1]}"`)
        }

        msg.channel.send(this.makeEmbed(pageIndex));
        return;
    };

    makeEmbed(pageIndex) {
        let page = this.pages[pageIndex];
        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(`Help - ${page.name}`)
            .setDescription('DiceBot help pages!')
            .setThumbnail('https://cdn-icons.flaticon.com/png/512/2538/premium/2538036.png?token=exp=1645081616~hmac=14230136a40be854a86f030cce319fe9')
            .setFooter(`page ${pageIndex+1}/${this.totalPages}`);
            messageEmbed.addField("help title", "```\nhelp text\n```");
        
        return messageEmbed;
    }

}