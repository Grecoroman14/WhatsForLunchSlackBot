var dataRepo = require('../dataAccess/database/dataRepo.js');
var slackApi = require('../dataAccess/slackApi.js');
var _ = require('lodash');

function ChannelInfo(bot, message, controller){

    this.setUsersCountInChannel = function () {
        dataRepo(controller).Get.isUserInChannelCountSet(message.channel).then(function(isSet){
            if(!isSet){
                setUsersCount();
            }
        })
    }
    
    this.buildUsersForChannel = function(botId, callback){
        slackApi(bot, message).ChannelInfo(function(channelData){
            var users = [];
            _(channelData.channel.members).forEach(function(userId){
                if(userId != botId){
                    users.push({
                                Id: userId,
                                requestFoodType:null,
                                placeToEatVote:0
                            });
                    // Can't get callbacks right, but a nice to have for users
                    // slackApi(bot,message).UserInfo(userId, function(userInfo){
                    //     console.log(userInfo)
                    //         users.push({
                    //             Id: userId,
                    //             name: userInfo.user.name,
                    //             image: userInfo.user.profile.image_72,
                    //             requestFoodType:null,
                    //             placeToEatVote:0
                    //         })
                    // })
                }
            })
            callback(users);
        });
    }
    
    // Private functions
    var setUsersCount = function(){
        slackApi(bot, message).ChannelInfo(function(channelData){
            var excludeBotFromCount = 1;
            dataRepo(controller).Create.setUsersCountIn(channelData.channel.members.length - excludeBotFromCount, message.channel);
            })
        };
        
   return this;
}

module.exports = ChannelInfo;