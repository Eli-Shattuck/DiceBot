const Command = require('./command.js');

module.exports = class RubiksCubeCommand extends Command{
    constructor(){
        super();
        this.cubes = [];
    }

    match(msg){
        //console.log(msg.content.toLowerCase());
        return msg.content.toLowerCase().indexOf("--rubik's") === 0;
    };
    
    handle(msg){
        

        return;
    };
}