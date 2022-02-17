const Command = require('../command.js');
const Timer = require('./timer.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/UIEmojis');

const PLAY = UIEmojis.PLAY;
const PAUSE = UIEmojis.PAUSE;
const STOP = UIEmojis.STOP;
const INCREASE = UIEmojis.INCREASE;
const DECREASE = UIEmojis.DECREASE;

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
                [PLAY.toString(), PAUSE.toString()],
                t.message,
                this.onPlayPause.bind(this)
            );
            reactionHandler.addCallback(
                [INCREASE.toString(), DECREASE.toString()],
                t.message,
                this.onUpDown.bind(this)
            );
            reactionHandler.addCallback(
                [STOP.toString()],
                t.message,
                this.onStop.bind(this)
            );
            reactionHandler.addReactions([STOP.toString(), DECREASE.toString(), PLAY.toString()], message);
        });


        return;
    }

    onPlayPause(reaction){
        let msg = reaction.message;
        let emoji = reaction.emoji.name;

        let t = this.timerMap[msg.id];
        if(t.running){
            t.pause();
            if(emoji == PLAY.toString()) return;
        } else {
            t.start();
            if(emoji == PAUSE.toString()) return;
        }
        reactionHandler.toggleEmoji(PLAY, PAUSE, msg);
    }

    onUpDown(reaction){
        console.log('called upDown');
        this.timerMap[reaction.message.id].increment *= -1;
        reactionHandler.toggleEmoji(INCREASE, DECREASE, reaction.message);
    }

    onStop(reaction){
        let msg = reaction.message;
        let t = this.timerMap[msg.id];
        t.stop();
        this.timerMap.delete(msg.id);
        reactionHandler.removeReactions([PLAY, PAUSE, INCREASE, DECREASE, STOP], msg);
        reactionHandler.removeAllCallbacks(msg);
    }
}