const commandHandlers = require('./command_classes/commands.js')

module.exports = class Parser{
    constructor(msg){
        this.msg = msg;
    }

    parse() {
        for(let Cmd of commandHandlers){
            //console.log(Cmd);
            
            if(Cmd.match(this.msg)){
                let cmd = new Cmd(this.respond.bind(this));
                cmd.handle(this.msg);

                return;
            }
        } 
        this.msg.reply(`Unknown command:\n[${this.msg.content}]`);
        return;
    }
    
    respond(response) {
        if(response.isMessage){
            this.sendMessage(response)
        } else if(response.isReply){
            this.replyMessage(response)
        } else if(response.isEdit){
            this.editMessage(response)
        } else {
            this.msg.reply("There was an error responding to your command.")
        }
    }

    sendMessage(response){
        if(response.thenLambda){
            response.msg.channel.send(response.content, response.attachment).then(response.thenLambda)
        } else {
            response.msg.channel.send(response.content, response.attachment)
        }
    }

    replyMessage(response){
        if(response.thenLambda){
            response.msg.reply(response.content, response.attachment).then(response.thenLambda)
        } else {
            response.msg.reply(response.content, response.attachment)
        }
    }

    editMessage(response){
        if(response.thenLambda){
            response.msg.edit(response.content, response.attachment).then(response.thenLambda)
        } else {
            response.msg.edit(response.content, response.attachment)
        }
    }
}

