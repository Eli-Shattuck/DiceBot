module.exports = class Command{
    constructor(){}

    match(msg){}

    handle(msg){}

    error(msg, errMsg) {
        msg.reply(`${errMsg} Try --help for more info.`)
    }
}