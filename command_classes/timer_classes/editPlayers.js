const PlayerTimer = require('./playerTimer.js');
const InitToken = require('./initToken.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const NUMS = UIEmojis.NUMS;

module.exports = class EditPlayers{
    constructor(){
    }

    static editPlayerCheck(msg, info, combatTimerMap, addOrRemove){
        let timersByAuthor = [];
        for(let [combatTimerID, combatTimer] of combatTimerMap){
            if(combatTimer.initMessage.author.id === msg.author.id) timersByAuthor.push(combatTimer);
        }
        if(timersByAuthor.length === 0) return 'You cannot edit your players because you have not made a combat timer.';
        else if(timersByAuthor.length === 1) addOrRemove(info, timersByAuthor[0], msg);
        else if(timersByAuthor.length > 1) {
            let toSend = "You have multiple combat timers. Please choose one to edit:";
            for(let i = 0; i < timersByAuthor.length; i++){
                toSend += `\n${i+1}: ${timersByAuthor[i].cTimerInfo.title}, created at ${timersByAuthor[i].initMessage.createdAt}`;
            }
            if(timersByAuthor.length > 9) {
                toSend += `\nYou have too many timers. Please stop some of these by reacting to them with ${UIEmojis.STOP.toString()} before trying again.`;
                msg.reply(toSend);
                return;
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
                        addOrRemove(info, timersByAuthor[timerIndex], msg);
                        reactionHandler.removeAllCallbacks(newMessage);
                        newMessage.delete();
                    }
                );
            });
        } else {
            return 'Something went wrong when trying to retrieve the combat timers.';
        }
    }

    static addPlayer(info, combatTimer){
        //console.log(combatTimer);
        let name_tag;
		if(info[1].indexOf('_') >= 0) {
			name_tag = info[1].split('_');
		} else {
			name_tag = [info[1], undefined];
		}
        let mins = info[3] ? parseInt(info[3]) : combatTimer.cTimerInfo.defaultMins;
        let secs = info[4] ? parseInt(info[4]) : combatTimer.cTimerInfo.defaultSecs;

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
        if(combatTimer.cTimerInfo.initiativeIndex > insertIndex) 
            combatTimer.cTimerInfo.initiativeIndex = combatTimer.cTimerInfo.initiativeIndex + 1;

        combatTimer.sentMessage.edit(
            PlayerTimer.makeEmbed(combatTimer)
        );
    }

    static removePlayer(info, combatTimer, msg){
        let name_tag;
        if(info[1].indexOf('_') >= 0) {
			name_tag = info[1].split('_');
		} else {
			name_tag = [info[1], undefined];
		}

        let initialLength = combatTimer.initiativeArray.length;
        if(name_tag[1]){
            //if there is a tag, only remove instances of that player with that tag from the initiativeArray
            combatTimer.initiativeArray = combatTimer.initiativeArray.filter(
                element => element.tag != name_tag[1] || element.player.user != name_tag[0]
                );
        } else {
            //remove all instances of the player from initiativeArray
            combatTimer.initiativeArray = combatTimer.initiativeArray.filter(
                element => element.player.user != name_tag[0]
                );
            //this keeps their timer, but it could be removed with this line:
                //combatTimer.players = combatTimer.players.filter(element => element.user != name_tag[0]);
        }

        if(combatTimer.initiativeArray.length === initialLength){
            msg.reply(`Player "${info[1]}" was not found in the combat timer.`);
            return;
        }

        combatTimer.sentMessage.edit(
            PlayerTimer.makeEmbed(combatTimer)
        );
    }
}