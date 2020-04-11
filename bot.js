const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const PREFIX = "!";

var bot = new Discord.Client();
var servers = {};
function playYouTube(connection, message) {
  var server = servers[message.guild.id];
  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
  server.queue.shift();
  server.dispatcher.on("end", function() {
    if (server.queue[0]) playYouTube (connection, message);
    else connection.disconnect();
  });
}

bot.login(process.env.BOT_TOKEN);

//Quando il bot è pronto, lo annuncia nel prompt.
bot.on("ready", function() {
  console.log("Pronto!");
});

bot.on("message", function(message) {
  //Skippa i messaggi del bot stesso.
  if (message.author.equals(bot.user)) return;
  //Controllo del prefisso per i comandi.
  if (!message.content.startsWith(PREFIX)) return;
  var args = message.content.substring(PREFIX.length).split(" ");
  switch (args[0].toLowerCase()){
      
    //Audio  
    case "audio":
      if (!message.member.voiceChannel) {
        message.channel.send("Devi essere in un canale vocale per ascoltare.")
        return;
      }
      if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(connection => {
            const dispatcher = connection.playFile('https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3');
            dispatcher.on("end", end => {message.member.voiceChannel.leave()});
      }).catch(console.error);
      break;
      
    //Musica
    case "play":
      if (!args[1]) {
        message.channel.send("Mi serve un link.");
        return;
      }
      if (!message.member.voiceChannel) {
        message.channel.send("Devi essere in un canale vocale per ascoltare.")
        return;
      }
      if(!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      };
      var server = servers[message.guild.id];
      server.queue.push(args[1]);
      if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        playYouTube(connection, message);
      });
      break;
    case "skip":
      var server = servers[message.guild.id];
      if (server.dispatcher) server.dispatcher.end();
      break;
    case "stop":
      var server = servers[message.guild.id];
      if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
      break;

    default:
      message.channel.send("Comando non valido.");
  }
});
