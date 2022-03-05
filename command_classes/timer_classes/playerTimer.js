const Timer = require('./timer.js');
const Discord = require('discord.js');

module.exports = class PlayerTimer extends Timer{
    constructor(mins, secs, initMessage, user, combatTimer){
        super(mins, secs, initMessage, user);
        this.combatTimer = combatTimer;
    }

    start() {
		super.start();
	}
	
	pause(prefix) {
		super.pause(prefix);
	}

    stop() {
        this.pause();
    }

    editMessage(prefix) {
        this.message.edit(
            PlayerTimer.makeEmbed(this.combatTimer)
        );
    }

    static makeEmbed(combatTimer) {
        let players = combatTimer.players;
        let initiativeArray = combatTimer.initiativeArray;

        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(combatTimer.title)
            .attachFiles([
                new Discord.MessageAttachment('./command_classes/timer_classes/assets/clock.png', 'clock.png'),
                new Discord.MessageAttachment('./command_classes/timer_classes/assets/combatTimerSwords.png', 'combatTimerSwords.png'),
            ])
            .setFooter(`Created by ${combatTimer.creator}`, 'attachment://clock.png')
            .setThumbnail('attachment://combatTimerSwords.png') 

        for(let player of players) {    //create a field for each player
            let timeString = player.timeToString();
            if(initiativeArray[combatTimer.initiativeIndex].player === player) timeString = "> " + timeString;
            messageEmbed.addField('``` ' + player.user + ' ```', timeString, true);
        }
        if(players.length % 3 == 2) messageEmbed.addField('\u200B','\u200B', true);
        
        let currName = PlayerTimer.get(combatTimer.initiativeIndex, initiativeArray);
        let nextName = PlayerTimer.get(combatTimer.initiativeIndex+1, initiativeArray);
        let readyName = PlayerTimer.get(combatTimer.initiativeIndex+2, initiativeArray);
        
        messageEmbed.addFields(
                { name: '\u200B', value: '\u200B' },
                { name: '``` Current Player ```', value: '⠀' + currName, inline: true},
                { name: '``` Up Next        ```', value: '⠀' + nextName, inline: true },
                { name: '``` Getting Ready  ```', value: '⠀' + readyName, inline: true },
            )
        
        return messageEmbed;
    }

    static get(index, initiativeArray){
        index = index % initiativeArray.length;
        let tmp = initiativeArray[index].player.user;
        if(initiativeArray[index].tag) tmp += ": " + initiativeArray[index].tag;
        return tmp;
    }
}