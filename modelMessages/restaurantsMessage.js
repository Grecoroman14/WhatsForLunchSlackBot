function restaurantsMessage(message, businesses, text){
    
 var reply_with_attachments = {
                          'channel':message.channel,
                          'text': text,
                          "attachments": [
                              {
                                  "fallback": businesses[0].snippet_text,
                                  "title": "1: " + businesses[0].name,
                                  "title_link": businesses[0].url,
                                  "text": businesses[0].snippet_text,
                                  "image_url": businesses[0].image_url,
                                  "color": "#764FA5"
                              },
                              {
                                  "fallback": businesses[1].snippet_text,
                                  "title": "2: " + businesses[1].name,
                                  "title_link": businesses[1].url,
                                  "text": businesses[1].snippet_text,
                                  "image_url": businesses[1].image_url,
                                  "color": "#66ff99"
                              },
                              {
                                  "fallback": businesses[2].snippet_text,
                                  "title": "3: " + businesses[2].name,
                                  "title_link": businesses[2].url,
                                  "text": businesses[2].snippet_text,
                                  "image_url": businesses[2].image_url,
                                  "color": "#ff9933"
                              },
                              {
                                  "fallback": businesses[3].snippet_text,
                                  "title": "4: " + businesses[3].name,
                                  "title_link": businesses[3].url,
                                  "text": businesses[3].snippet_text,
                                  "image_url": businesses[3].image_url,
                                  "color": "#ffff66"
                              }
                          ]
                          }
        
   return reply_with_attachments;
}

module.exports = restaurantsMessage;