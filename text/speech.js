var conversationOptions = {
    "startConvo": 'Hello, my name is “Lunchie The Monkey”! I\'ll make choosing lunch as a group easy - rather it\'s' +
                    ' delivery, take out, or sit down, I have you covered. I can go into detail about what I do, say “Explain more:” or if you ever forget commands say "Help:".' +
                    ' Otherwise, it sounds like this group is ready for lunch! Say "Start:"',
    //"locationOfOffice" : 'To get started, what is the location of your office',
    //"distanceWillingToTravel" : 'What’s the distance you are willing to travel for food? (In miles)',
    //"thanks" : 'Thanks!',
    "pplInterested" : 'If lunch interests you and you\'d like to join, say "I am - (delivery, take out, sit down)", ex. “I am - delivery:”' +
                      '. If you don\'t want to join say "Not in:". Once everyone that is joining has voted, someone say "Show restaurants:" to generate the restaurants.',
    //"pplInterestedMoveOne" : 'If you don’t want to wait for everyone to reply, you can move on to the next question by saying “Show Restaurants:”.',
    //"pplInterestedTie": 'It looks like we have a tie between “ take out, sit down” and guess what… I pick [randomly generated choice ] because I make the decisions around here!',
    //"listOptions": 'Here are take some time look at the menu, then take a vote, say the number next to which one. For example,' +
    //               ' “1” or “1,3” or if you like all of them just say “all”.',
    "foodTypeTie": 'There was a tie, so I\'ll just decided!',
    "voteTie": 'There was a tie on where to eat... I\'ll make the final decision!',
    "foodTypeSkip": 'A person who did voted in already or hasn\'t voted yet can only have the power to move the group forward to display restaurants. Sorry...',
    "finalAnswerLocation": 'Let’s get some lunch at [ name of place ] here’s the details. ',
    "finalAnwerDetails": 'Produce answer with phone number, menu, yelp link, distance, food style.',
    "finalAnswerDeliveryPickUp": 'And guess what?! [ @person who opted in ] is the designated orderer and collector of people\'s' +
                                 ' orders here’s their phone number : [ company number ].  Bug [ @person ] for any other information regarding payment and what not.',
    "feedback": 'Thanks for the feedback - we\'ll be sure to use it to improve "Whats For Lunch Bot" alpha version!!',
    "exitProcess": 'Alright, I\'ll stop searching and start over',
    "missingAddress": 'You currently do not have an address set. Please update your address by typing "UpdateAddress:" then your address after the command. Example, "UpdateAddress: 123 Normal Street, 25431". ',
    "getCurrentAddress": 'The currently set address is : ',
    "emptyAddress": 'Sorry, you need to add an address if you want me to update it! Please try again.',
    "setAddress": 'Updated your address to use to : ',
    "pressStart": 'After that then you may say "start:"',
    "winningStyle": 'Picking places to eat today for you! The winning choice is \'',
    "voteAlready": 'You already voted for a food place or didn\'t say you wanted in.',
    "getLunch": 'Now go get lunch!!',
    "pleaseFeedback": 'Thanks for using my service! Please leave feedback on what you\'d like to see in future versions! Say "feedback: " and leave your comment after that. For example, "feedback: Can you add a timer to the voting "',
    "winningRestaurant": 'THE WINNING RESTAURANT IS ',
    "startOver": 'To start over, @direct mention me (@whatsforlunch) in this channel and I\'ll start from the top!',
    "voteRestaurants": 'Here are the options for today! Vote by saying "1:", "2:", "3:", or "4:".',
    "helpCommands": 'These are the list of commands that I listen for: \n"@whatsforlunch:" - anytime you want to start from the top of the conversation, use this command.\n"currentAddress:" - this will display the current address saved for this channel ' + '\n"updateAddress:" - by typing your address after this command, it will update the address that I use to search for restaurants \n"feedback:" - by typing after this command, it will send me your feedback on how to improve @WhatsforLunch. So please leave feedback!'
}

var explainMore = {
    "explainMoreFirst": 'Okay, it\'s a work day, around noon and everyone is hungry, but no one can decide if they want to eat lunch in the office or go out to eat. After that is decided no one ' +
                        'knows where to eat and then everyone is sitting around saying “I really don’t care where or what we eat”... so annoying!',
    "explainMoreSecond": ' That\'s where I come in. As soon as someone direct messages me - "@whatsforlunch:", I\'ll pop-up and ask everyone if they are interested' +
                         ' in getting lunch and to choose between delivery, take out, or sit down. The winning' +
                         ' style will become the criteria for the final four generated local restaurants to choose from. I’ll then allow people to vote,' +
                         ' tally the votes, and determine the winning restaurant for lunch!!',
    "explainMoreThird" : ' Let\'s find the team lunch! Say "Start:".'
}

var voteResponse = {
    "responseOne": 'I heard a vote for ',
    "responseTwo": 'That\'s a vote for',
    "responseThree": 'I\'ll add a vote for ',
}

var foodStyle = {
    "takeOut": 'take out',
    "delivery": 'delivery',
    "sitDown": 'sit down',
    "restaurant": 'restaurant'
}

var joinTeam = {
    "hi": 'Hi, I\'ll make deciding lunch easy for you and your team.',
    "invite": 'I only work in channels, so /invite and @direct mention me in a channel so we can get started!'
}
module.exports = {
    conversationOptions: conversationOptions,
    explainMore: explainMore,
    voteResponse: voteResponse,
    foodStyle: foodStyle,
    joinTeam: joinTeam
}