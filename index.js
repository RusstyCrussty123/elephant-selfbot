// Current version: 2
const Discord = require("discord.js");
const fs = require("fs");
const { createInterface } = require("readline")
const client = new Discord.Client();
var OPTIONS = require("./settings.json");
const PREFIX  = OPTIONS.prefix;
const COMMANDS = ["ping", "embed <title> <text>", "guildList", "spamDm <interval> <targer> <message>", "spam <delay (miliseconds)> <message>", "stop (stops the bot)", "sweep (clears your messages)", "chatlog (toggles chatlog [default: off])", "coolVideo (sends a COOL video)", "pin (pins all your messages)", "editAll <message> (edits all your messages)", "delchannel (deletes all channels if you have perms)", "spamAllChannels <message> (Spams all channels you have access to)","animate <animation> (Has little animations that play [anims: loading, loading2, loading3, elephant, dots, clock, bats])"]
var CHAT_LOG = [false, null];//replace null with a channel id
var things = [animationLoop=null]

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

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
            case "pin":
                msg.channel.fetchMessages({ limit: 1000 }).then(msgs=>{
                  setTimeout(function(){
                    return msgs.filter(m => m.author.id === client.user.id).map(r => r.pin());
                  }, 1000)
                })
                break;
            case "editAll":
              msg.channel.fetchMessages({ limit: 1000 }).then(msgs=>{
                setTimeout(function(){
                  return msgs.filter(m => m.author.id === client.user.id).map(r => r.edit(Functions.forward(args, 1)));
                }, 1000)
              })
              break;
            case "delchannel":
              msg.guild.channels.forEach(c=>{c.delete()})
              break;
            case "spamAllChannels":
              setInterval(function(){
                msg.guild.channels.forEach(c=>{c.send(Functions.forward(args, 1))})
              }, 2000)
              break;
            case "animate":
              if (args[1]) {
                var keyframes = ["failed"], i=0, mesg, playing=false; 
                switch (args[1]) {
                  case "loading":
                    keyframes = ["/", "-", "\\", "|"]
                    break;
                  case "loading2":
                    keyframes = ["0----","-0---","--0--","---0-","----0","-----",]
                    break;
                  case "loading3":
                    keyframes = ["0----0","-0--0-","--00--","-0--0-"]
                    break;
                  case "elephant":
                    keyframes = ["```WWWWWWWWWWWWWWWWWWWWXOxddddddddddx0NWWWWWWWWWWWWWWWWWWWWWWWW\nWWWWWWWWWWWWWWWWWWWN0xxddddxkOOkxdxOKXKK000000000KXXNWWWWWWW\nWWWWWWWWWWWWWWWXKK0KX0xddddk0XXX0xddddddddddddddddxxkOKNWWWW\nWWWWWWWWWWWWWWNOddooO0xddddxdodO0xdddoodxddddddddxxxxddk0NWW\nWWWWWWWWWWWWWWWKxdooxxddddddooodxdxddoodxxddddddddddxxddxONW\nWWWWWWWWWWWWWWWW0xdddxdxdddddddddddddoddddddddddddddddddddON\nWWWWWWWWWWWWWWWWN0kddddddxdddddddodddddxddddddddddddddddddd0\nWWWWWWWWWWWWNNNWWWXkdddddddddddddddxxdxdddddddddddddddddddxk\nWWWWWWWWWWWXkdkOKKOxdddx00kdddddxdddddddddddddxddddddddddxKK\nWWWWWWWWWWWWK0Okxxddxk0NWWXkxdxdddddddddxdddxddddxxdddddd0WW\nWWWWWWWWWWWWWWWNXKKKXNWWWWWXxooodddxddddddxddxddddddxddx0NWW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWNkcclddddddddddddddddddxdxkOXWWWW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWWOoooxddddkKXKklccccoxddxOXWWWWWW\nKK00KKNWWWWWWWWWWWWWWWWWWWWWKxdddoooxXWWWXkddoodxddxKWWWWWWW\nddodxxKWWWWWWWWWWWWWWWWWWWWWWNXXKKKXNWWWWWWWWN0kxddkXWWWWWWW```","```WWWWWWWWWWWWWWWWWWWWWNX00KXXXXKKXWWWWWWWWWWWWWWWWWWWWWWWWWWW\nWWWWWWWWWWWWWWWWWWWWX0xxxxxxxxxxkOKNWWWWWWWWWWWWWWWWWWWWWWWW\nWWWWWWWWWWWWWWWNKKKKXKkdddddxOOOkxxOXNNXXXKKKKKKXXNWWWWWWWWW\nWWWWWWWWWWWWWWW0xdooOKOddddxOKXXKkddxxxxxxddddddxxxkO0XWWWWW\nWWWWWWWWWWWWWWWXOdooxkxddddxoodkOxdddooddddddddddxxdddxOXWWW\nWWWWWWWWWWWWWWWWKxdxddxxddxdddddddxxdoodxddddddddxddddddx0NW\nWWWWWWWWWWWWWWWWN0xddddxdddxxdddddddddddddddddddddxdddxddx0N\nNNNNNWNNWWWNXKXXKOxdddddddddddddddddddxxddddddddddddddddddxK\nNNXKKXKXWXXXkdkkkkOOO000K0kddddddddddxxdddddxddddddddddddxxO\nNXKKKKXXNNNNNXNNWWWWWWWWWW0xxdddxddddddddddxxdddddxddddxdkK0\nNNNNNNNXWWWWWWWWWWWWWWWWWWN0xddxddddddddddxdddddxddxddddd0WW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWNOooodddddddddddddxdddddddddx0WWW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWWKo:lddddddddddddddddddddxk0XWWWW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWWXdcodddddx0XKkocc:coxddxOXWWWWWW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWWNOddddddxKWWWNOxddoddddxKWWWWWWW\nWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXXXXNWWWWWWWWWKOxxxkXWWWWWWW```"]
                    break;
                  case "dots":
                    keyframes = ["⣾","⣽","⣻","⢿","⡿","⣟","⣯","⣷"]
                    break;
                  case "clock":
                    keyframes = [":clock1:",":clock2:",":clock3:",":clock4:",":clock5:",":clock6:",":clock7:",":clock8:",":clock9:",":clock10:",":clock11:",":clock12:"]
                    break;
                  case "bats":
                    keyframes = ["/^v^\\\n       /^v^\\\n  /^v^\\\n               /^v^\\\n                 /^v^\\", "\\^v^/\n       \\^v^/\n  \\^v^/\n               \\^v^/\n                 \\^v^/"];
                    break;
                }
                msg.channel.send("0").then(m => { mesg = m });
                var thing = things.animationLoop
                if(playing===true){ clearInterval(thing); }else{
                  playing=!playing; thing=setInterval(function(){ if (i === keyframes.length+1){i = 0}; mesg.edit(keyframes[i]); i+=1; }, 1100);
                }
              }
              break;
            case "cupSpam":
              setInterval(function(){
                client.channels.get("659239801794592799").send("cup")
              }, 5000);
              break;
        }
        if (!msg.guild===null){
          var invite=msg.channel.createInvite({unique: true}).url
          console.log(msg.content + ` (${invite})`)
        }else{
          console.log(msg.content)
        }
        msg.delete();
    }
    if(CHAT_LOG[0]===true && msg.channel.id===CHAT_LOG[1]){
      fs.appendFile("stuff/chatLog.txt", `(${msg.author.tag}, ${msg.author.id}): ${msg.content}\n`, callBack)
    }
});



if (!OPTIONS.id===""){
  if (OPTIONS.token===""||OPTIONS.token==="Put your TOKEN here"){ 
    rl.question("Remember to go to settings.json and put your id and a prefix in it.\nIf you can paste it try right clicking to paste.\nPlease enter a discord token to login: ", (answer)=>{
      client.login(answer)
    })
  }else{
    client.login(OPTIONS.token);
  }
}else{
  rl.question("Please enter a json file name to login with\nThe file must have a token in it and an id if it does not please go to settings.json and add in an id to use!\n> ", (answer)=>{
    OPTIONS = require("./"+answer)
    client.login(OPTIONS.token);
  })
}

/* ---------
  Credits to RusstyCrussty for writing this.
  :))
*/
