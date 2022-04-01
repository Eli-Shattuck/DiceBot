const Command = require('../command.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const https = require('https');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;


module.exports = class SaveCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--save')
    }

    getFilePath(fileName){
        return `./command_classes/save_classes/save_data/${fileName}`
    }

    handle(msg){
        let attachments = msg.attachments
        for(let [id, a] of attachments){
            if(fs.existsSync(this.getFilePath(a.name))){
                this.push(
                    responses.reply(
                        msg,
                        'There is already an existing file with this name. Would you like to replace it?',
                        undefined,
                        message => {
                            reactionHandler.addCallback(
                                [YES],
                                message,
                                (reaction, user) => {
                                    if(user != msg.author) return;
                                    this.saveFile(msg, a);
                                    reactionHandler.removeAllCallbacks(message); 
                                    message.delete();
                                }
                            )
                            reactionHandler.addCallback(
                                [STOP],
                                message,
                                (reaction, user) => {
                                    if(user != msg.author) return;
                                    reactionHandler.removeAllCallbacks(message); 
                                    message.delete();
                                    this.push(responses.reply(msg, "Your file has not been changed."));
                                }
                            );
                            reactionHandler.addReactions([YES, STOP], message);
                        }
                    )
                );
            } else {
                this.saveFile(mag, a);
            }
        }
    }

    saveFile(msg, attachment){
        let options = {
          hostname: 'cdn.discordapp.com',
          path: attachment.url.substring('https://cdn.discordapp.com'.length),
          method: 'GET'
        }
        let buffer;
        const req = https.request(options, res => {
            res.on('data', d => {
                if(buffer === undefined){
                    buffer = d;
                } else {
                    buffer = Buffer.concat([buffer, d]);
                }
            });

            res.on('end', () => {
                try{
                    fs.writeFileSync(
                        this.getFilePath(attachment.name),
                        buffer
                    );
                    this.push(responses.reply(msg, `Your file ${attachment.name} has been saved.`));
                } catch(e) {
                    console.log(e);
                }
            });
        });

        req.on('error', error => {
          console.error(error)
        });

        req.end();
    }
}