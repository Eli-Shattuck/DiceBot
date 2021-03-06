const Command = require('../command.js');
const PlayerTimer = require('./playerTimer.js');
const EditPlayers = require('./editPlayers.js');
const InitToken = require('./initToken.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const responses = require('../../io_classes/responses.js');

const PLAY = UIEmojis.PLAY;
const PAUSE = UIEmojis.PAUSE;
const STOP = UIEmojis.STOP;
const NEXT = UIEmojis.NEXT;
const INCREASE = UIEmojis.INCREASE;
const DECREASE = UIEmojis.DECREASE;

let globalCombatTimerMap = new Map();

class CTimer{
    constructor(message, title, creator){
        this.initMessage = message;
        this.sentMessage;
        this.players = [];              //array of playerTimers
        this.initiativeArray = [];      //array of initTokens
        this.initiativeIndex = 0;       //current index in initiative array
        this.title = title;
        this.creator = creator;
        this.defaultMins = 0;           //default mins for a player
        this.defaultSecs = 0;           //default secs for a player
    }
}


module.exports = class CombatTimerCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--combat-timer');
        this.combatTimerMap = globalCombatTimerMap;
    }

    //static functions are used to store the regular expressions for inputs
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

    handle(msg){
        let lines = msg.content.split('\n');
        let header = lines[0].match(CombatTimerCommand.getCTimerReTitle());
        let addPlayer = lines[0].match(CombatTimerCommand.getCTimerReAddPlayer());
        let removePlayer = lines[0].match(CombatTimerCommand.getCTimerReRemovePlayer());

        if(header && lines.length > 1) {
            this.initCombatTimer(msg, lines, header);
		} else if(addPlayer){
            let errmsg = EditPlayers.editPlayerCheck(msg, addPlayer, this.combatTimerMap, EditPlayers.addPlayer, this.push.bind(this));
            if(errmsg) this.error(msg, errmsg);
        } else if(removePlayer){
            let errmsg = EditPlayers.editPlayerCheck(msg, removePlayer, this.combatTimerMap, EditPlayers.removePlayer, this.push.bind(this));
            if(errmsg) this.error(msg, errmsg);
        } else{
			this.error(msg, 'Your message does not match the expected format.');
		}
		return;
    }

    initCombatTimer(msg, lines, header){
        let combatTimer = new CTimer(msg, header[3], msg.author.username);

        combatTimer.defaultMins = parseInt(header[1]);
        combatTimer.defaultSecs = parseInt(header[2]);
        //set the default amount of time for a player in the combat timer
		
		for(let i = 1; i < lines.length; i++) {
			let row = lines[i].match(CombatTimerCommand.getCTimerRePlayers());
			
			if(row == undefined) {
				this.error(msg, `Row ${i+1} of your command does not match the format of the expected input.`);
				return;
			}
			
			let name_tag;   //name_tag holds the name and player tag for a player
			if(row[1].indexOf('_') >= 0) {
				name_tag = row[1].split('_');
			} else {
				name_tag = [row[1], undefined];
			}
			let mins = row[3] ? parseInt(row[3]) : combatTimer.defaultMins;
            let secs = row[4] ? parseInt(row[4]) : combatTimer.defaultSecs;
			//use the custom time for a player if there is one, otherwise use default time

            let curPlayer;
			for(let player of combatTimer.players){
                if(player.user == name_tag[0]) {
                    let newTime = mins * 60 + secs;
                    if (newTime > player.time) player.time = newTime;
                    curPlayer = player;     //if the player exists, only create a new instance in the initiativeArray
                }
            }
            if(curPlayer == undefined){ 
                curPlayer = new PlayerTimer(mins, secs, msg, name_tag[0], combatTimer, this.push.bind(this));
                combatTimer.players.push(curPlayer);    //if the player does not exist, make a new player
            }
            
            let token = new InitToken(row[2], curPlayer, name_tag[1]);
            combatTimer.initiativeArray.push(token);
        }

		combatTimer.initiativeArray.sort((a,b) => b.initiative - a.initiative);
		
        this.push(
            responses.message(
                msg,
                PlayerTimer.makeEmbed(combatTimer),
                undefined,
                message => {      //setup emojis for user to interact with the timer
                    combatTimer.players.forEach(player => player.msg = message);
                    combatTimer.sentMessage = message;
                    this.combatTimerMap.set(message.id, combatTimer);
        
                    reactionHandler.addCallback(
                        [PLAY, PAUSE],
                        message,
                        this.onPlayPause.bind(this)
                    );
                    reactionHandler.addCallback(
                        [INCREASE, DECREASE],
                        message,
                        this.onUpDown.bind(this)
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
                    reactionHandler.addReactions([STOP, DECREASE, PLAY], message);
                }
            )
        );
    }

    onPlayPause(reaction){
        let msg = reaction.message;
        let emoji = reaction.emoji.name;

        let combatTimer = this.combatTimerMap.get(msg.id);
        let player = combatTimer.initiativeArray[combatTimer.initiativeIndex].player;
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
        combatTimer.initiativeArray[combatTimer.initiativeIndex].player.pause();
        combatTimer.initiativeIndex = (combatTimer.initiativeIndex + 1) % combatTimer.initiativeArray.length; 
        combatTimer.initiativeArray[combatTimer.initiativeIndex].player.start();
        reaction.users.remove(user.id); //remove the user's reaction so they can press next again
    }

    onUpDown(reaction, user){   //changes if the timers count up or down
        let msg = reaction.message;
        let combatTimer = this.combatTimerMap.get(msg.id);
        if(user.id != combatTimer.initMessage.author.id) return;
        combatTimer.players.forEach(element => {
            element.increment *= -1; 
        });
        reactionHandler.toggleEmoji(INCREASE, DECREASE, reaction.message);
    }

    onStop(reaction, user){
        let msg = reaction.message;
        let combatTimer = this.combatTimerMap.get(msg.id);
        if(user.id != combatTimer.initMessage.author.id) return;
        //permanently stops the timer and clears it from the combat timer map
        combatTimer.initiativeArray[combatTimer.initiativeIndex].player.stop();
        this.combatTimerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, NEXT, STOP, INCREASE, DECREASE], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}