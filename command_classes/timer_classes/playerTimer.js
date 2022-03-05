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
        let cTimerInfo = combatTimer.cTimerInfo;

        let messageEmbed =  new Discord.MessageEmbed()
            .setColor('#fc80a2')
            .setTitle(cTimerInfo.title)
            .setFooter(`Created by ${cTimerInfo.creator}`, 'https://cdn-icons-png.flaticon.com/512/2784/2784459.png') //picture of clock
            .setThumbnail('https://cdn-icons.flaticon.com/png/128/5522/premium/5522602.png?token=exp=1646280339~hmac=122c0cca26bb338d89dcee504a82035f') //picture of swords

        for(let player of players) {    //create a field for each player
            let timeString = player.timeToString();
            if(initiativeArray[cTimerInfo.initiativeIndex].player === player) timeString = "> " + timeString;
            messageEmbed.addField('``` ' + player.user + ' ```', timeString, true);
        }
        if(players.length % 3 == 2) messageEmbed.addField('\u200B','\u200B', true);
        
        let currName = PlayerTimer.get(cTimerInfo.initiativeIndex, initiativeArray);
        let nextName = PlayerTimer.get(cTimerInfo.initiativeIndex+1, initiativeArray);
        let readyName = PlayerTimer.get(cTimerInfo.initiativeIndex+2, initiativeArray);
        
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