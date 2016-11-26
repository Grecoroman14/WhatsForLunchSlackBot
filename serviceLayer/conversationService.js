var config = require('../config.js');
var sendgrid  = require('sendgrid')(config.SENDGRID_USERNAME, config.SENDGRID_PASSWORD);
var speech = require('../text/speech.js');
var command = require('../text/command.js');
var dataRepo = require('../dataAccess/database/dataRepo.js');
var botHelper = require('../helpers/botHelper.js');
var foodApis = require('../dataAccess/foodApis/foodApis.js');
var channelInfo = require('../businessLogic/channelInfo.js');
var restaurantsMessage = require('../modelMessages/restaurantsMessage.js');
var _ = require('lodash');

function ConversationService(bot, message, controller) {
 
    this.joinTeam = function(){
          message.say(speech.joinTeam["hi"]);
          message.say(speech.joinTeam["invite"]);
    }
 
    this.hiResolve = function(){
        botHelper(bot).botTalk(message.channel, speech.conversationOptions["startConvo"]);
        dataRepo(controller).Update.channelState(message.channel, "Hi", 1);
    }
    
    this.startOrExplainResolve = function(){
        if(message.text.toLowerCase() == command.hear["start"]){
            dataRepo(controller).Get.channelData(message.channel).then(function(channelData){
                return channelData
            }).then(function(channelData){
                if(!channelData.Address){
                    botHelper(bot).botTalk(message.channel, speech.conversationOptions["missingAddress"]);
                    botHelper(bot).botTalk(message.channel, speech.conversationOptions["pressStart"]);
                    return;
                }
                botHelper(bot).botTalk(message.channel, speech.conversationOptions["pplInterested"]);
                channelInfo(bot,message, controller).setUsersCountInChannel();
                dataRepo(controller).Update.channelState(message.channel, "StartOrExplain", 1); 
            })
            
        } else if(message.text.toLowerCase() == command.hear["explainMore"]){
            botHelper(bot).botTalk(message.channel, speech.explainMore["explainMoreFirst"]);
            setTimeout(function(){
                botHelper(bot).botTalk(message.channel, speech.explainMore["explainMoreSecond"]);
            },8000);
             setTimeout(function(){
                botHelper(bot).botTalk(message.channel, speech.explainMore["explainMoreThird"]);
            },14000);
        }
    }
    
    // this.startOrExplainReject = function(){
    //         botHelper(bot).botTalk(message.channel, 'Reject Start or explain');
    // }
    
    this.pplResolve = function(){
        
        dataRepo(controller).Get.channelData(message.channel).then(function(channelData){
            return [_.find(channelData.Users, function (obj) { return obj.Id == message.user }), channelData ]
        }).then(function(userVoteInfo){
        var incomingMessage = message.text.toLowerCase();
        
        if(incomingMessage.indexOf(command.hear["showRestaurants"])> -1){
            if (userVoteInfo[0] != null) {
                if (userVoteInfo[0].requestFoodType == "Out") {
                    botHelper(bot).botTalk(message.channel, speech.conversationOptions["foodTypeSkip"]);
                    return;
                }else if(userVoteInfo[0].requestFoodType == null) {
                    userVoteInfo[0].requestFoodType = "anything";
                    userVoteInfo[1].FoodPlacesVotesRemaining += 1;
                }
            }
            userVoteInfo[1].FoodTypeVotesRemaining = 0;
            console.log(userVoteInfo[1])
            dataRepo(controller).Update.channelData(userVoteInfo[1]);
            //botHelper(bot).botTalk(message.channel, "hit show restaurants");
            produceRestaurantsToPick(bot,message, userVoteInfo[1]);
            return;
        }   
          
        if (userVoteInfo[0] != null) {
            if (userVoteInfo[0].requestFoodType == null) {
                if (incomingMessage.indexOf('delivery') > -1) {
                    userVoteInfo[0].requestFoodType = "delivery";
                    userVoteInfo[1].FoodTypeVotes.delivery += 1;
                    userVoteInfo[1].FoodTypeVotesRemaining -= 1;
                    userVoteInfo[1].FoodPlacesVotesRemaining +=1;
                    dataRepo(controller).Update.channelData(userVoteInfo[1]);
                    botHelper(bot).botTalk(message.channel, speech.voteResponse["responseTwo"] + " Delivery");
                } else if (incomingMessage.indexOf('sit down') > -1) {
                    userVoteInfo[0].requestFoodType = "sitDown";
                    userVoteInfo[1].FoodTypeVotes.sitDown += 1;
                    userVoteInfo[1].FoodTypeVotesRemaining -= 1;
                    userVoteInfo[1].FoodPlacesVotesRemaining +=1;
                    dataRepo(controller).Update.channelData(userVoteInfo[1]);
                    botHelper(bot).botTalk(message.channel, speech.voteResponse["responseTwo"] + " sit down");
                } else if (incomingMessage.indexOf('take out') > -1) {
                    userVoteInfo[0].requestFoodType = "TakeOut";
                    userVoteInfo[1].FoodTypeVotes.takeOut += 1;
                    userVoteInfo[1].FoodTypeVotesRemaining -= 1;
                    userVoteInfo[1].FoodPlacesVotesRemaining +=1;
                    dataRepo(controller).Update.channelData(userVoteInfo[1]);
                    botHelper(bot).botTalk(message.channel, speech.voteResponse["responseTwo"] + " take out");
                } else if (incomingMessage.indexOf('no preference') > -1) {
                    userVoteInfo[0].requestFoodType = "anything";
                    userVoteInfo[1].FoodTypeVotesRemaining -= 1;
                    userVoteInfo[1].FoodPlacesVotesRemaining +=1;
                    dataRepo(controller).Update.channelData(userVoteInfo[1]);
                    botHelper(bot).botTalk(message.channel, speech.voteResponse["responseTwo"] + " no preference");
                } else if(incomingMessage.indexOf('not in') > -1){
                    userVoteInfo[0].requestFoodType = "Out";
                    userVoteInfo[1].FoodTypeVotesRemaining -= 1;
                    dataRepo(controller).Update.channelData(userVoteInfo[1]);
                    botHelper(bot).botTalk(message.channel, "Heard not in");
                }
                
                if(userVoteInfo[1].FoodTypeVotesRemaining == 0){
                    produceRestaurantsToPick(bot, message, userVoteInfo[1]);
                }
            } else {
                botHelper(bot).botTalk(message.channel, "You already voted");
            }
        }
        }).catch(function(ex){
                console.log("######################################################################################")
                console.log(ex);
            });
    }
    
    // this.pplReject= function (){
    //     botHelper(bot).botTalk(message.channel, 'Reject PPL INTERESTED');
    // }
    
    this.voteResolve = function () {
        
        dataRepo(controller).Get.channelData(message.channel).then(function(channelData){
            return [_.find(channelData.Users, function (obj) { return obj.Id == message.user }), channelData ]
        }).then(function(userVoteInfo){
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            console.log(userVoteInfo[1].GeneratedFoodPlaces);
            if (userVoteInfo[0] != null) {
                if (userVoteInfo[0].placeToEatVote == 0 && (userVoteInfo[0].requestFoodType != null && userVoteInfo[0].requestFoodType != "Out")) {
                    if (message.text.indexOf('1') > -1) {
                        userVoteInfo[0].placeToEatVote = 1;
                        userVoteInfo[1].PlaceToEatVotes[0] += 1;
                        userVoteInfo[1].FoodPlacesVotesRemaining -= 1;
                        dataRepo(controller).Update.channelData(userVoteInfo[1]);
                        console.log(userVoteInfo[1])
                        botHelper(bot).botTalk(message.channel, speech.voteResponse["responseThree"] + userVoteInfo[1].GeneratedFoodPlaces[0].name);
                    } else if (message.text.indexOf('2') > -1) {
                        userVoteInfo[0].placeToEatVote = 2;
                        userVoteInfo[1].PlaceToEatVotes[1] += 1;
                        userVoteInfo[1].FoodPlacesVotesRemaining -= 1;
                        dataRepo(controller).Update.channelData(userVoteInfo[1]);
                        botHelper(bot).botTalk(message.channel, speech.voteResponse["responseThree"] + userVoteInfo[1].GeneratedFoodPlaces[1].name);
                    } else if (message.text.indexOf('3') > -1) {
                        userVoteInfo[0].placeToEatVote = 3;
                        userVoteInfo[1].PlaceToEatVotes[2] += 1;
                        userVoteInfo[1].FoodPlacesVotesRemaining -= 1;
                        dataRepo(controller).Update.channelData(userVoteInfo[1]);
                        botHelper(bot).botTalk(message.channel, speech.voteResponse["responseThree"] + userVoteInfo[1].GeneratedFoodPlaces[2].name);
                    } else if (message.text.indexOf('4') > -1) {
                        userVoteInfo[0].placeToEatVote = 4;
                        userVoteInfo[1].PlaceToEatVotes[3] += 1;
                        userVoteInfo[1].FoodPlacesVotesRemaining -= 1;
                        dataRepo(controller).Update.channelData(userVoteInfo[1]);
                        botHelper(bot).botTalk(message.channel, speech.voteResponse["responseThree"] + userVoteInfo[1].GeneratedFoodPlaces[3].name);
                    }
                    if (userVoteInfo[1].FoodPlacesVotesRemaining == 0) {
                        
                        votePlace(userVoteInfo[1].PlaceToEatVotes, function(winningIndex){

                            var winningRestaurant = userVoteInfo[1].GeneratedFoodPlaces[winningIndex];
                            
                            // ADD later, need to add the name of the users to the Users Object.
                            // if (userVoteInfo[1].DesignatePerson) {
                            //     finalText += ". This user is in charge of getting the items : " + _.sample(userVoteInfo[1].Users).Id;
                            // }
                            botHelper(bot).botTalk(message.channel, speech.conversationOptions["winningRestaurant"] + winningRestaurant.name);
                            bot.say({
                                'channel': message.channel,
                                'text': speech.conversationOptions["getLunch"],
                                "attachments": [
                                    {
                                        "fallback": winningRestaurant.snippet_text,
                                        "title": winningRestaurant.name,
                                        "title_link": winningRestaurant.url,
                                        "text": winningRestaurant.snippet_text,
                                        "image_url": winningRestaurant.image_url,
                                        "color": "#00FF00"
                                    }]
                            }, function(err, response){
                                console.log("CALLBACK MESSEAGE :")
                                console.log("err : ")
                                console.log(err)
                                console.log("response : ")
                                console.log(response)
                                dataRepo(controller).Delete.resetChannel(message.channel, function(){
                                    botHelper(bot).botTalk(message.channel, speech.conversationOptions["pleaseFeedback"]);
                                    botHelper(bot).botTalk(message.channel, speech.conversationOptions["startOver"]);
                                })
                            })
                        });;
                        
                    }
                } else {
                    botHelper(bot).botTalk(message.channel, speech.conversationOptions["voteAlready"]);
                }
            }
        })
        .catch(function(ex){
                console.log("######################################################################################")
                console.log(ex);
            });
    }
    
    // this.voteReject = function(){
    //     botHelper(bot).botTalk(message.channel, 'Reject VOTING');
    // }
    
    this.currentAddress = function(){
        dataRepo(controller).Get.channelData(message.channel).then(function(channelData){
            return channelData
        }).then(function(channelData){
            if(!channelData.Address){
                botHelper(bot).botTalk(message.channel, speech.conversationOptions["missingAddress"]);
            } else {
                botHelper(bot).botTalk(message.channel, speech.conversationOptions["getCurrentAddress"] + channelData.Address)
            }
        });
    }
    
    this.updateAddress = function(address){
        if(!address){
            botHelper(bot).botTalk(message.channel, speech.conversationOptions["emptyAddress"])
            return;
        }
        dataRepo(controller).Get.channelData(message.channel).then(function(channelData){
            return channelData
        }).then(function(channelData){
            channelData.Address = address;
            dataRepo(controller).Update.channelData(channelData);
            botHelper(bot).botTalk(message.channel, speech.conversationOptions["setAddress"] + address)
        });
    }
    
    this.resetData = function(callback){
        dataRepo(controller).Delete.resetChannel(message.channel, callback)
    }
    
    // Temporary way to receive feedback for app!
    this.feedback = function(){
        sendgrid.send({
            to:       'grecon14+whatsforlunch@gmail.com',
            from:     'grecon14+whatsforlunch@gmail.com',
            subject:  'FEEDBACK FROM WHATSFORLUNCHBOT TEAM : ' + bot.config.name,
            text:     bot.config.name + " : " + bot.config.url + " --- " + message.text 
            }, function(err, json) {
            if (err) { return console.error(err); }
            console.log(json);
            });
        botHelper(bot).botTalk(message.channel, speech.conversationOptions["feedback"])
    }
    
     this.help = function(){
        botHelper(bot).botTalk(message.channel, speech.conversationOptions["helpCommands"])
    }
    
    // private methods
    var voteType = function(channelData, callback){
        var object = [ channelData.FoodTypeVotes.delivery,
                       channelData.FoodTypeVotes.takeOut,
                       channelData.FoodTypeVotes.sitDown]
        
        winningVotes(object, function(winningIndexes){
           var winningIndex = winningIndexes[0];
            
            if(winningIndexes.length > 1){
                botHelper(bot).botTalk(message.channel,speech.conversationOptions["foodTypeTie"]);
                winningIndex = _.sample(winningIndexes);
            }
            
            switch(winningIndex) {
                case 0:
                    callback(speech.foodStyle["delivery"]);
                    break;
                case 1:
                    callback(speech.foodStyle["takeOut"]);
                    break;
                case 2:
                    callback(speech.foodStyle["restaurant"]);
                    break;
                default:
                    callback(speech.foodStyle["restaurant"]);
                    break;
            }
            
        });
    }
    
    var votePlace = function(voteArray, callback){
        
        winningVotes(voteArray, function(winningIndexes){
           var winningIndex = winningIndexes[0];
            
            if(winningIndexes.length > 1){
                botHelper(bot).botTalk(message.channel, speech.conversationOptions["voteTie"]);
                winningIndex = _.sample(winningIndexes);
            }
            
            callback(winningIndex);
        });
    }
    
    var winningVotes = function(object, callback){
        var maxValue = _.max(object);
        
        callback(object.reduce(function(a, e, i) {
                if (e === maxValue)
                    a.push(i);
                return a;
            }, []));
    }
    
    var produceRestaurantsToPick = function(bot, message, channelData){
        if(!channelData.Address){
            botHelper(bot).botTalk(message.channel, speech.conversationOptions["missingAddress"]);
            return;
        }
        var winningVoteType = voteType(channelData, function(winner){
            botHelper(bot).botTalk(message.channel, speech.conversationOptions["winningStyle"] + winner + "' style.");
            foodApis.yelpData().generatedRestaurants('lunch ' + winner, channelData.Address)
                        .then(function (data) {
                            channelData.GeneratedFoodPlaces = [data[0], data[1], data[2], data[3]];
                            channelData.Flags["Ppl"] = 1;
                            
                            dataRepo(controller).Update.channelData(channelData);
                            
                            return restaurantsMessage(message, data, speech.conversationOptions["voteRestaurants"]);
                        }).then(function(placesData){
                            bot.say(placesData, function(err, response){
                                console.log("CALLBACK MESSEAGE :")
                                console.log("err : ")
                                console.log(err)
                                console.log("response : ")
                                console.log(response)
                            });
                            
                        }).catch(function(ex){
                            console.log(ex);
                        });
        });
    }
        
    return this;
}

module.exports = ConversationService;