const commandHandlers = require('./command_classes/commands.js')
const Paginator = require('./io_classes/paginator.js')

module.exports = class Parser{
    constructor(msg){
        this.msg = msg;
    }

    parse() {
        for(let Cmd of commandHandlers){
            let cmd = new Cmd(this.respond.bind(this));
            if(cmd.match(this.msg)){
                cmd.handle(this.msg);
                return;
            }
        } 
        this.msg.reply(`Unknown command:\n[${this.msg.content}]`);
        return;
    }
    
    respond(response) {
        Paginator.paginate(response);
    }
}

