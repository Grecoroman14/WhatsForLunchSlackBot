var config = require('../../config.js');
var Yelp = require('yelp');
var yelp = new Yelp(config.yelp_keys);
var _ = require('lodash');

function YelpData(){
    
    this.searchFullList = function(searchTerm, location){
        var sortByDistance = 1;
        //var meters = 3250; // roughly 2 miles
         return yelp.search({ term: searchTerm, location: location, sort: sortByDistance })
         .then(function(data){
             // yelp limits to 20 per request, so doing two request to get 40.
            return yelp.search({ term: searchTerm, location: location, sort: sortByDistance, offset: 20 })
             .then(function(yelpData){
                 data.businesses = data.businesses.concat(yelpData.businesses)
                 return data;
             })
         })
    }
    
    this.generatedRestaurants = function(searchTerm, location){
        return this.searchFullList(searchTerm, location)
        .then(function(fullYelpData){
            console.log("Length of yelp data results to randomly pick 4 from:" + fullYelpData.businesses.length)
             return  _.sampleSize(fullYelpData.businesses, 4);
        })
    } 
    
    return this;
}

module.exports = YelpData;