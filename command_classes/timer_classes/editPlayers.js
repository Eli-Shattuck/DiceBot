const PlayerTimer = require('./playerTimer.js');
const InitToken = require('./initToken.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');

const NUMS = UIEmojis.NUMS;
const PLAY = UIEmojis.PLAY;
const PAUSE = UIEmojis.PAUSE;
//const STOP = UIEmojis.STOP;
const NEXT = UIEmojis.NEXT;
//const INCREASE = UIEmojis.INCREASE;
//const DECREASE = UIEmojis.DECREASE;

module.exports = class EditPlayers{
    constructor(){
    }

    static editPlayerCheck(msg, info, combatTimerMap, addOrRemove, push){
        let timersByAuthor = [];    //create a list of all timers by the message author
        for(let [combatTimerID, combatTimer] of combatTimerMap){
            if(combatTimer.initMessage.author.id === msg.author.id) timersByAuthor.push(combatTimer);
        }
        if(timersByAuthor.length === 0) return 'You cannot edit your players because you have not made a combat timer.';
        else if(timersByAuthor.length === 1){
             addOrRemove(info, timersByAuthor[0], msg, push); //if they only have one timer, edit it
        }
        else if(timersByAuthor.length > 1) {
            let toSend = ""; //create a list of all the authors, will add a string in front of it
            for(let i = 0; i < timersByAuthor.length; i++){
                toSend += `\n${i+1}: ${timersByAuthor[i].title}, created at ${timersByAuthor[i].initMessage.createdAt}`;
            }
            if(timersByAuthor.length > 9) {
                push(
                    responses.reply(msg, `\nYou have too many timers. Please stop some of these by reacting to them with their X before trying again.` + toSend)
                )
                return;
            }

            push(
                responses.reply(
                    msg,
                    "You have multiple combat timers. Please choose one to edit:" + toSend,
                    newMessage => { //create a reaction of to the message for each combat timer, and edit the one matching their reaction
                        reactionHandler.addReactions(NUMS.slice(1, timersByAuthor.length+1), newMessage);
                        reactionHandler.addCallback(
                            NUMS.slice(1, timersByAuthor.length+1),
                            newMessage,
                            (reaction, user) => {
                                if(user.id != msg.author.id) return;
                                let timerIndex = NUMS.findIndex(elt => elt.id === reaction.emoji.id) - 1;
                                addOrRemove(info, timersByAuthor[timerIndex], msg, push);
                                reactionHandler.removeAllCallbacks(newMessage); 
                                newMessage.delete(); //remove the message after the combat timer to be edited has been chosen
                            }
                        );
                    }
                )
            )
        } else {
            return 'Something went wrong when trying to retrieve the combat timers.';
        }
    }

    static addPlayer(info, combatTimer, msg, push){
        let playerUp = combatTimer.initiativeArray[combatTimer.initiativeIndex].player;
        
        if(playerUp.running){  //pause the timer if it is running
            playerUp.pause();
            reactionHandler.removeReactions([NEXT, PAUSE], combatTimer.sentMessage);
            reactionHandler.addReactions([PLAY], combatTimer.sentMessage);
        }
        
        let name_tag;   //name tag has the name and player tag
		if(info[1].indexOf('_') >= 0) {
			name_tag = info[1].split('_');
		} else {
			name_tag = [info[1], undefined];
		}

        //use custom mins and secs if they are given, otherwise use defaults
        let mins = info[3] ? parseInt(info[3]) : combatTimer.defaultMins; 
        let secs = info[4] ? parseInt(info[4]) : combatTimer.defaultSecs;

        let curPlayer;
		for(let player of combatTimer.players){
            if(player.user == name_tag[0]) {
                let newTime = mins * 60 + secs;
                if (newTime > player.time) player.time = newTime;
                curPlayer = player;     //if the player exists, only want to make a new instance of them 
            }
        }
        if(curPlayer == undefined){     //make a new player if they dont exist
            curPlayer = new PlayerTimer(mins, secs, combatTimer.initMessage, name_tag[0], combatTimer, push);
            curPlayer.msg = combatTimer.sentMessage;
            combatTimer.players.push(curPlayer);
        }

        let initiative = info[2];
        let token = new InitToken(initiative, curPlayer, name_tag[1]);

        let insertIndex = 0;    //must find where to insert the initToken based on the given initiative
        while(combatTimer.initiativeArray[insertIndex].initiative > initiative) insertIndex++;
        
        combatTimer.initiativeArray.splice(insertIndex, 0, token);
        
        if(combatTimer.initiativeIndex > insertIndex) {
            //if the token was added before the current player, the current player's index is one higher
            combatTimer.initiativeIndex = combatTimer.initiativeIndex + 1;
        }

        push(
            responses.edit(
                combatTimer.sentMessage,
                PlayerTimer.makeEmbed(combatTimer)
            )
        );
    }

    static removePlayer(info, combatTimer, msg, push){
        let curPlayer = combatTimer.initiativeArray[combatTimer.initiativeIndex].player;
        let curInitiative = combatTimer.initiativeArray[combatTimer.initiativeIndex].initiative;

        if(curPlayer.running){  //pause the timer if it is running
            curPlayer.pause();
            reactionHandler.removeReactions([NEXT, PAUSE], combatTimer.sentMessage);
            reactionHandler.addReactions([PLAY], combatTimer.sentMessage);
        }

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

        if(combatTimer.initiativeArray.length === initialLength){   //if its the same length, no players were removed
            push(
                responses.reply(msg, `Player "${info[1]}" was not found in the combat timer.`)
            )
            return;
        }

        //reset the index in the initiativeArray, as it has changed size
        let newInitiative = combatTimer.initiativeArray.findIndex(element => element.initiative <= curInitiative);
        combatTimer.initiativeIndex = newInitiative >= 0 ? newInitiative : 0;

        push(
            responses.edit(
                combatTimer.sentMessage,
                PlayerTimer.makeEmbed(combatTimer)
            )
        );
    }
}