var request = require('request');
var winston = require('winston');
var keys = [];
var type = "";
exports.action = function(data, callback, config, SARAH){
	
	var config = config.modules.tvPhilips;
	
	keys = data.commande.split(',');
	
	executCommande(keys.shift(),config,callback);
	return callback({});
	
}

// ------------------------------------------
//  PROCESS
// ------------------------------------------

function executCommande(key,config,callback)
{
	if(key) {
		
		var ordre = key.split(":");
		
		var params = {};
		
		switch(ordre[0]){
			
			case "source":
				var path = "sources/current";
				params.id = ordre[1];
				break;
			
			case "ambilight":
				var path = "ambilight/mode";
				params.current = ordre[1];
				break;
				
			case "couleur":
				var path = "ambilight/cached";
				params = hexStringToRgb(ordre[1]);
				break;
			
			case "key":
			default:
				var path = "input/key";
				params.key = ordre[1];
				break;
			
		}
		
		set(path, params,config, function(reponse) {
			if (reponse !== false) 
			{
				return executCommande(keys.shift(),config,callback);
			} 
			else {
				callback({'tts': "Impossible de commander la Télé"});
			}
		});
				
		
	}
	else {
		
		if (config.reponse=="true") {
			//multi réponse
			Txt = new Array; 
			Txt[0] = "OK";
			Txt[1] = "c'est fait";
			
			Choix = Math.floor(Math.random() * Txt.length); 
			callback({'tts': Txt[Choix]});
		}
		else {callback();}
		
	}
}

// ------------------------------------------
//  TOOLS
// ------------------------------------------

function hexStringToRgb(s) {
	return {
        r: parseInt(s.substring(0, 2), 16) ,
        g: parseInt(s.substring(2, 4), 16) ,
        b: parseInt(s.substring(4, 6), 16) 
    };
}


// ------------------------------------------
//  NETWORK
// ------------------------------------------



var log = function(msg){
  winston.log('info', '[tvPhilips] ' + msg);
}

var get = function(path, config, callback){
  req(path, {}, config, callback)
}

var set = function(path, body, config, callback){
  req(path, { 'method': 'post', 'body': JSON.stringify(body) }, config, callback)
}

var put = function(path, body, config, callback){
  req(path, { 'method': 'put', 'body': JSON.stringify(body) }, config, callback)
}

var req = function(path, data, config, callback){
  
  data.uri  = 'http://'+config.ip+':1925/1/'+path ;
  data.json = true;
  
  //log(data.uri);
  //log(data.body);
  
  request(data, function (err, response, json){

    if (err || response.statusCode != 200) { 
      if (callback) 
		callback(false);
      return;
    }
    
    if (callback) 
		callback(json);
  });
  
}