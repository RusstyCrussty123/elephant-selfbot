const Discord = require("discord.js");
const fs = require("fs");
const { createInterface } = require("readline")
const client = new Discord.Client();
const OPTIONS = require("./settings.json");
const PREFIX  = OPTIONS.prefix;
const COMMANDS = ["ping", "embed <title> <text>", "guildList", "spamDm <interval> <targer> <message>", "spam <delay (miliseconds)> <message>", "stop (stops the bot)", "sweep (clears your messages)", "chatlog (toggles chatlog [default: off])", "coolVideo (sends a COOL video)"]
var CHAT_LOG = [false, null];//replace null with a channel id

const Functions = {
    embed: function(title, text, channel){
      var embed = new Discord.RichEmbed()
        .addField(title, text)
        if (channel) {
          channel.startTyping();
          setTimeout(()=>{
            channel.send(embed).then((m) => {
              channel.stopTyping();
            })
          }, 100);
        } else {
          return embed 
        }
    },
    forward: function(array, start){
      var thing = array.slice(start, array.length);
      var string = ""
      for (var i=0; i<thing.length; i++) {
        string = string + thing[i] + " ";
      }
      return string
    },
  };

function callBack(err){
  if (err) { return false; console.log(err) } else { return true; }
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

client.on("ready", ()=>{
    var cmd_string = "The commands are:\n";
    console.log("-----------------------------\n== The bot is now online! ==\n== Made by elephantman ==");
    console.log("== WARNING: selfbotting is against discord tos and I am not reponsible if you get banned or not ==")
    console.log(`== Prefix is: ${PREFIX} ==`)
    for (var i=0;i<COMMANDS.length;i++) { cmd_string=cmd_string+"----"+(i+1).toString()+". "+COMMANDS[i]+"\n" }
    console.log(cmd_string);
    cmd_string=null
});
client.on("message", (msg)=>{
    if (msg.author.id === OPTIONS.id && msg.content.substring(0, PREFIX.length) === PREFIX) {
        var args = msg.content.substring(PREFIX.length).split(" ")
        switch (args[0]) {
            case "ping":
                msg.channel.send("pong")
                break;
            case "embed":
                if (args[2]) {
                    Functions.embed(args[1], Functions.forward(args, 2), msg.channel)
                    embed=null
                }
                break;
            case "spam":
                if (typeof parseInt(args[1]) === "number" && args[2])  {
                    setInterval(function(){
                        msg.channel.send(Functions.forward(args, 2))
                    }, args[1]);
                }
                break;
            case "stop":
                msg.channel.delete();
                process.exit();
                break;
            case "spamDm":
                if (typeof parseInt(args[1]) === "number" && args[3])  {
                    var target = msg.mentions.members.first();
                    setInterval(function(){
                        target.send(Functions.forward(args[3])).catch(err=>{if (err) throw err;})
                    }, args[1])
                }
                break;
            case "sweep":
                msg.channel.fetchMessages({ limit: 100 }).then(msgs=>{
                    return msgs.filter(m => m.author.id === client.user.id).map(r => r.delete());
                })
                break;
            case "guildList":
              var list = "-- Guild List --\n";
              var array = client.guilds.array();
              for (var i=0;i<array.length;i++) {
                list=list+(i+1).toString()+". Name: "+array[i].name+", ID: "+array[i].id + "\n";
              }
              fs.writeFile("stuff/guildList.txt", list, callBack)
              msg.reply("Here is your guild list:", {files:["stuff/guildList.txt"]});
              break;
            case "chatlog":
              CHAT_LOG[0] = !CHAT_LOG[0]
              CHAT_LOG[1] = msg.channel.id
              console.log("Chat log status: "+CHAT_LOG[0].toString()+"\nYou can view the chatlog in stuff/chatLog.txt");
              break;
            case "coolVideo":
              msg.channel.send("https://cdn.discordapp.com/attachments/750100714918903808/750370660227743775/black.mp4");
              break;
        }
        msg.delete();
    }
    if(CHAT_LOG[0]===true && msg.channel.id===CHAT_LOG[1]){
      fs.appendFile("stuff/chatLog.txt", `(${msg.author.tag}, ${msg.author.id}): ${msg.content}\n`, callBack)
    }
});

if (OPTIONS.token===""||OPTIONS.token==="Put your TOKEN here"){ 
  rl.question("Remember to go to settings.json and put your id and a prefix in it.\nIf you can paste it try right clicking to paste.\nPlease enter a discord token to login: ", (answer)=>{
    client.login(answer)
  })
}else{
  client.login(OPTIONS.token);
}
// this was written by elepantman
// rusty