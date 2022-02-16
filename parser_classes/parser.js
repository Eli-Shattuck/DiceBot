const commandHandlers = require('./commands.js')


module.exports = class Parser{
    constructor(msg){
        this.msg = msg;
    }

    parse() {
        for(let Cmd of commandHandlers){
            //console.log(Cmd);
            let cmd = new Cmd();
            
            if(cmd.match(this.msg)){
                cmd.handle(this.msg)
                return;
            }
        } 
        this.msg.reply(`Unknown command:\n[${this.msg.content}]`);
        return;
    }

}

