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

const prime_number_grid = [
  [0,2 ,29], [0,3 ,31], [0,5 ,37],
  [0,7 ,41], [0,11,43], [0,13,47],
  [0,17,53], [0,19,59], [0,23,61]
];

const player1_wins = [
  (2  * 3  * 5 ), (7  * 11 * 13), (17 * 19 * 23),
  (2  * 7  * 17), (3  * 11 * 19), (5  * 13 * 23),
  (2  * 11 * 23), (17 * 11 * 37)
]

const player2_wins = [
  (29 * 31 * 37), (41 * 43 * 47), (53 * 59 * 61),
  (29 * 41 * 53), (31 * 43 * 59), (37 * 47 * 61),
  (29 * 43 * 61), (53 * 43 * 37)
]

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
    this.results = [
      [0,0,0],
      [0,0,0],
      [0,0]
    ];
    this.id = player1.id;
    this.di = player2.id;
    this.player1 = player1;
    this.player2 = player2;
    this.channel = channel;
    this.next_player = player2;
    if (Math.random() == 1) {
      this.current_player = player1;
    } else {
      this.current_player = player2;
    }
    on_going_games += this;
    this.lets_play();
  }

  /*
  ** Core gaming functions
  */


  /* Score calculation */

  recalculate_line(y) {
    this.result[1][y] = this.grid[y].reduce((a, b, index) => a + prime_number_grid[y][index] * b);
  }

  recalculate_column(x) {
    const grid = this.grid;
    this.result[0][x] = grid[x][0] * prime_number_grid[x][0] *
                        grid[x][1] * prime_number_grid[x][1] *
                        grid[x][2] * prime_number_grid[x][2] ;
  }

  recalculate_diag_1(xy) {
    const grid = this.grid;
    this.results[2][0] = grid[0][0] * prime_number_grid[0][0] *
                         grid[1][1] * prime_number_grid[1][1] *
                         grid[2][2] * prime_number_grid[2][2] ;
  }

  recalculate_diag_2(xy) {
    const grid = this.grid;
    this.results[2][1] = grid[0][2] * prime_number_grid[0][2] *
                         grid[1][1] * prime_number_grid[1][1] *
                         grid[2][0] * prime_number_grid[2][0] ;
  }

  recalculate_diags() { recalculate_diag_1(1); recalculate_diag_2(1); }

  recalculate_score(move) {
    const x = move[1];
    const y = move[0];
    recalculate_line(y);
    recalculate_column(x);
    if (x == y && x == 1) {
      recalculate_diags();
    } else if (y == x) {
      recalculate_diag_1(x);
    } else if (y + x == 2) {
      recalculate_diag_2(x == 0 ? y : x);
    }
  }

  /* grid rendering */

  get_case(x, y) {
    const score = this.grid[x][y];
    const char = score == 1 ? 'x' : score == 2 ? 'o' : '  ';
    return `|   ${char}   `;
  }

  get_grid() {
    let grid = "";
    for(let x = 0; x < 3; x++) {
      grid += "------------------\n";
      for(let y = 0; y < 3; y++) {
        grid += this.get_case(x, y);
      }
      grid += "|\n";
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

  how_wins(scores) {
    const wins = _.intersection(scores, this.current_player).size > 0;
    if (wins) {
      this.wins();
    } else {
      this.end_normal_turn();
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
    this.grid[move[0]][move[1]] = number;
    this.recalculate_score(move);
    const scores = [].concat.apply([], this.results);
    this.how_wins(scores);
  }

  play(player, move) {
    channel.send(`#{player.to_s} played ${move}`);
    this.last_move = move;
    if (this.player1.id === player.id) {
      this.current_player = this.player1;
      this.next_player = this.player2;
    } else {
      this.current_player = this.player2;
      this.next_player = this.player1;
    }
    this.process(move.split(':'));
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
