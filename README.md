# WhatsForLunchSlackBot
Slack Bot that allows users to vote between four randomly generated restaurants to eat from.<br/>
Sample of what the bot does : http://whatsforlunchbot.com/ (non-active bot, I shut down hosting on Heroku and mLabs)

<h2> Get Started </h2>
In the config file you'll have to update the keys with a slackbot key, yelp keys, and sendgrid keys.
<br/>
I was using Heroku to host the bot, but you'll have to run <b> node bot.js </b> with these Config Vars:
<ul>
<li>clientId : Need to register a Slack Bot to receive this Id</li>
<li>clientSecret : Need to register a Slack Bot to receive this Secret</li>
<li>mongoDB : Need a Mongo DB, I was using mLabs to host mine</li>
</ul>


