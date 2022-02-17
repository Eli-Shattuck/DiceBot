const Command = require('../command.js');
const PlayerTimer = require('./playerTimer.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');

//const UP = '🔼';
//const DOWN = '🔽';
//const UP = '📈';
//const DOWN = '📉';

const PAUSE = '⏸';
const PLAY = '▶️';
const STOP = '⏹';
const NEXT = '⏭';

// let players = [];
// let initiativeArray = []; //array of initTokens
// let initiativeIndex = 0;

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
				for(let i in ct.players){
                    //console.log(player, name_tag[0]);
                    if(ct.players[i].user == name_tag[0]) curPlayer = ct.players[i];
                }
                if(curPlayer == undefined){ 
                    curPlayer = new PlayerTimer(mins, secs, msg, name_tag[0], title, creator);
                    ct.players.push(curPlayer);
                }
                
                let token = new InitToken(row[2], curPlayer, name_tag[1]);
                ct.initiativeArray.push(token);
            }
            //console.log(ct.players);
			ct.initiativeArray.sort((a,b) => b.initiative - a.initiative);
            ct.players.forEach(player => {
                player.playerArray = ct.players;
                player.initiativeArray = ct.initiativeArray;
                player.initiativeIndex = ct.initiativeIndex;
                //console.log(player.playerArray, player.initiativeArray, player.initiativeIndex);
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

    onPlayPause(msg, emoji){
        let ct = this.combatTimerMap[msg.id];
        let player = ct.initiativeArray[ct.initiativeIndex[0]].player;
        if(player.running){
            player.pause();
            reactionHandler.removeReactions([NEXT], msg);
            if(emoji == PLAY) return;
        } else {
            player.start();
            reactionHandler.addReactions([NEXT], msg);
            if(emoji == PAUSE) return;
        }
        reactionHandler.toggleEmoji(PLAY, PAUSE, msg);
    }

    onNext(msg, emoji){
        let ct = this.combatTimerMap[msg.id];
        ct.initiativeArray[ct.initiativeIndex[0]].player.pause();

        ct.initiativeIndex[0] = (ct.initiativeIndex[0] + 1) % ct.initiativeArray.length;
        ct.initiativeArray[ct.initiativeIndex[0]].player.start();
    }

    onStop(msg, emoji){
        let ct = this.combatTimerMap[msg.id];
        ct.initiativeArray[ct.initiativeIndex[0]].player.stop();
        this.combatTimerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, NEXT, STOP], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}