const commandHandlers = require('./commands.js')


module.exports = class Parser{
    constructor(msg){
        this.msg = msg;
    }

    parse() {
        for(let cmd of commandHandlers){
            //console.log(Cmd);
            
            if(cmd.match(this.msg)){
                cmd.clear();
                cmd.handle(this.msg)

                for(let response of cmd.responseList){
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

                return;
            }
        } 
        this.msg.reply(`Unknown command:\n[${this.msg.content}]`);
        return;
    }
    
    sendMessage(response){
        if(response.thenLambda){
            response.channel.send(response.content).then(response.thenLambda)
        } else {
            response.channel.send(response.content)
        }
    }

    replyMessage(response){
        if(response.thenLambda){
            response.msg.reply(response.content).then(response.thenLambda)
        } else {
            response.msg.reply(response.content)
        }
    }

    editMessage(response){
        if(response.thenLambda){
            response.msg.edit(response.content).then(response.thenLambda)
        } else {
            response.msg.edit(response.content)
        }
    }
}

