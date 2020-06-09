//Bot del server del Covo.

//Import.
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const listaSuoni = require("./listaSuoni.json");

//Variabili.
const PREFIX = "!";
let dispatcher;

//Funzioni.
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
function playYouTube(connection, message, song) {
	dispatcher = connection.play(YTDL(song, { filter: "audioonly" }));
	dispatcher.setVolume(0.3);
	dispatcher.on("finish", () => {
		disconnectFromChannel(message);
	});
}

//Inizializzazione bot.
const bot = new Discord.Client();
bot.login(process.env.BOT_TOKEN);
bot.on("ready", function () {
	console.log("Pronto!");
});

//Comandi.
bot.on("message", function (message) {
	//Salta i messaggi del bot stesso.
	if (message.author.equals(bot.user)) return;
	//Controllo del prefisso per i comandi.
	if (!message.content.startsWith(PREFIX)) return;
	let args = message.content.substring(PREFIX.length).split(" ");
	switch (args[0]) {
		//Comando di aiuto.
		case "help":
			const embedAiuto = new Discord.MessageEmbed()
				.setColor("#ed5555")
				.setTitle("Guida al bot")
				.setDescription(
					"Ciao! Sono il bot del server del covoh.\nQuesto è quello che posso fare:"
				)
				.addFields(
					{
						name: "**!sound** + nomeSuono",
						value: "Riproduce il suono selezionato.",
					},
					{
						name: "**!listaSuoni**",
						value: "Invia la lista dei suoni disponibili.",
					},
					{
						name: "**!play** + link",
						value:
							"Riproduce l'audio del video di YouTube selezionato.",
					},
					{
						name: "**!stop**",
						value: "Ferma la riproduzione dell'audio.",
					},
					{
						name: "\u200B",
						value:
							"Ricorda che tutti i comandi iniziano con ! e che per alcuni bisogna essere connessi ad un canale vocale.",
					}
				);
			message.channel.send(embedAiuto);
			break;
		//File audio.
		case "sound":
			if (!channelCheck(message)) break;
			if (!argsCheck(args, message, "Devi specificare un suono.")) break;
			let link = "https://drive.google.com/uc?export=download&id=";
			//Controllo dell'esistenza del suono.
			if (listaSuoni.hasOwnProperty(args[1])) {
				link = link.concat(listaSuoni[args[1]]);
			} else {
				sendMessage(
					message,
					"Non esiste quel suono. Puoi controllare la lista dei suoni con !listaSuoni."
				);
				break;
			}
			//Connessione e riproduzione del file.
			connectToChannel(message).then(function (connection) {
				dispatcher = connection.play(link);
				dispatcher.on("finish", () => {
					disconnectFromChannel(message);
				});
			});
			break;
		case "listaSuoni":
			const embedSuoni = new Discord.MessageEmbed()
				.setColor("#ed5555")
				.setTitle("Lista Suoni");
			//Array di suoni.
			const suoni = Object.keys(listaSuoni);
			var description = "Questi sono i suoni riproducibili:";
			//Per ogni indice dell'array, voglio il suono collegato.
			for (var index in suoni) {
				description = description.concat("\n" + suoni[index]);
			}
			embedSuoni.setDescription(description);
			message.channel.send(embedSuoni);
			break;
		//Musica
		case "play":
			if (!channelCheck(message)) break;
			if (!argsCheck(args, message, "Devi specificare un link.")) break;
			if (!YTDL.validateURL(args[1])) {
				sendMessage(message, "Il link non è valido.");
				break;
			}
			//Riproduzione della canzone.
			connectToChannel(message).then(function (connection) {
				playYouTube(connection, message, args[1]);
			});
			break;
		case "stop":
			disconnectFromChannel(message);
			break;
		default:
			sendMessage(
				message,
				"Comando non valido. Prova a scrivere !help per una lista dei comandi."
			);
	}
});
