const Command = require('../command.js');
const Timer = require('./timer.js');

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
    };
    
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
            this.timerMap[msg.id] = t;
        });

        return;
    };
}