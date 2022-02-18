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
        this.players = [];
        this.initiativeArray = []; //array of initTokens
        this.cTimerInfo = [
            0,  //current index in initiative array
            title,
            creator,
            0,  //default mins for a player
            0,  //default secs for a player
        ];
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
            let errmsg = EditPlayers.addPlayerCheck(msg, addPlayer, this.combatTimerMap);
            if(errmsg) this.error(msg, errmsg);
        } else if(removePlayer){
            EditPlayers.removePlayerCheck(msg, removePlayer, this.combatTimerMap);
        } else{
			this.error(msg, 'Your message does not match the expected format.');
		}
		return;
    }

    initCombatTimer(msg, lines, header){
        let ct = new CTimer(msg, header[3], msg.author.username);

        ct.cTimerInfo[3] = parseInt(header[1]); //default mins
        ct.cTimerInfo[4] = parseInt(header[2]); //default secs
        
		
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
			let mins = row[3] ? parseInt(row[3]) : ct.cTimerInfo[3];
            let secs = row[4] ? parseInt(row[4]) : ct.cTimerInfo[4];
			
            let curPlayer;
			for(let player of ct.players){
                if(player.user == name_tag[0]) {
                    let newTime = mins * 60 + secs;
                    if (newTime > player.time) player.time = newTime;
                    curPlayer = player;
                }
            }
            if(curPlayer == undefined){ 
                curPlayer = new PlayerTimer(mins, secs, msg, name_tag[0]);
                ct.players.push(curPlayer);
            }
            
            let token = new InitToken(row[2], curPlayer, name_tag[1]);
            ct.initiativeArray.push(token);
        }

		ct.initiativeArray.sort((a,b) => b.initiative - a.initiative);
        ct.players.forEach(player => {
            player.playerArray = ct.players;
            player.initiativeArray = ct.initiativeArray;
            player.cTimerInfo = ct.cTimerInfo;
        });
		
		let toSend = PlayerTimer.makeEmbed(ct.players, ct.initiativeArray, ct.cTimerInfo);			
		
		msg.channel.send(toSend)
		.then(message => {
			ct.players.forEach(player => player.message = message);
            ct.sentMessage = message;
            this.combatTimerMap.set(message.id, ct);

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

        let ct = this.combatTimerMap.get(msg.id);
        let player = ct.initiativeArray[ct.cTimerInfo[0]].player;
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
        let ct = this.combatTimerMap.get(msg.id);

        ct.initiativeArray[ct.cTimerInfo[0]].player.pause();
        ct.cTimerInfo[0] = (ct.cTimerInfo[0] + 1) % ct.initiativeArray.length;
        ct.initiativeArray[ct.cTimerInfo[0]].player.start();
        reaction.users.remove(user.id);
    }

    onStop(reaction){
        let msg = reaction.message;
        let ct = this.combatTimerMap.get(msg.id);

        ct.initiativeArray[ct.cTimerInfo[0]].player.stop();
        this.combatTimerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, NEXT, STOP], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}