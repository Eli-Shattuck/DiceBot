const PlayerTimer = require('./playerTimer.js');
const InitToken = require('./initToken.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const NUMS = UIEmojis.NUMS;

module.exports = class EditPlayers{
    constructor(){
    }

    static addPlayerCheck(msg, info, combatTimerMap){
        let timersByAuthor = [];
        for(let [combatTimerID, combatTimer] of combatTimerMap){
            if(combatTimer.initMessage.author.id === msg.author.id) timersByAuthor.push(combatTimer);
        }
        if(timersByAuthor.length === 0) return 'You cannot add a player because you have not made a combat timer.';
        else if(timersByAuthor.length === 1) this.addPlayer(msg, info, timersByAuthor[0]);
        else if(timersByAuthor.length > 1) {
            let toSend = "You have multiple combat timers. Please choose one to edit:";
            for(let i = 0; i < timersByAuthor.length; i++){
                toSend += `\n${i+1}: ${timersByAuthor[i].cTimerInfo[1]}, created at ${timersByAuthor[i].initMessage.createdAt}`;
            }
            msg.reply(toSend)
            .then(newMessage => {
                reactionHandler.addReactions(NUMS.slice(1, timersByAuthor.length+1), newMessage);
                reactionHandler.addCallback(
                    NUMS.slice(1, timersByAuthor.length+1),
                    newMessage,
                    (reaction, user) => {
                        if(user.id != msg.author.id) return;
                        let timerIndex = NUMS.findIndex(elt => elt.id === reaction.emoji.id) - 1;
                        EditPlayers.addPlayer(msg, info, timersByAuthor[timerIndex]);
                        reactionHandler.removeAllCallbacks(newMessage);
                        newMessage.delete();
                    }
                );
            });
        } else {
            return 'Something went wrong when trying to retrieve the combat timers.';
        }
    }

    static addPlayer(msg, info, combatTimer){
        //console.log(combatTimer);
        let name_tag;
		if(info[1].indexOf('_') >= 0) {
			name_tag = info[1].split('_');
		} else {
			name_tag = [info[1], undefined];
		}
        let mins = info[3] ? parseInt(info[3]) : combatTimer.cTimerInfo[3];
        let secs = info[4] ? parseInt(info[4]) : combatTimer.cTimerInfo[4];

        let curPlayer;
		for(let player of combatTimer.players){
            if(player.user == name_tag[0]) {
                let newTime = mins * 60 + secs;
                if (newTime > player.time) player.time = newTime;
                curPlayer = player;
            }
        }
        if(curPlayer == undefined){ 
            curPlayer = new PlayerTimer(mins, secs, combatTimer.sentMessage, name_tag[0]);
            combatTimer.players.push(curPlayer);
        }
        let initiative = info[2];
        let token = new InitToken(initiative, curPlayer, name_tag[1]);

        let insertIndex = 0;
        while(combatTimer.initiativeArray[insertIndex].initiative > initiative) insertIndex++;
        console.log(insertIndex);
        combatTimer.initiativeArray.splice(insertIndex, 0, token);
        console.log(combatTimer.initiativeArray);
        if(combatTimer.cTimerInfo[0] > insertIndex) combatTimer.cTimerInfo[0] = combatTimer.cTimerInfo[0] + 1;

        combatTimer.sentMessage.edit(
            PlayerTimer.makeEmbed(combatTimer.players, combatTimer.initiativeArray, combatTimer.cTimerInfo)
        );
    }

    static removePlayerCheck(msg, info, combatTimerMap){

    }
}