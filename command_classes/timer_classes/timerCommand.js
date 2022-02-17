const Command = require('../command.js');
const Timer = require('./timer.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');

const UP = '🔼';
const DOWN = '🔽';
//const UP = '📈';
//const DOWN = '📉';

const PAUSE = '⏸';
const PLAY = '▶️';
const STOP = '⏹';
//const NEXT = '⏭';

module.exports = class TimerCommand extends Command{
    constructor(){
        super();
        this.timerMap = new Map();
    }

    static getTimerRe(){
        return /--timer\s+([0-9]+):([0-9]+)/;
    }

    match(msg){
        return msg.content.indexOf('--timer') === 0;
    }
    
    handle(msg){
        let matchTimer = msg.content.match(TimerCommand.getTimerRe());
        if(!matchTimer) {
            this.error(msg, 'Your message did not match the expected format.');
            return;
        }
        let mins = parseInt(matchTimer[1]);
        let secs = parseInt(matchTimer[2]);

        let t = new Timer(mins, secs, msg, msg.author);

        msg.channel.send(t.formatTimeString()).then(message => {
            t.message = message;
            this.timerMap[t.message.id] = t;
            reactionHandler.addCallback(
                [PLAY, PAUSE],
                t.message,
                this.onPlayPause.bind(this)
            );
            reactionHandler.addCallback(
                [UP, DOWN],
                t.message,
                this.onUpDown.bind(this)
            );
            reactionHandler.addCallback(
                [STOP],
                t.message,
                this.onStop.bind(this)
            );
            reactionHandler.addReactions([STOP, DOWN, PLAY], message);
        });


        return;
    }

    onPlayPause(reaction){
        let msg = reaction.message;
        let emoji = reaction.emoji.name;

        let t = this.timerMap[msg.id];
        if(t.running){
            t.pause();
            if(emoji == PLAY) return;
        } else {
            t.start();
            if(emoji == PAUSE) return;
        }
        reactionHandler.toggleEmoji(PLAY, PAUSE, msg);
    }

    onUpDown(reaction){
        this.timerMap[reaction.message.id].increment *= -1;
        reactionHandler.toggleEmoji(UP, DOWN, reaction.message);
    }

    onStop(reaction){
        let msg = reaction.message;
        let t = this.timerMap[msg.id];
        t.stop();
        this.timerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, UP, DOWN, STOP], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}