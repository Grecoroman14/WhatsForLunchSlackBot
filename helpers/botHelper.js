

function BotHelper(bot) {
    
            this.botTalk = function (channel, speakingText) {
                bot.say(
                    {
                        text: speakingText,
                        channel: channel
                    }
                );
            }
    
    return this;
}

module.exports = BotHelper;