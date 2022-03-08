module.exports = class Command{
    constructor(onNewResponse){
        this.onNewResponse = onNewResponse;
    }

    static match(msg){}

    handle(msg){}

    error(msg, errMsg) {
        this.push( 
            responses.reply(msg, `${errMsg} Try --help for more info.`) 
        );
    }

    push(res) {
        this.onNewResponse(res);
    }
}