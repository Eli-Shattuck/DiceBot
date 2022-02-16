module.exports = class Timer{
    constructor(mins, secs){
        this.intervalId;
        this.time = mins*60 + secs;
        this.user;
        this.message;
        this.initMessage;
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

    start() {
        this.running = true;
        this.id = setInterval(() => {
            this.time += this.increment;
            if(this.time % 2 === 0) this.editMessage();
        }, 1000);
    }

    stop() {
        clearInterval(this.id);
        this.id = undefined;
        this.running = false;
        this.editMessage();
    }

    editMessage() {
        console.log(this.message);
        this.message.edit(
            `${this.user}, your time: ${this.timeToString()}.`
        )
    }
}