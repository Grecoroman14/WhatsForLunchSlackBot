var _ = require('lodash');

function DataRepo(controller){
    
    this.Create = {
        generatedFoodPlaces: function(foodPlaces, channelId){
            Get.channelData(channelId).then(function(channelData){
                channelData.GeneratedFoodPlaces = foodPlaces;
                controller.storage.channels.save(channelData, function(err) {
                     if(err != null)
                         console.log("Failed To Save State generatedFoodPlaces!", err);
                 });
            }).catch(function(error) {
                console.log("Failed! generatedFoodPlaces", error);
            });
        },
        setUsersCountIn: function(usersInChannel, channelId){
            if(usersInChannel != undefined){
                Get.channelData(channelId).then(function(channelData){
                    channelData.FoodTypeVotesRemaining = usersInChannel;
                    channelData.UserInChannelCountSet = true;
                    controller.storage.channels.save(channelData, function(err) {
                        if(err != null)
                            console.log("Failed To Save State setUsersCountIn!", err);
                    });
                }).catch(function(error) {
                    console.log("Failed! setUsersCountIn", error);
                });
            }
        }
    }
    
    this.Get = {
        channelData : function(channelId){
            return new Promise(function(resolve, reject) {
                controller.storage.channels.get(channelId, function(err, channel_data) {
                    if (err == null) {
                        resolve(channel_data);
                    }
                    else {
                        reject(Error("Get Channel Data Error: " + err));
                    }
                });
            })
        },
        
        // update with MongoDb
        // allChannels : function(){
        //     return db.Channels
        // },
        // userDataByChannel : function(channelId, userId){
        //     return Get.channelData(channelId).then(function(channel){
        //                 return _.find(channel.Users, function (obj) { return obj.Id == userId })
        //             }).catch(function(error) {
        //                 console.log("Failed!", error);
        //             });
        // },
        isUserInChannelCountSet : function(channelId){
            return Get.channelData(channelId).then(function(channel){
                        return channel.UserInChannelCountSet
                    }).catch(function(error) {
                        console.log("Failed!", error);
                    });
        }
    }
    
    this.Update = {
        channelState : function(channelId, stateToChange, turnBit){
           return Get.channelData(channelId).then(function(channel){
                channel.Flags[stateToChange] = turnBit;
                console.log(channel.Flags)
                console.log(channel)
                controller.storage.channels.save(channel, function(err) {
                        if(err != null)
                            console.log("Failed To Save State!", err);
                 });
            }).catch(function(error) {
                console.log("Failed!", error);
            });
        },
        channelData : function(channelData){
            controller.storage.channels.save(channelData, function(err) {
                        if(err != null)
                            console.log("Failed To Save Channel Data!", err);
                 });
        }
    }
    
    this.Delete = {
        resetChannel : function(channelId, callback){
            Get.channelData(channelId).then(function(channelData){
                
                channelData.Flags = {
                    Hi: 0,
                    StartOrExplain: 0,
                    Ppl: 0,
                    Vote: 0,
                    Finish: 0
                };
                channelData.FoodTypeVotes = {
                    delivery: 0,
                    sitDown: 0,
                    takeOut: 0
                };
                _.forEach(channelData.Users, function(value){
                    value.requestFoodType = null;
                    value.placeToEatVote = 0;
                });
                channelData.PlaceToEatVotes = [0, 0, 0, 0];
                channelData.GeneratedFoodPlaces = [];
                channelData.DesignatePerson = false;
                channelData.FoodTypeVotesRemaining = 0;
                channelData.FoodPlacesVotesRemaining = 0;
                channelData.UserInChannelCountSet = false;
                
                controller.storage.channels.save(channelData, function(err) {
                    if(err != null)
                        console.log("Failed To Save State resetData!", err);
                    callback()
                });
            }).catch(function(error) {
                console.log("Failed!", error);
            });

        }
    }
   
    return this;
}


module.exports = DataRepo;