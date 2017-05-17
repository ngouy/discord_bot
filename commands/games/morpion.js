/*
** to do
** - print global score
** - print personal score
*/

const commando = require('discord.js-commando');
const _ = require('underscore');
const game_cmds = ["A:0", "A:1", "A:2",
                   "B:0", "B:1", "B:2",
                   "C:0", "C:1", "C:2"];

let on_going_games = [];

class Morpion {

  /*
  ** static functions
  */

  static find(id_or_di) {
    return _.findWhere(on_going_games, {id: id_or_di}) || _.findWhere(on_going_games, {di: id_or_di}) || null;
  }

  static if_you_want_to_play(channel, author) {
    channel.send(`lets play a morpion ! But you first need to mention someone to play with !\nfor example : !morpion @Zerk`);
  }

  static already_have_morpion(morpion, player) {
    morpion.channel.send(`${player} you already have a morpion on goin with ${morpion.player1.id == player.id ? morpion.player2 : morpion.player1}, tap \`!morpion turn\` to have the summary`);
  }

  /*
  ** constructor
  */

  destroy() {
    on_going_games = _.reject(on_going_games, morp => ((morp.id === this.id) && (this.di === morp.di)));
  }

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
    if (Math.round(Math.random()) === 1) {
      this.current_player = player1;
      this.next_player = player2;
    } else {
      this.current_player = player2;
      this.next_player = player1;
    }
    on_going_games.push(this);
    this.lets_play();
  }

  /*
  ** Core gaming functions
  */


  /* Score calculation */

  recalculate_line(y) {
    const grid = this.grid;
    return grid[0][y] * grid[1][y] *  grid[2][y];
  }

  recalculate_column(x) {
    const grid = this.grid;
    return grid[x][0] * grid[x][1] * grid[x][2];
  }

  recalculate_diag_1(xy) {
    const grid = this.grid;
    return grid[0][0] * grid[1][1] * grid[2][2];
  }

  recalculate_diag_2(xy) {
    const grid = this.grid;
    return grid[0][2] * grid[1][1] * grid[2][0];
  }

  recalculate_diags() {
    let res;
    res = this.recalculate_diag_1(1);
    return res || this.recalculate_diag_2(1);
  }

  recalculate_score(move) {
    const x = move[1];
    const y = move[0];
    let res = 0;
    res = res || this.recalculate_line(y);
    res = res || this.recalculate_column(x);
    if (x == y && x == 1) {
      res = res || this.recalculate_diags();
    } else if (y == x) {
      res = res || this.recalculate_diag_1(x);
    } else if (y + x == 2) {
      res = res || this.recalculate_diag_2(x == 0 ? y : x);
    }
    return res;
  }

  /* grid rendering */

  get_case(x, y) {
    const score = this.grid[x][y];
    const char = score == 1 ? 'x' : score == 2 ? 'o' : '  ';
    return `|   ${char}   `;
  }

  get_grid() {
    let grid = "-  0  -   1   -   2  -";
    for(let x = 0; x < 3; x++) {
      grid += "------------------\n";
      for(let y = 0; y < 3; y++) {
        grid += this.get_case(x, y);
      }
      grid += `| ${x === 0 ? A : x === 1 ? B : C}\n`;
    }
    grid += "------------------\n";
    return grid;
  }


  /* mains */

  turn() {
    this.channel.send(`${this.player1} vs ${this.player2}`)
    this.channel.send(this.get_grid());
    this.channel.send(`It's ${this.current_player} turn`);
  }

  give_up(player) {
    if (player.id == this.id) {
      this.current_player = this.player2;
      this.next_player = this.player1;
    } else {
      this.next_player = this.player2;
      this.current_player = this.player1;
    }
    this.channel(`${player} surrend...`);
    this.wins();
  }

  wins() {
    this.channel.send(`${this.current_player} beat ${this.next_player}. GG feeder`);
    this.destroy();
  }

  null_match() {
    this.channel.send(`null match between ${this.player1} and ${this.player2}, well played. Lets go for another morpions dudes !`);
    this.destroy();
  }

  how_wins(score) {
    if (score) {
      this.wins();
    } else if (_.include(_.flatten(this.grid), 0)) {
      this.end_normal_turn();
    } else {
      this.null_match();
    }
  }

  end_normal_turn() {
    this.channel.send(
      `${this.current_player} plays ${this.last_move} :\n${this.get_grid()}\n${this.next_player}, it's your turn !`
    );
  }

  lets_play() {
    this.channel.send(`${this.player1} has chalenged ${this.player2} on a morpion !
    It has been decided that ${this.current_player} begins !`);
    this.channel.send(this.get_grid());
  }

  process(move) {
    move[0] = move[0].toLowerCase().charCodeAt(0) - 97;
    const number = (this.current_player == this.player1) ? 1 : 2;
    if (this.grid[move[0]][move[1]] !== 0) {
      this.channel.send (`Forbidden move, it's this box (${move[0]}:${move[1]}) is already fill:\n`);
      this.channel.send(this.get_grid());
      return false;
    }
    this.grid[move[0]][move[1]] = number;
    const score = this.recalculate_score(move);
    this.how_wins(score);
    return true
  }

  play(player, move) {
    if (player.id === this.next_player.id) {
      this.channel.send(`It's not your turn to play. It's ${this.current_player} one`);
      return;
    }
    this.last_move = move;
    if (this.process(move.split(':'))) {
      if (this.player1.id === player.id) {
        this.current_player = this.player2;
        this.next_player = this.player1;
      } else {
        this.current_player = this.player1;
        this.next_player = this.player2;
      }
    }
  }

}

class MorpionCommand extends commando.Command {
  constructor(client) {
    client.on('message', message => {
      if (_.contains(game_cmds, message.content)) {
        const current_morpion = Morpion.find(message.author.id);
        if(Morpion.find(message.author.id)) {
          current_morpion.channel = message.channel;
          current_morpion.play(message.author, message.content);
        } else {
          Morpion.if_you_want_to_play(message.channel, message.author);
        }
      }
    });
    super(client, {
      name: 'morpion',
      group: 'games',
      memberName: 'morpion',
      description: 'Play a morpion'
    });
  }

  async run(message, args) {
    const m = Morpion.find(message.author.id);
    if (m) { m.channel = message.channel; }
    if (message.content.replace(/ /g,'').toLowerCase() === "!morpionstop") {
      if (!m) {
        message.channel.send("you have no morpion in progress");
        Morpion.if_you_want_to_play(message.channel, message.author);
      } else {
        m.give_up(message.author);
      }
    } else if (message.content.replace(/ /g,'').toLowerCase() === "!morpionturn") {
      if (!m) {
        message.channel.send("you have no morpion in progress");
        Morpion.if_you_want_to_play(message.channel, message.author);
      } else {
        m.turn();
      }
    } else if (message.content.replace(/ /g,'').toLowerCase() === "!morpiondebug") {
      console.log(on_going_games);
    } else {
      const mentions = _.uniq(message.mentions.members.array());
      if (m) {
        Morpion.already_have_morpion(m, message.author);
      }
      else if(mentions.length === 0)
        message.channel.send(`lets play a morpion ! But you first need to mention someone to play with !\nfor example : !morpion @Zerk`);
      else if(mentions.length > 2 || (mentions.length == 2 && !_.contains(_.map(mentions, m => m.id), message.author.id) ) )
        message.channel.send(`Too much people !! Morpion is a 1v1 game ..`);
      else if(mentions[0].id == message.author.id)
        message.channel.send(`wtf bro, u mad ?? PLay against urself ?`);
      else if(mentions[0].user.bot)
        message.channel.send(`sorry bro, others bot are not good enought to play morpion with you...`);
      else
        new Morpion(message.author, mentions[0], message.channel);
    }
  }
}

module.exports = MorpionCommand;
