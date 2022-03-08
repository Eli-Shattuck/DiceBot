const Command = require('../command.js');
const Timer = require('./timer.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');
const UIEmojis = require('../../io_classes/UIEmojis');
const responses = require('../../io_classes/responses.js');

const PLAY = UIEmojis.PLAY;
const PAUSE = UIEmojis.PAUSE;
const STOP = UIEmojis.STOP;
const INCREASE = UIEmojis.INCREASE;
const DECREASE = UIEmojis.DECREASE;

module.exports = class TimerCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse);
        this.timerMap = new Map();
    }

    static getTimerRe(){
        return /--timer\s+([0-9]+):([0-9]+)/;
    }

    static match(msg){
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

        let t = new Timer(mins, secs, msg, msg.author, this.push.bind(this));

        this.push(
            responses.message(
                msg.channel,
                t.formatTimeString(),
                message => {
                    t.msg = message;
                    this.timerMap[t.msg.id] = t;
                    reactionHandler.addCallback(
                        [PLAY, PAUSE],
                        t.msg,
                        this.onPlayPause.bind(this)
                    );
                    reactionHandler.addCallback(
                        [INCREASE, DECREASE],
                        t.msg,
                        this.onUpDown.bind(this)
                    );
                    reactionHandler.addCallback(
                        [STOP],
                        t.msg,
                        this.onStop.bind(this)
                    );
                    reactionHandler.addReactions([STOP, DECREASE, PLAY], t.msg);
                }
            )
        );

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