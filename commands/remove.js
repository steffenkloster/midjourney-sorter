const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a category')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('Name of the category')
        .setRequired(true)
    ),
  async execute(interaction) {
    const categoryName = interaction.options
      .getString('category')
      .toLowerCase()
      .replace(/ /g, '-');

    const categoryChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.parentId == '1121448960339497041' &&
        channel.name == categoryName
    );
    const upscaledChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.parentId == '1121449008519454770' &&
        channel.name.endsWith(`${categoryName}-upscaled`)
    );

    categoryChannel.delete();
    upscaledChannel.delete();

    await interaction.reply('Removed!');
  },
};
