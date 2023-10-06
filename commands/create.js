const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Creates a category')
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

    const categoriesCategory = interaction.guild.channels.cache.find(
      (channel) => channel.id == '1121448960339497041'
    );
    const upscaledCategory = interaction.guild.channels.cache.find(
      (channel) => channel.id == '1121449008519454770'
    );

    interaction.guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildText,
      parent: categoriesCategory.id,
    });

    interaction.guild.channels.create({
      name: `${categoryName}-upscaled`,
      type: ChannelType.GuildText,
      parent: upscaledCategory.id,
    });

    await interaction.reply('Created!');
  },
};
