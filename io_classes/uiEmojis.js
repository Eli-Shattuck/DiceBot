//const UP = '🔼';
//const DOWN = '🔽';
//const UP = '📈';
//const DOWN = '📉';
// const PAUSE = '⏸';
// const PLAY = '▶️';
// const STOP = '⏹';
// const NEXT = '⏭';
// previously used emojis before making custom emojis

class UIEmoji {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        //console.log(this.toString());
    }

    toString() {
        //return `<:${this.name}:${this.id}>`;
        return `${this.name}:${this.id}`;
    }
}

const PLAY = new UIEmoji("play", "943975486151864410");
const PAUSE = new UIEmoji("pause", "943975486202208286");
const NEXT = new UIEmoji("next", "943975485833113671");
const PREVIOUS = new UIEmoji("previous", "943977198891700264");
const INCREASE = new UIEmoji("increase", "943975485761785867");
const DECREASE = new UIEmoji("decrease", "943975485652746291");
const STOP = new UIEmoji("stop", "943976807978373171"); 

module.exports = {
    PLAY, PAUSE, NEXT, PREVIOUS, INCREASE, DECREASE, STOP,
};