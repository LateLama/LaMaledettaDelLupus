const Discord = require("discord.js");
const PREFIX = "!";
const YTDL = require("ytdl-core");

var bot = new Discord.Client();
var contatoreTesoro = 0;
var servers = {};
function play(connection, message) {
  var server = servers[message.guild.id];
  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
  server.queue.shift();
  server.dispatcher.on("end", function() {
    if (server.queue[0]) play (connection, message);
    else connection.disconnect();
  });
}

bot.login(process.env.BOT_TOKEN);

//Quando il bot è pronto, lo annuncia nel prompt.
bot.on("ready", function() {
  console.log("Pronto");
});

bot.on("message", function(message) {
  //Skippa i messaggi del bot stesso.
  if (message.author.equals(bot.user)) return;
  //Controllo del prefisso per i comandi.
  if (!message.content.startsWith(PREFIX)) return;
  var args = message.content.substring(PREFIX.length).split(" ");
  switch (args[0].toLowerCase()){
    
    //Gruppo segreto.
    case "covo":
    case "covoh":
      message.channel.send("Benvenuto nella **Caccia al tesoro del Covo**. Quando indovini un comando giusto, il messaggio che hai scritto verrà eliminato dalla chat, così che nessun altro lo legga. Mantieni il *segreto*. Ah, non c'é differenza tra maiuscolo e minuscolo nei comandi.");
      break;
    case "minuscolo":
    case "maiuscolo":
      message.channel.send("Nice try, you baboon.");
    
    case "segreto":
      message.delete();
      if (contatoreTesoro >= 0) {
        message.channel.send("Ultimamente una torta ci ha sterminati, ma ce n'é un'altra in particolare che è oltre ogni livello di comprensione umana.");
        contatoreTesoro = 1;
      };
      break;
      
    case "whereiscake":
    case "cake":
    case "cakeboi":
    case "cakeboy":
      message.delete();
      if (contatoreTesoro >= 1) {
        message.channel.send("Onore a te. Se sei qui, sei sopravvissuto a questo figlio del demonio. Mica come il mio creatore.");
        contatoreTesoro = 2;
      }else{
        message.channel.send("Comando non valido.");
      };
      break;
      
    case "nicastro":
    case "nica":
    case "andreanicastro":
    case "nicastroandrea":
      message.delete();
      if (contatoreTesoro >= 2) {
        message.channel.send("Nicastro, lui si che è un fio rahazzi. Quando sussurra è eccitante. ( ͡° ͜ʖ ͡°)");
        contatoreTesoro = 3;
      }else{
        message.channel.send("Comando non valido.");
      };
      break;
      
    case "dota":
    case "dota2":
      message.delete();
      if (contatoreTesoro >= 3) {
        message.channel.send("A chi pensava che il mio creatore non lo avrebbe inserito negli indovinelli, dico solo **Kappa**. O forse per avervelo fatto scrivere, lui dovrebbe dire un'altra cosa.");
        contatoreTesoro = 4;
      }else{
        message.channel.send("Comando non valido.");
      };
      break;
      
    case "ezclap":
    case "easeglab":
      message.delete();
      if (contatoreTesoro >= 4) {
        message.channel.send("Se solo ");
        contatoreTesoro = 5;
      }else{
        message.channel.send("Comando non valido.");
      };
      break;
      
    case "lauragori":
      message.guild.channels.find("id", "415856780674072576").overwritePermissions(message.author, {VIEW_CHANNEL: true, SEND_MESSAGES: true, ATTACH_FILES: true, ADD_REACTIONS: true, EMBED_LINKS: true, READ_MESSAGE_HISTORY: true});
      message.delete();
      message.channel.send("<:PartyTime:412695740196847617> Hai trovato il canale segreto, complimenti! Vai e divertiti! Il comando che hai immesso è stato cancellato dalla chat, in modo che gli altri non lo leggano. Mantieni il segreto. <:PartyTime:412695740196847617> ");
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
        play(connection, message);
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
