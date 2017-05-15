const commando = require('discord.js-commando');
const _ = require('underscore');
const game_cmds = ["A:0", "A:1", "A:2",
                   "B:0", "B:1", "B:2",
                   "C:0", "C:1", "C:2"];

const on_going_games = [];

class Morpion {

  /*
  ** static functions
  */

  static find(id_or_di) {
    return _.findWhere(on_going_games, {id: id_or_di}) || _.findWhere(on_going_games, {di: id_or_di}) || null;
  }

  static if_you_want_to_play(channel, author) {
    channel.send('if you want to play blablabla');
  }

  /*
  ** constructor
  */

  constructor(player1, player2, channel) {
    this.grid = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    this.id = player1.id;
    this.di = player2.id;
    this.player1 = player1;
    this.player2 = player2;
    this.channel = channel;
    on_going_games += this;
    this.lets_play();
  }

  /*
  ** Core gaming functions
  */

  lets_play() {

  }

  process() {

  }

  play(player, move) {
    channel.send(`#{player.to_s} played ${move}`);
    this.process();
  }

}

class MorpionCommand extends commando.Command {
  constructor(client) {
    client.on('message', message => {
      if (_.contains(game_cmds, message.content)) {
        const current_morpion = Morpion.find(message.author.id);
        if(Morpion.find(message.author.id)) {
          current_morpion.play(message.author, message.content);
        } else {
          Morpion.if_you_want_to_play(message.channel, message.author);
        }
      }
    });
    // ["test_yolo"].forEach(message => {
    //   new Commando.CommandMessage(message, play, message.split(), patternMatches);
    // })
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
