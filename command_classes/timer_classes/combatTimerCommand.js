const Command = require('../command.js');
const PlayerTimer = require('./playerTimer.js');
const ReactionHandler = require('../../io_classes/reactionHandler.js');

const UP = '🔼';
const DOWN = '🔽';
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
        this.initiativeIndex = 0;
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
				for(let player in ct.players){
                    if(player.user === name_tag[0]) curPlayer = player;
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
                //console.log(player.playerArray, player.initiativeArray, player.initiativeIndex);
            });
			
			let toSend = PlayerTimer.makeEmbed(title, creator, ct.players, ct.initiativeArray, ct.initiativeIndex);			
			
			msg.channel.send(toSend)
			.then(message => {
				ct.players.forEach(player => player.message = message);
				ReactionHandler.addReactions([STOP, PLAY], message);
                this.combatTimerMap[message.id] = ct;
			});
		} else {
			if(header) this.error(msg, 'The first line of your message does not match the expected format.');
            else this.error(msg, 'Your message does not match the expected format because you do not have enough lines.');
		}
		return;
    }
}