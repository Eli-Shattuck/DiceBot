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

const PLAY     = new UIEmoji("play",        "943975486151864410");
const PAUSE    = new UIEmoji("pause",       "943975486202208286");
const NEXT     = new UIEmoji("next",        "943975485833113671");
const PREVIOUS = new UIEmoji("previous",    "943977198891700264");
const INCREASE = new UIEmoji("increase",    "943975485761785867");
const DECREASE = new UIEmoji("decrease",    "943975485652746291");
const STOP     = new UIEmoji("stop",        "943976807978373171"); 
const TRASH    = new UIEmoji("trash",       "944067280541736990");

const BACK     = new UIEmoji("turn_back",   "944089662383882262");
const DOWN     = new UIEmoji("turn_down",   "944089662698430534");
const FRONT    = new UIEmoji("turn_front",  "944089662681653268");
const LEFT     = new UIEmoji("turn_left",   "944089662518075414");
const RIGHT    = new UIEmoji("turn_right",  "944089662757158972");
const UP       = new UIEmoji("turn_up",     "944089662471962675");
const SHUFFLE  = new UIEmoji("shuffle",     "944092077053055026");
const CW       = new UIEmoji("cw",          "944090981689614358");
const CCW      = new UIEmoji("ccw",         "944090981567967282");

const ZERO     = new UIEmoji("label_zero",  "944050179634503751");
const ONE      = new UIEmoji("label_one",   "944050179504480259");
const TWO      = new UIEmoji("label_two",   "944050180037148733");
const THREE    = new UIEmoji("label_three", "944050179999424562");
const FOUR     = new UIEmoji("label_four",  "944050179902963752");
const FIVE     = new UIEmoji("label_five",  "944050179852607488");
const SIX      = new UIEmoji("label_six",   "944050180238499840");
const SEVEN    = new UIEmoji("label_seven", "944050179902947398");
const EIGHT    = new UIEmoji("label_eight", "944050179705815061");
const NINE     = new UIEmoji("label_nine",  "944050179848421426");

module.exports = {
    PLAY, PAUSE, NEXT, PREVIOUS, INCREASE, DECREASE, STOP, TRASH,
    ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE,
    NUMS: [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE],
    BACK, DOWN, FRONT, LEFT, RIGHT, UP, SHUFFLE, CW, CCW    
};