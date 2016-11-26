function SlackApi(bot, message){

    this.ChannelInfo = function (callback) {
        
        bot.api.channels.info({
                token: undefined,
                channel: message.channel
            }, function (err, data) {
                callback(data);
            });
    }
    
    this.UserInfo = function(userId, callback){
        bot.api.users.info({
                token: undefined,
                user: userId
            }, function (err, data) {
                callback(data);
            });
    }
        
   return this;
}

module.exports = SlackApi;