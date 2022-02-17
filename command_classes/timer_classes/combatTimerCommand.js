const Command = require('../command.js');
const PlayerTimer = require('./playerTimer.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');

const PLAY = UIEmojis.PLAY;
const PAUSE = UIEmojis.PAUSE;
const STOP = UIEmojis.STOP;
const NEXT = UIEmojis.NEXT;

class CTimer{
    constructor(){
        this.players = [];
        this.initiativeArray = []; //array of initTokens
        this.initiativeIndex = [0];
    }
}

class InitToken{
    constructor(initiative, player, tag){
        this.initiative = initiative;
        this.player = player;
        this.tag = tag;
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

    match(msg){
        return msg.content.indexOf('--combat-timer') === 0;
    }

    handle(msg){
        let lines = msg.content.split('\n');
        let header = lines[0].match(CombatTimerCommand.getCTimerReTitle());

        if(header && lines.length > 1) {
            let ct = new CTimer();

            let title = header[3];
            let creator = msg.author.username;
            let defaultMins = parseInt(header[1]);
            let defaultSecs = parseInt(header[2]);
			
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
				let mins = row[3] ? parseInt(row[3]) : defaultMins;
                let secs = row[4] ? parseInt(row[4]) : defaultSecs;
				
                let curPlayer;
				for(let player of ct.players){
                    if(player.user == name_tag[0]) {
                        let newTime = mins * 60 + secs;
                        if (newTime > player.time) player.time = newTime;
                        curPlayer = player;
                    }
                }
                if(curPlayer == undefined){ 
                    curPlayer = new PlayerTimer(mins, secs, msg, name_tag[0], title, creator);
                    ct.players.push(curPlayer);
                }
                
                let token = new InitToken(row[2], curPlayer, name_tag[1]);
                ct.initiativeArray.push(token);
            }

			ct.initiativeArray.sort((a,b) => b.initiative - a.initiative);
            ct.players.forEach(player => {
                player.playerArray = ct.players;
                player.initiativeArray = ct.initiativeArray;
                player.initiativeIndex = ct.initiativeIndex;
            });
			
			let toSend = PlayerTimer.makeEmbed(title, creator, ct.players, ct.initiativeArray, ct.initiativeIndex);			
			
			msg.channel.send(toSend)
			.then(message => {
				ct.players.forEach(player => player.message = message);
                this.combatTimerMap[message.id] = ct;

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
		} else {
			if(header) this.error(msg, 'The first line of your message does not match the expected format.');
            else this.error(msg, 'Your message does not match the expected format because you do not have enough lines.');
		}
		return;
    }

    onPlayPause(reaction){
        let msg = reaction.message;
        let emoji = reaction.emoji.name;

        let ct = this.combatTimerMap[msg.id];
        let player = ct.initiativeArray[ct.initiativeIndex[0]].player;
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
        let ct = this.combatTimerMap[msg.id];

        ct.initiativeArray[ct.initiativeIndex[0]].player.pause();
        ct.initiativeIndex[0] = (ct.initiativeIndex[0] + 1) % ct.initiativeArray.length;
        ct.initiativeArray[ct.initiativeIndex[0]].player.start();
        reaction.users.remove(user.id);
    }

    onStop(reaction){
        let msg = reaction.message;
        let ct = this.combatTimerMap[msg.id];

        ct.initiativeArray[ct.initiativeIndex[0]].player.stop();
        this.combatTimerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, NEXT, STOP], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}