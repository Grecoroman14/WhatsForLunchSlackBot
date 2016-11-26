
var dataRepo = require('../dataAccess/database/dataRepo.js');

function ControlState(message, controller){
    
    this.controlState = function(currentConvo){
        return new Promise(function(resolve, reject){
            this.isCurrentConversationAvailable(currentConvo).then(function(isAvailable){
                if(isAvailable){
                    resolve();
                } else{
                    reject();
                }
            }).catch(function(error) {
                console.log("Failed!", error);
            });
        });
    }
    
    this.isCurrentConversationAvailable = function(conversationType){
        
        var flagsConvoState = new Array();
        
        return dataRepo(controller).Get.channelData(message.channel).then(function(currentChannelFlags){
                flagsConvoState["Hi"] = !currentChannelFlags.Flags.Hi;
                flagsConvoState["StartOrExplain"] = currentChannelFlags.Flags.Hi == !currentChannelFlags.Flags.StartOrExplain;
                flagsConvoState["Ppl"] = currentChannelFlags.Flags.StartOrExplain  && !currentChannelFlags.Flags.Ppl;
                flagsConvoState["Vote"] = currentChannelFlags.Flags.Ppl && !currentChannelFlags.Flags.Vote;
                flagsConvoState["Finish"] = currentChannelFlags.Flags.Vote && !currentChannelFlags.Flags.Finish;
                
                return flagsConvoState[conversationType];
                
            }).catch(function(error) {
                console.log("Failed!", error);
            });
        
        }
        
   return this;
}


module.exports = ControlState;