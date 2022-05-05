const Command = require('../command.js');
const PDFDocument = require('pdf-lib').PDFDocument;
const fs = require('fs');
const https = require('https');
const responses = require('../../io_classes/responses.js');
const UIEmojis = require('../../io_classes/uiEmojis.js');
const reactionHandler = require('../../io_classes/reactionHandler.js');

const YES = UIEmojis.YES;
const STOP = UIEmojis.STOP;

//console.log(PDFDocument);

//const existingPdfBytes = fs.readFileSync(`./command_classes/save_classes/save_data/Alena.pdf`);
//
//// Load a PDFDocument without updating its existing metadata
//const pdfDoc = PDFDocument.load(existingPdfBytes, {
//  updateMetadata: false
//});

//console.log(pdfDoc);
//console.log(pdfDoc.then(pdf => {
//    let form = pdf.getForm();
//    let fields = form.getFields();
//    //for(let i in fields){
//    //    console.log(`Field ${i}:`, fields[i].getName());   
//    //}
//    console.log(form.getTextField('STR').getText());
//    form.getTextField('STR').setText('20');
//
//    pdf.save().then(data => {
//        fs.writeFileSync(`./command_classes/save_classes/save_data/Alena.pdf`, data);
//    });
//
//    console.log('done');
//}));


module.exports = class SaveCommand extends Command{
    constructor(onNewResponse){
        super(onNewResponse, '--save')
    }

    getFilePath(fileName){
        return `./command_classes/save_classes/save_data/${fileName}`
    }

    handle(msg){
        this.saveAttatchments(msg);
    }

    saveAttatchments(msg){
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
                this.saveFile(msg, a);
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