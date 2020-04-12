//Bot del server del Covo.

//Import.
const Discord = require("discord.js");
const YTDL = require("ytdl-core");

//Il prefisso per controllare i comandi.
const PREFIX = "!";

var bot = new Discord.Client();
var servers = {};

bot.login(process.env.BOT_TOKEN);

//Quando il bot è pronto, lo annuncia nel prompt.
bot.on("ready", function() {
    console.log("Pronto!");
});

bot.on("message", function(message) {
    //Salta i messaggi del bot stesso.
    if (message.author.equals(bot.user)) return;
    //Controllo del prefisso per i comandi.
    if (!message.content.startsWith(PREFIX)) return;
    //Comandi.
    var args = message.content.substring(PREFIX.length).split(" ");
    switch (args[0].toLowerCase()){      
        //File audio  
        case "sound":
            channelCheck(message);
            argsCheck(args, message, "Devi specificare un suono.");
            //Link clip audio in base al comando.
            var link;
            switch (args[1].toLowerCase()){
                case "drillo":
                    link = "https://drive.google.com/uc?export=download&id=1pUkDcQOcFL3tKUeGyv019uzMA5qZ3avd";
                    break;
                case "wut":
                    link = "https://drive.google.com/uc?export=download&id=1Bx-5fS7hiDJMj14wHGSjQsqELGEqvi9r";
                    break;
                default: 
                    sendMessage("Non esiste quel suono.");
                    return;
            }  
            //Connessione e riproduzione del file.
            connectToChannel(message).then(function(connection) {
                const dispatcher = connection.play(link);
                dispatcher.on('finish', () => {
                    disconnectFromChannel(message);
                });
            });
            break;
        //Musica
        case "play":
            channelCheck(message);
            argsCheck(args, message, "Devi specificare un link.");
            //Aggiungere la canzone alla coda.
            if(!servers[message.guild.id]) servers[message.guild.id] = {queue:[]};
            var server = servers[message.guild.id];
            server.queue.push(args[1]);
            //Riproduzione della canzone.
            connectToChannel(message);
            const connection = 
            .then(function(connection) {
                playYouTube(connection, message);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            break;
        case "stop":
            var server = servers[message.guild.id];
            disconnectFromChannel(message);
            break;
        default:
           sendMessage("Comando non valido.");
    }
});

//Inviare messaggi.
function sendMessage(message) {
    message.reply(message);
}


//Controllo del canale vocale.
function channelCheck(message) {
    if (!message.member.voice.channel) {
        sendMessage("Devi essere in un canale vocale.");
        return;
    }   
}

//Controllo link o nome file.
function argsCheck(args, message, answer) {
    if (!args[1]) {
        sendMessage(answer);
        return;
    }
}

//Connessione al canale vocale.
function connectToChannel(message){
    if (message.guild.voice.channel.joinable) return message.member.voice.channel.join();
}

//Disconnessione del canale vocale.
function disconnectFromChannel(message){
    if (message.guild.voice.channel) message.member.voice.channel.leave();
}

//Riproduzione dell'audio dei video di Youtube.
function playYouTube(connection, message) {
    var server = servers[message.guild.id];
    server.dispatcher = connection.play(YTDL(server.queue[0], {filter: "audioonly"}));
    server.queue.shift();
    server.dispatcher.on('finish', () => {
        if (server.queue[0]) playYouTube (connection, message);
        else disconnectFromChannel(message);
    });
}
