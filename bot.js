/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack Button application that adds a bot to one or many slack teams.

# RUN THE APP:
  Create a Slack app. Make sure to configure the bot user!
    -> https://api.slack.com/applications/new
    -> Add the Redirect URI: http://localhost:3000/oauth
  Run your bot from the command line:
    clientId=<my client id> clientSecret=<my client secret> port=3000 node slackbutton_bot.js
# USE THE APP
  Add the app to your Slack by visiting the login page:
    -> http://localhost:3000/login
  After you've added the app, try talking to your bot!
# EXTEND THE APP:
  Botkit has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */

var Botkit = require('botkit');
var config = require('./config.js')
var command = require('./text/command.js');
var controlState = require('./businessLogic/controlState.js');
var convoService = require('./serviceLayer/conversationService.js');
var eventService = require('./serviceLayer/eventService.js');
var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.mongoDB});

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
} else {
  console.log("ClientId:" + process.env.clientId);
  console.log("ClientSecret:" + process.env.clientSecret);
  console.log("Port:" + process.env.PORT);
}


var controller = Botkit.slackbot({
    storage: mongoStorage,
}).configureSlackApp(
  {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['bot'],
  }
);

controller.setupWebserver(process.env.PORT,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});


// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
  console.log(bot.config)
});

//  Events Listening
controller.on('create_bot',function(bot,config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
    console.log("INSIDE THE TEAM!!!!");
    console.log(bot.config);
  } else {
    bot.startRTM(function(err) {

      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convoService(bot, convo, controller).joinTeam();
        }
      });

    });
  }
});

controller.on('bot_channel_join', function(bot,config){
  console.log("BOT JOINED GROUP")
  eventService(bot,controller).botJoinsChannel(config);
})

controller.on('user_channel_join', function(bot,config){
  console.log("HOLY SHIT SOMEONE JOINED!!")
  eventService(bot,controller).userJoinsChannel(config);
})

controller.on('channel_leave', function(bot,config){
  console.log("HOLY SHIT SOMEONE LEFT")
  eventService(bot,controller).userLeavesChannel(config);
})

// ^^^ Events Listening

/// Controllers that are listening

controller.hears('','direct_mention', function (bot, message) {
    console.log("@@directMetionStart@@@")
        convoService(bot, message, controller).resetData(function(){
           convoService(bot, message, controller).hiResolve();
        });
});

controller.hears([command.hear["start"], command.hear["explainMore"]], 'ambient', function (bot, message) {
    console.log("@@startExplainMore@@@")
    controlState(message, controller).controlState('StartOrExplain').then(function () {
            convoService(bot, message, controller).startOrExplainResolve();
        },
        function () {
         //   convoService(bot, message, controller).startOrExplainReject();
        })
});

controller.hears([command.hear["iAm"], command.hear["notIn"], command.hear["showRestaurants"]], 'ambient', function (bot, message) {
    console.log("@@showRestaurant@@")
    controlState(message, controller).controlState('Ppl').then(function () {
         convoService(bot, message, controller).pplResolve();
    },
        function () {
          //  convoService(bot, message, controller).pplReject();
        })
});

controller.hears([command.hear["one"], command.hear["two"], command.hear["three"], command.hear["four"]], 'ambient', function (bot, message) {
    console.log("@@VoteNumbers@@@")
    controlState(message, controller).controlState('Vote').then(function () {
         convoService(bot, message, controller).voteResolve();
    },
        function () {
            // convoService(bot, message, controller).voteReject();
        })
});

controller.hears(command.hear["currentAddress"], 'ambient', function (bot, message) {
    console.log("@@currentAddress@@@")
    convoService(bot, message, controller).currentAddress();
});

controller.hears(command.hear["updateAddress"], 'ambient', function (bot, message) {
    console.log("@@updateAddress@@@")
    var address = message.match[1].trim();
    convoService(bot, message, controller).updateAddress(address);
});

controller.hears([command.hear["feedback"]], 'ambient', function (bot, message) {
    console.log("@@feedback@@@")
    convoService(bot, message, controller).feedback();
});

controller.hears([command.hear["help"]], 'ambient', function (bot, message) {
    console.log("@@help@@@")
    convoService(bot, message, controller).help();
});

/// Controllers that are listening End

controller.storage.teams.all(function(err,teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function(err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          trackBot(bot);
        }
      });
    }
  }

});

// controller.storage.users.all(function(err,users){
//   console.log(users);
// })

// controller.storage.channels.all(function(err,users){
//   console.log(users);
// })