let callbacks = new Map();
module.exports = {
    onReaction: (emoji, message) => {
        if(callbacks[message.id] && callbacks[message.id][emoji]) {
            callbacks[message.id][emoji] (message, emoji);
        }
    },

    addCallback: (emoji, message, callback) => {
        if(!callbacks[message.id]) {
            callbacks[message.id] = new Map();
        }
        callbacks[message.id][emoji] = callback;
        return true;
    }
}