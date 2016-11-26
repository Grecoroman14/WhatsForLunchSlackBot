var speech = require('../text/speech.js')
var dataRepo = require('../dataAccess/database/dataRepo.js');
var botHelper = require('../helpers/botHelper.js')
var foodApis = require('../dataAccess/foodApis/foodApis.js');
var channelInfo = require('../businessLogic/channelInfo.js');
var restaurantsMessage = require('../modelMessages/restaurantsMessage.js');
var _ = require('lodash');


function EventService(bot, controller) {

    this.userJoinsChannel = function(config){
        dataRepo(controller).Get.channelData(config.channel).then(function(channelData){
            return channelData
        }).then(function(channelData){
            return [_.find(channelData.Users, function (obj) { return obj.Id == config.user }), channelData]
        }).then(function(channelData){
            var userExist = channelData[0];
            console.log("INSIDE USER JOINS")
            console.log(userExist)
            if(!userExist){
                channelData[1].Users.push(
                    {
                        Id: config.user,
                        name: config.user_profile.name,
                        image: config.user_profile.image_72,
                        requestFoodType:null,
                        placeToEatVote:0
                    }
                );
                channelData[1].FoodTypeVotesRemaining += 1;
                dataRepo(controller).Update.channelData(channelData[1]);
                botHelper(bot).botTalk(config.channel, "New User Got added  : " + config.user + config.user_profile.name + " " + config.user_profile.image_72)
            }
        });
    }
    
    this.userLeavesChannel = function(config){
        dataRepo(controller).Get.channelData(config.channel).then(function(channelData){
            _.remove(channelData.Users, function (obj) { return obj.Id == config.user })
            channelData.FoodTypeVotesRemaining -= 1;
            return channelData
        }).then(function(channelData){
                dataRepo(controller).Update.channelData(channelData);
                botHelper(bot).botTalk(config.channel, "Removed User  : " + config.user + config.user_profile.name + " " + config.user_profile.image_72)
        });
    }
    
    this.botJoinsChannel = function(config){
        channelInfo(bot, config, controller).buildUsersForChannel(config.user, function(usersData){
                controller.storage.channels.save( 
                    {   id: config.channel,
                        team: config.team,
                        Address:'',
                        Flags:{
                        Hi: 0,
                        StartOrExplain:0,
                        Ppl:0,
                        Vote:0,
                        Finish:0
                        },
                        Users: usersData,
                        FoodTypeVotes:{
                            delivery: 0,
                            sitDown:0,
                            takeOut:0
                        },
                        PlaceToEatVotes:[0,0,0,0],
                        GeneratedFoodPlaces:[],
                        DesignatePerson:false,
                        FoodTypeVotesRemaining:0,
                        FoodPlacesVotesRemaining:0,
                        UserInChannelCountSet:false
                    }, function(err) { console.log("Bot Channel Join : " + err) })
            });
    }
    
    return this;
}

module.exports = EventService;