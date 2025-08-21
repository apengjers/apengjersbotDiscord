const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  Events,
} = require('discord.js');
const { generateQrisDinamis } = require('../utils/qrisUtils'); // pake fungsi generate dari utils

module.exports = async function setupTransactionFeature(client) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID_TRANSAKSI);
  if (!channel) return console.error('Channel transaksi tidak ditemukan');

  // Kirim embed + tombol awal
  const embed = new EmbedBuilder()
    .setTitle('Transaksi GachaBot')
    .setDescription('Klik tombol di bawah untuk input jumlah order (1 order = Rp1.000).')
    .setColor('Blue');

  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('input_order')
      .setLabel('🔢 Input Jumlah Order')
      .setStyle(ButtonStyle.Primary),
  );

  // Cek pesan lama dan update kalau perlu (optional)
  const messages = await channel.messages.fetch({ limit: 10 });
  const existingMessage = messages.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title === embed.data.title
  );
  if (!existingMessage) {
    await channel.send({ embeds: [embed], components: [button] });
  }

  // Event interaction handler (hanya sekali)
  if (!client._transactionFeatureSetup) {
    client._transactionFeatureSetup = true;

    client.on(Events.InteractionCreate, async interaction => {
      // Tombol input order
      if (interaction.isButton() && interaction.customId === 'input_order') {
        const modal = new ModalBuilder()
          .setCustomId('modal_order')
          .setTitle('Input Jumlah Order');

        const inputOrder = new TextInputBuilder()
          .setCustomId('order_value')
          .setLabel('Masukkan jumlah order (contoh: 1, 2, 3...)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(inputOrder);
        modal.addComponents(row);

        await interaction.showModal(modal);
      }

      // Modal submit
      if (interaction.isModalSubmit() && interaction.customId === 'modal_order') {
        const input = interaction.fields.getTextInputValue('order_value');
        const orderCount = parseInt(input);

        if (isNaN(orderCount) || orderCount <= 0) {
          return interaction.reply({ content: '❌ Jumlah order tidak valid.', ephemeral: true });
        }

        // Hitung nominal: order × 1000
        const nominal = orderCount * 1000;

        // Generate QRIS dinamis pakai nominal di atas
        const qrisString = generateQrisDinamis(nominal);

        // Buat URL QR code pakai api.qrserver.com (atau pake library qr lokal)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisString)}`;

        const responseEmbed = new EmbedBuilder()
          .setTitle(`Transaksi Order ${orderCount}`)
          .setDescription(
            `Jumlah order: **${orderCount}**\n` +
            `Harga total: **Rp ${nominal.toLocaleString('id-ID')}**\n` +
            `Silakan scan QR di bawah untuk membayar.`
          )
          .setImage(qrCodeUrl)
          .setColor('Green');

        await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
      }
    });
  }
};
