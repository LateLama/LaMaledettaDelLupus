const Discord = require("discord.js");
const PREFIX = "!";
const YTDL = require("ytdl-core");

var bot = new Discord.Client();
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
    case "nsfw":
      message.guild.channels.find("id", "415856780674072576").overwritePermissions(message.author, {VIEW_CHANNEL: true});
      message.channel.send("Hai trovato il canale segreto, complimenti! Vai e divertiti!";
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

    //Easter egg su Not Alone.
    case "covo":
      message.channel.send("Riprendi in mano le carte Luogo dalla tua pila degli scarti (tranne IL COVO) OPPURE copia il potere della carta Luogo con il segnalino Creatura. Perdi un segnalino Volontà aggiuntivo se vieni catturato dal segnalino Creatura.");
      break;
    case "giungla":
      message.channel.send("Riprendi in mano questa carta Luogo ed un altra carta Luogo a tua scelta dalla tua pila degli scarti.");
      break;
    case "fiume":
    message.channel.send("Il prossimo turno gioca due carte Luogo. Prima di rivelarle scegline una da giocare e riprendi in mano l'altra.");
      break;
    case "spiaggia":
      message.channel.send("Metti il segnalino Attivazione su La Spiaggia OPPURE, se già presente, rimuovilo per far avanzare il segnalino Soccorsi di uno spazio avanti (max. una volta a turno).");
      break;
    case "rover":
      message.channel.send("Prendi dalla riserva una carta Luogo che non hai ed aggiungila alla tua mano.");
      break;
    case "palude":
      message.channel.send("Riprendi in mano questa carta Luogo e due carte Luogo a tua scelta dalla pila degli scarti.");
      break;
    case "rifugio":
      message.channel.send("Pesca due carte Sopravvivenza, scegline una da tenere e scarta l'altra.");
      break;
    case "relitto":
      message.channel.send("Muovi avanti il segnalino Soccorsi di uno spazio (max. una volta per turno).");
      break;
    case "fonte":
      message.channel.send("Pesca una carta Sopravvivenza OPPURE scegli un Sopravvissuto (compreso te stesso) e fagli riprendere un segnalino Volontà perso.");
      break;
    case "artefatto":
      message.channel.send("Il prossimo turno gioca due carte Luogo e risolvile entrambe. Non puoi copiare il potere dell'artefatto.");
      break;
    default:
      message.channel.send("Comando non valido.");
  }
});
