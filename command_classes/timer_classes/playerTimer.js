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
            .setAuthor(`Creator: ${cTimerInfo.creator}`)
            .setDescription('Combat Timer!')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/2784/2784459.png')

        for(let player of players) {
            let timeString = player.timeToString();
            if(initiativeArray[cTimerInfo.initiativeIndex].player === player) timeString = "> " + timeString;
            messageEmbed.addField('```' + player.user + '```', timeString, false);
        }
        
        let currName = PlayerTimer.get(cTimerInfo.initiativeIndex, initiativeArray);
        let deckName = PlayerTimer.get(cTimerInfo.initiativeIndex+1, initiativeArray);
        let deckDeckName = PlayerTimer.get(cTimerInfo.initiativeIndex+2, initiativeArray);
        
        messageEmbed.addFields(
                { name: '\u200B', value: '\u200B' },
                { name: '```Current Player   ```', value: currName, inline: true},
                { name: '```On Deck          ```', value: deckName, inline: true },
                { name: '```On "On Deck" Deck```', value: deckDeckName, inline: true },
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