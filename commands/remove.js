const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes a category")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Name of the category")
        .setRequired(false)
    ),
  async execute(interaction) {
    const getCategoryName = (interaction) => {
      if (interaction.options.getString("category") == null) {
        const thisChannel = interaction.guild.channels.cache.find(
          (channel) => channel.id == interaction.channelId
        );
        const parentChannel = interaction.guild.channels.cache.find(
          (channel) => channel.id == thisChannel.parentId
        );

        if (parentChannel.name !== "Categories") {
          return false;
        }

        return thisChannel.name;
      } else {
        return interaction.options
          .getString("category")
          .toLowerCase()
          .replace(/ /g, "-");
      }
    };

    const categoryName = getCategoryName(interaction);

    const categoryChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.parentId == "1121448960339497041" &&
        channel.name == categoryName
    );
    const upscaledChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.parentId == "1121449008519454770" &&
        channel.name.endsWith(`${categoryName}-upscaled`)
    );

    if (categoryChannel || upscaledChannel) {
      if (categoryChannel) categoryChannel.delete();
      if (upscaledChannel) upscaledChannel.delete();

      interaction.reply("Removed!");
    } else {
      interaction.reply("Couldn't find category");
    }
  },
};
