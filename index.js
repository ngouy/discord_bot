const settings = require('./settings');
const commando = require('discord.js-commando');
const bot = new commando.Client({owner: settings.client_id});
bot.login(settings.token);

bot.registry
  .registerGroups([
    ['games', 'Liitle games']
  ])
  .registerDefaults()
  .registerCommandsIn(__dirname + '/commands');
