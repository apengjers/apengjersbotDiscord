const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  Events,
  ComponentType
} = require('discord.js');

module.exports = async function setupAnotherFeature(client) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID_ANOTHER);
  if (!channel) return console.error('Channel estimasi tidak ditemukan');

  const embed = new EmbedBuilder()
    .setTitle('📦 Estimasi Produksi')
    .setDescription(
      `Silakan klik tombol di bawah dan masukkan jumlah order (dalam M).\n` +
      `Bot akan menampilkan estimasi detail dari 3 toko dengan gaya berbeda.` +
      `\nToko A = Apeng\nToko B = Erer\nToko C = Agus`
    )
    .setColor('Blue');

  const inputButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('input_nominal')
      .setLabel('🔢 Input Jumlah Order')
      .setStyle(ButtonStyle.Primary)
  );

  // Ambil 10 pesan terakhir dan cek apakah sudah pernah dikirim
  const messages = await channel.messages.fetch({ limit: 10 });
  const existingMessage = messages.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title === embed.data.title
  );

  // Bandingkan isi embed
  const existingEmbed = existingMessage?.embeds[0];
  const isSameEmbed =
    existingEmbed &&
    existingEmbed.title === embed.data.title &&
    existingEmbed.description === embed.data.description;

  if (!isSameEmbed) {
    if (existingMessage) await existingMessage.delete(); // Hapus versi lama

    await channel.send({
      embeds: [embed],
      components: [inputButton]
    });
  }

  // Event listener hanya ditambahkan sekali
  if (!client._anotherFeatureSetup) {
    client._anotherFeatureSetup = true;

    client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isButton() && interaction.customId === 'input_nominal') {
        const modal = new ModalBuilder()
          .setCustomId('modal_nominal')
          .setTitle('Input Jumlah Order');

        const nominalInput = new TextInputBuilder()
          .setCustomId('nominal_value')
          .setLabel('Masukkan jumlah (contoh: 50)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(nominalInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
      }

      if (interaction.isModalSubmit() && interaction.customId === 'modal_nominal') {
        const input = interaction.fields.getTextInputValue('nominal_value');
        const nominal = parseInt(input);

        if (isNaN(nominal) || nominal <= 0) {
          return await interaction.reply({ content: '❌ Jumlah tidak valid.', ephemeral: true });
        }

        const hargaNormal = 1000;
        const hargaDiskon50 = 700;
        const hargaDiskon100 = 700;

        let hargaPerM;
        if (nominal >= 100) hargaPerM = hargaDiskon100;
        else if (nominal >= 50) hargaPerM = hargaDiskon50;
        else hargaPerM = hargaNormal;

        const totalHarga = nominal * hargaPerM;
        const estimasiProses = Math.ceil((nominal + nominal * 0.10) * 24);
        const estimasiProsesGp = Math.ceil((nominal + nominal * 0.10) * 15);

        const selesai = new Date(Date.now() + estimasiProses * 60000)
          .toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const selesaiGp = new Date(Date.now() + estimasiProsesGp * 60000)
          .toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        function formatEstimasi(menit) {
          const hari = Math.floor(menit / 1440);
          const jam = Math.floor((menit % 1440) / 60);
          const menitSisa = menit % 60;

          const parts = [];
          if (hari) parts.push(`${hari} hari`);
          if (jam) parts.push(`${jam} jam`);
          if (menitSisa) parts.push(`${menitSisa} menit`);

          return parts.join(" ");
        }

        const formatHarga = (v) => `Rp${v.toLocaleString('id-ID')}`;

        const embeds = [
          new EmbedBuilder()
            .setTitle('🛒- Estimasi Proses')
            .setColor('Blue')
            .setDescription(
              `Terima kasih sudah order di Store Tercepat! Estimasi produksi ${nominal}M:\n\n` +
              `📦 Normal: ${formatEstimasi(estimasiProses)} (Selesai: ${selesai})\n` +
              `⚡ Gamepass: ${formatEstimasi(estimasiProsesGp)} (Selesai: ${selesaiGp})\n\n` +
              `💰 Harga per M: ${formatHarga(hargaPerM)}\n` +
              `🧮 Total Harga: ${formatHarga(totalHarga)}\n\n` +
              `Hubungi admin untuk melanjutkan order.`
            ),

          new EmbedBuilder()
            .setTitle('🏬 Info Estimasi')
            .setColor('Green')
            .setDescription(
              `Halo pelanggan Store Tercinta, berikut estimasi untuk pesanan ${nominal}M:\n\n` +
              `🕐 Estimasi Normal: ${formatEstimasi(estimasiProses)} (Selesai: ${selesai})\n` +
              `⚡ Dengan Gamepass: ${formatEstimasi(estimasiProsesGp)} (Selesai: ${selesaiGp})\n\n` +
              `💸 Harga/M: ${formatHarga(hargaPerM)} | Total: ${formatHarga(totalHarga)}\n\n` +
              `Semoga membantu! Jika sudah cocok, langsung lanjut.`
            ),

          new EmbedBuilder()
            .setTitle('Rincian Estimasi')
            .setColor('Purple')
            .setDescription(
              `Hi sobat Store Tersolid! Berikut detail untuk order ${nominal}M:\n\n` +
              `⏳ Normal: ${formatEstimasi(estimasiProses)} → ${selesai}\n` +
              `⚡ GP: ${formatEstimasi(estimasiProsesGp)} → ${selesaiGp}\n\n` +
              `💰 Per M: ${formatHarga(hargaPerM)} | Total: ${formatHarga(totalHarga)}\n\n` +
              `Order Sekarang sebelum Full Slot Joki!`
            )
        ];

        await interaction.reply({ embeds, ephemeral: true });
      }
    });
  }
};
