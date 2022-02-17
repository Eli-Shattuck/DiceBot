module.exports = class Timer{
    constructor(mins, secs, initMessage, user) {
        this.intervalId;
        this.time = mins * 60 + secs;
        this.user = user;
        this.message;
        this.initMessage = initMessage;
        this.running = false;
        this.increment = -1;
    }

    timeToString() {
        let seconds = Math.abs(this.time);
        let sign = this.time < 0 ? '-' : '';
        
        let mins = Math.floor(seconds/60);
        let secs = seconds % 60;

        mins = (''+mins).padStart(2, '0');
        secs = (''+secs).padStart(2, '0');

        return sign + mins + ':' + secs;
    }

    formatTimeString() {
        return `${this.user}, your time: ${this.timeToString()}.`;
    }

    start() {
        this.running = true;
        this.id = setInterval(() => {
            this.time += this.increment;
            if(this.time % 2 === 0) this.editMessage();
        }, 1000);
    }

    pause(prefix) {
        if(this.running) {
            clearInterval(this.id);
            this.id = undefined;
            this.running = false;
        }
        this.editMessage(prefix);
    }

    stop() {
        this.pause('Stopped: ');
    }

    editMessage(prefix) {
        //console.log(this.message);
        let newMsg = this.formatTimeString();
        if(prefix) newMsg = prefix + newMsg;
        this.message.edit(
            newMsg
        )
    }
}