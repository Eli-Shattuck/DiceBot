module.exports = class Command{
    constructor(){
        this.responseList = [];
    }

    match(msg){}

    handle(msg){}

    error(msg, errMsg) {
        msg.reply(`${errMsg} Try --help for more info.`)
    }

    clear(){
        this.responseList = [];
    }
}