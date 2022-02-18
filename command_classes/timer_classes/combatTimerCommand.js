const Command = require('../command.js');
const PlayerTimer = require('./playerTimer.js');
const EditPlayers = require('./editPlayers.js');
const InitToken = require('./initToken.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');

const PLAY = UIEmojis.PLAY;
const PAUSE = UIEmojis.PAUSE;
const STOP = UIEmojis.STOP;
const NEXT = UIEmojis.NEXT;

class CTimer{
    constructor(message, title, creator){
        this.initMessage = message;
        this.sentMessage;
        this.players = [];          //array of playerTimers
        this.initiativeArray = [];  //array of initTokens
        this.cTimerInfo = {
            initiativeIndex: 0,     //current index in initiative array
            title: title,
            creator: creator,
            defaultMins: 0,         //default mins for a player
            defaultSecs: 0,         //default secs for a player
        };
    }
}



module.exports = class CombatTimerCommand extends Command{
    constructor(){
        super();
        this.combatTimerMap = new Map();
    }

    static getCTimerReTitle(){
        return /--combat-timer\s+(\d+):(\d+)\s+(.+)/;
    }

    static getCTimerRePlayers(){
        return /"([^_]+(?:_[^_]+)?)"\s+(-?\d+)(?:\s*(?:(\d+):(\d+)))?$/;
    }

    static getCTimerReAddPlayer(){
        return /--combat-timer addplayer "([^_]+(?:_[^_]+)?)"\s+(-?\d+)(?:\s*(?:(\d+):(\d+)))?$/;
    }

    static getCTimerReRemovePlayer(){
        return /--combat-timer removeplayer "([^_]+(?:_[^_]+)?)"/;
    }

    match(msg){
        return msg.content.indexOf('--combat-timer') === 0;
    }

    handle(msg){
        let lines = msg.content.split('\n');
        let header = lines[0].match(CombatTimerCommand.getCTimerReTitle());
        let addPlayer = lines[0].match(CombatTimerCommand.getCTimerReAddPlayer());
        let removePlayer = lines[0].match(CombatTimerCommand.getCTimerReRemovePlayer());

        if(header && lines.length > 1) {
            this.initCombatTimer(msg, lines, header);
		} else if(addPlayer){
            let errmsg = EditPlayers.editPlayerCheck(msg, addPlayer, this.combatTimerMap, EditPlayers.addPlayer);
            if(errmsg) this.error(msg, errmsg);
        } else if(removePlayer){
            let errmsg = EditPlayers.editPlayerCheck(msg, removePlayer, this.combatTimerMap, EditPlayers.removePlayer);
            console.log(errmsg);
            if(errmsg) this.error(msg, errmsg);
        } else{
			this.error(msg, 'Your message does not match the expected format.');
		}
		return;
    }

    initCombatTimer(msg, lines, header){
        let combatTimer = new CTimer(msg, header[3], msg.author.username);

        combatTimer.cTimerInfo.defaultMins = parseInt(header[1]);
        combatTimer.cTimerInfo.defaultSecs = parseInt(header[2]);
        //set the default amount of time for a player in the combat timer
		
		for(let i = 1; i < lines.length; i++) {
			let row = lines[i].match(CombatTimerCommand.getCTimerRePlayers());
			
			if(row == undefined) {
				this.error(msg, `Row ${i+1} of your command does not match the format of the expected input.`);
				return;
			}
			
			let name_tag;
			if(row[1].indexOf('_') >= 0) {
				name_tag = row[1].split('_');
			} else {
				name_tag = [row[1], undefined];
			}
			let mins = row[3] ? parseInt(row[3]) : combatTimer.cTimerInfo.defaultMins;
            let secs = row[4] ? parseInt(row[4]) : combatTimer.cTimerInfo.defaultSecs;
			//use the custom time for a player if there is one, otherwise use default time

            let curPlayer;
			for(let player of combatTimer.players){
                if(player.user == name_tag[0]) {
                    let newTime = mins * 60 + secs;
                    if (newTime > player.time) player.time = newTime;
                    curPlayer = player;
                }
            }
            if(curPlayer == undefined){ 
                curPlayer = new PlayerTimer(mins, secs, msg, name_tag[0], combatTimer);
                combatTimer.players.push(curPlayer);
            }
            
            let token = new InitToken(row[2], curPlayer, name_tag[1]);
            combatTimer.initiativeArray.push(token);
        }

		combatTimer.initiativeArray.sort((a,b) => b.initiative - a.initiative);
        // combatTimer.players.forEach(player => {
        //     player.combatTimer = ct;
        //     //give the player access to the info needed to edit the message with makeEmbed
        // });
		
		let toSend = PlayerTimer.makeEmbed(combatTimer);			
		
		msg.channel.send(toSend)
		.then(message => {
			combatTimer.players.forEach(player => player.message = message);
            combatTimer.sentMessage = message;
            this.combatTimerMap.set(message.id, combatTimer);

            reactionHandler.addCallback(
                [PLAY, PAUSE],
                message,
                this.onPlayPause.bind(this)
            );
            reactionHandler.addCallback(
                [NEXT],
                message,
                this.onNext.bind(this)
            );
            reactionHandler.addCallback(
                [STOP],
                message,
                this.onStop.bind(this)
            );
            reactionHandler.addReactions([STOP, PLAY], message);
		});
    }

    onPlayPause(reaction){
        let msg = reaction.message;
        let emoji = reaction.emoji.name;

        let combatTimer = this.combatTimerMap.get(msg.id);
        let player = combatTimer.initiativeArray[combatTimer.cTimerInfo.initiativeIndex].player;
        if(player.running && emoji == PAUSE.name){
            player.pause();
            reactionHandler.removeReactions([NEXT, PAUSE], msg);
            reactionHandler.addReactions([PLAY], msg);
        } else if(!player.running && emoji == PLAY.name){
            player.start();
            reactionHandler.removeReactions([PLAY], msg);
            reactionHandler.addReactions([NEXT, PAUSE], msg);
        }
    }

    onNext(reaction, user){
        let msg = reaction.message;
        let combatTimer = this.combatTimerMap.get(msg.id);
        //stops the current player's timer, moves to next in initiative and starts their timer
        combatTimer.initiativeArray[combatTimer.cTimerInfo.initiativeIndex].player.pause();
        combatTimer.cTimerInfo.initiativeIndex = (combatTimer.cTimerInfo.initiativeIndex + 1) % combatTimer.initiativeArray.length; 
        combatTimer.initiativeArray[combatTimer.cTimerInfo.initiativeIndex].player.start();
        reaction.users.remove(user.id); //remove the user's reaction so they can press next again
    }

    onStop(reaction){
        let msg = reaction.message;
        let combatTimer = this.combatTimerMap.get(msg.id);
        //permanently stops the timer and clears it from the combat timer map
        combatTimer.initiativeArray[combatTimer.cTimerInfo.initiativeIndex].player.stop();
        this.combatTimerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, NEXT, STOP], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}