const commando = require('discord.js-commando');
const _ = require('underscore');

class MorpionCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'morpion',
      group: 'games',
      memberName: 'morpion',
      description: 'Play a morpion'
    });
  }

  async run(message, args) {
    const mentions = _.uniq(message.mentions.members.array());
    if(mentions.length === 0) 
      message.channel.send(`lets play a morpion ! But you first need to mention someone to play with !\nfor example : !morpion @Zerk`);
    else if(mentions.length > 2 || (mentions.length == 2 && !_.contains(_.map(mentions, m => m.id), message.author.id) ) )
      message.channel.send(`Too much people !! Morpion is a 1v1 game ..`);
    else if(mentions[0].id == message.author.id)
      message.channel.send(`wtf bro, u mad ?? PLay against urself ?`);
    else if(mentions[0].user.bot)
      message.channel.send(`sorry bro, others bot are not good enought to play morpion with you...`);
    else
      message.channel.send(`${message.author} has chalenged ${mentions[0]} on a morpion !`);
  }
}

module.exports = MorpionCommand;
