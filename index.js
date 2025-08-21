require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const setupCooldownFeature = require('./features/cooldownGacha.js');
const setupAnotherFeature = require('./features/calculate.js');
const setupTransactionFeature = require('./features/transaction');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, async () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);

  await setupCooldownFeature(client);
  await setupAnotherFeature(client);
  await setupTransactionFeature(client);
});

client.login(process.env.TOKEN);
