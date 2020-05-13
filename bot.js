//Bot del server del Covo.

//Import.
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
//Variabili.
const PREFIX = "!";
var bot = new Discord.Client();
var servers = {};
bot.login(process.env.BOT_TOKEN);
//Quando il bot è pronto, lo annuncia nel prompt.
bot.on("ready", function () {
	console.log("Pronto!");
});
bot.on("message", function (message) {
	//Salta i messaggi del bot stesso.
	if (message.author.equals(bot.user)) return;
	//Controllo del prefisso per i comandi.
	if (!message.content.startsWith(PREFIX)) return;
	//Comandi.
	var args = message.content.substring(PREFIX.length).split(" ");
	switch (args[0].toLowerCase()) {
		//File audio
		case "sound":
			if (!channelCheck(message)) break;
			if (!argsCheck(args, message, "Devi specificare un suono.")) break;
			//Link clip audio in base al comando.
			var link = "https://drive.google.com/uc?export=download&id=";
			switch (args[1].toLowerCase()) {
				case "bruh":
					link = link.concat("16p4CjTz2gLdfR-hejGaezR42WLGal0wX");
					break;
				case "bene":
					link = link.concat("1VsE2Ehs5_6SRVzBoEa6aSJQ0qywfY9co");
					break;
				case "drillo":
					link = link.concat("1pUkDcQOcFL3tKUeGyv019uzMA5qZ3avd");
					break;
				case "kekw":
					link = link.concat("1pzyq45J-joUYCSXIXiEa7CLmmInlvhvs");
					break;
				case "kekmaximus":
					link = link.concat("1I_-NmfKA0bwozBEKMd7YhGvxLDKV5xRl");
					break;
				case "ohkekkek":
					link = link.concat("1VePgVaITdBxrZ-xrj4dW2LG-x_dDJ4hg");
					break;
				case "ohnono":
					link = link.concat("1iwp2gRMuIO0yZQ5bZINH2kwg3COKQp1J");
					break;
				case "omegalul":
					link = link.concat("1i2VMFTeo1VzOgzJjhLv3XwqH6rgHMx_f");
					break;
				case "whygay":
					link = link.concat("1aVChOC5uOwFopcI1oVDHStYtjbXBYyMC");
					break;
				case "wut":
					link = link.concat("1Bx-5fS7hiDJMj14wHGSjQsqELGEqvi9r");
					break;
				default:
					sendMessage(message, "Non esiste quel suono.");
					return;
			}
			//Connessione e riproduzione del file.
			connectToChannel(message).then(function (connection) {
				const dispatcher = connection.play(link);
				dispatcher.on("finish", () => {
					disconnectFromChannel(message);
				});
			});
			break;
		//Musica
		case "play":
			if (!channelCheck(message)) break;
			if (!argsCheck(args, message, "Devi specificare un link.")) break;
			//Aggiungere la canzone alla coda.
			if (!servers[message.guild.id])
				servers[message.guild.id] = { queue: [] };
			var server = servers[message.guild.id];
			server.queue.push(args[1]);
			//Riproduzione della canzone.
			connectToChannel(message).then(function (connection) {
				playYouTube(connection, message, server);
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
			sendMessage(message, "Comando non valido.");
	}
});
//Inviare messaggi.
function sendMessage(message, answer) {
	message.reply(answer);
}
//Controllo del canale vocale.
function channelCheck(message) {
	if (!message.member.voice.channel) {
		sendMessage(message, "Devi essere in un canale vocale.");
		return false;
	}
	return true;
}
//Controllo link o nome file.
function argsCheck(args, message, answer) {
	if (!args[1]) {
		sendMessage(message, answer);
		return false;
	}
	return true;
}
//Connessione al canale vocale.
function connectToChannel(message) {
	return message.member.voice.channel.join();
}
//Disconnessione del canale vocale.
function disconnectFromChannel(message) {
	message.guild.me.voice.channel.leave();
}
//Riproduzione dell'audio dei video di Youtube.
function playYouTube(connection, message, server) {
	server.dispatcher = connection.play(
		YTDL(server.queue[0], { filter: "audioonly" })
	);
	server.queue.shift();
	server.dispatcher.setVolume(0.25);
	server.dispatcher.on("finish", () => {
		if (server.queue[0]) playYouTube(connection, message);
		else disconnectFromChannel(message);
	});
}
