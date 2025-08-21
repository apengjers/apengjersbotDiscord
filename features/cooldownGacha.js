const fs = require('fs');
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} = require('discord.js');
const { formatTimestampToWIB } = require('../utils/timeUtils');
const { saveCooldowns, loadCooldowns } = require('../utils/storageUtils');

const COOLDOWN_TIME = 2 * 60 * 60 * 1000; // 2 jam
const COOLDOWN_FILE = './cooldowns.json';
const MESSAGES_FILE = './cooldownMessages.json'; // simpan pesan tag user

let cooldowns = loadCooldowns(COOLDOWN_FILE);
let cooldownMessages = loadCooldowns(MESSAGES_FILE) || {}; // { messageId: timestamp }
let mainMessage;

module.exports = async function setupCooldownFeature(client) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID_GACHA);

  if (!channel) return console.error('Channel Gacha tidak ditemukan');

  const messages = await channel.messages.fetch({ limit: 50 });
  mainMessage = messages.find(
    (m) =>
      m.author.id === client.user.id &&
      m.embeds[0]?.title === 'Cooldown Gacha Buah Blox Fruit'
  );

  if (!mainMessage) {
    const embed = await buildCooldownEmbed();
    const components = await buildButtons();
    mainMessage = await channel.send({ embeds: [embed], components });
  } else {
    await updateMainMessage();
  }

  for (const userId in cooldowns) {
    scheduleCooldownNotification(userId, cooldowns[userId], channel, client);
  }

  // Jadwalkan pengecekan hapus pesan tag user tiap 1 jam
  setInterval(() => {
    checkAndDeleteExpiredTagMessages(channel);
  }, 60 * 60 * 1000);

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'reset_cooldown') {
      const userId = interaction.user.id;
      const now = Date.now();
      const endTime = now + COOLDOWN_TIME;

      cooldowns[userId] = endTime;
      saveCooldowns(COOLDOWN_FILE, cooldowns);

      scheduleCooldownNotification(userId, endTime, channel, client);

      await interaction.reply({
        content: `Cooldown kamu di-set, selesai jam ${formatTimestampToWIB(endTime)}`,
        ephemeral: true
      });

      await updateMainMessage();
    }
  });
};

async function buildCooldownEmbed() {
  let description = '';

  if (Object.keys(cooldowns).length === 0) {
    description = 'Belum ada yang reset cooldown.';
  } else {
    for (const userId in cooldowns) {
      const endTime = cooldowns[userId];
      description += `<@${userId}> : sampai ${formatTimestampToWIB(endTime)}\n`;
    }
  }

  return new EmbedBuilder()
    .setTitle('Cooldown Gacha Buah Blox Fruit')
    .setDescription(description)
    .setColor('Green')
    .setFooter({ text: 'Waktu dalam WIB (UTC+7)' });
}

async function buildButtons() {
  const button = new ButtonBuilder()
    .setCustomId('reset_cooldown')
    .setLabel('Reset Cooldown')
    .setStyle(ButtonStyle.Primary);

  return [new ActionRowBuilder().addComponents(button)];
}

async function updateMainMessage() {
  if (!mainMessage) return;
  const embed = await buildCooldownEmbed();
  const components = await buildButtons();
  await mainMessage.edit({ embeds: [embed], components });
}

function scheduleCooldownNotification(userId, endTime, channel, client) {
  const delay = endTime - Date.now();
  if (delay <= 0) return;

  setTimeout(async () => {
    delete cooldowns[userId];
    saveCooldowns(COOLDOWN_FILE, cooldowns);

    // Kirim pesan tag user dan simpan ID pesan tsb beserta timestamp sekarang
    const sentMessage = await channel.send(`<@${userId}>, cooldown kamu sudah habis! Ayo gacha lagi!`);

    cooldownMessages[sentMessage.id] = Date.now();
    saveCooldowns(MESSAGES_FILE, cooldownMessages);

    try {
      const user = await client.users.fetch(userId);
      await user.send('Cooldown kamu sudah habis! Ayo gacha Blox Fruit lagi!');
    } catch (err) {
      console.error(`Gagal kirim DM ke ${userId}:`, err.message);
    }

    await updateMainMessage();
  }, delay);
}

async function checkAndDeleteExpiredTagMessages(channel) {
  const now = Date.now();
  const deleteIds = [];

  for (const messageId in cooldownMessages) {
    const sentTime = cooldownMessages[messageId];
    if (now - sentTime > 24 * 60 * 60 * 1000) { // 24 jam
      try {
        const message = await channel.messages.fetch(messageId);
        if (message) {
          await message.delete();
        }
      } catch (err) {
        console.warn(`Gagal hapus pesan ${messageId}:`, err.message);
      }
      deleteIds.push(messageId);
    }
  }

  // Hapus dari object dan simpan ulang
  for (const id of deleteIds) {
    delete cooldownMessages[id];
  }
  saveCooldowns(MESSAGES_FILE, cooldownMessages);
}
