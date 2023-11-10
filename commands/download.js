const { SlashCommandBuilder, ChannelType, TextChannel } = require("discord.js");

const axios = require("axios");
const fs = require("fs");
const Path = require("path");
const archiver = require("archiver");
const util = require("util");

const downloadFolder = "./images/";

const zipFilePath = "./images.zip";

const MAX_SIZE = 23 * 1024 * 1024; // 23MB
const archiveFinalize = util.promisify(function (archive, callback) {
  archive.finalize();
  archive.on("end", callback);
});

async function zipDirectory(directory, zipPath) {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.directory(directory, false);

  archive.pipe(output);

  archive.finalize();

  return new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });
}

async function downloadImage(url) {
  const path = Path.resolve(downloadFolder, Path.basename(url.split("?")[0]));
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  });

  response.data.pipe(fs.createWriteStream(path));

  return new Promise((resolve, reject) => {
    response.data.on("end", () => resolve());
    response.data.on("error", (err) => reject(err));
  });
}

// download all images
async function downloadAndZipAll(urls) {
  // Download images
  for (const url of urls) {
    try {
      await downloadImage(url);
      console.log(`Successfully downloaded image from url: ${url}`);
    } catch (err) {
      console.error(`Failed to download image from url: ${url}`, err);
    }
  }

  // // Zip them
  // try {
  //   await zipDirectory(downloadFolder, zipFilePath);
  //   console.log(
  //     `Successfully zipped the directory: ${downloadFolder} into: ${zipFilePath}`
  //   );
  // } catch (err) {
  //   console.error(
  //     `Failed to zip the directory: ${downloadFolder} into: ${zipFilePath}`,
  //     err
  //   );
  // }
}

async function createZipArchives(directory) {
  const files = fs.readdirSync(directory);
  let currentSize = 0;
  let archiveIndex = 0;
  let archive = createArchive(archiveIndex);
  let archiveNames = [`images_${archiveIndex}.zip`];

  for (const file of files) {
    const filePath = Path.join(directory, file);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    if (currentSize + fileSize > MAX_SIZE) {
      await archiveFinalize(archive);
      archiveIndex += 1;
      archive = createArchive(archiveIndex);
      archiveNames.push(`images_${archiveIndex}.zip`);
      currentSize = 0;
    }

    archive.file(filePath, { name: file });
    currentSize += fileSize;
  }

  await archiveFinalize(archive);

  function createArchive(index) {
    const output = fs.createWriteStream(`./archives/images_${index}.zip`);
    const archive = archiver("zip");
    archive.pipe(output);
    return archive;
  }

  return archiveNames;
}

function deleteOldFiles() {
  fs.readdir("./images/", (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(Path.join("./images/", file), (err) => {
        if (err) throw err;
      });
    }
  });

  fs.readdir("./archives/", (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(Path.join("./archives/", file), (err) => {
        if (err) throw err;
      });
    }
  });
}

const IGNORE_INTERACTIONS = false;
module.exports = {
  data: new SlashCommandBuilder()
    .setName("download")
    .setDescription("Download all new images")
    .addStringOption((option) =>
      option.setName("before").setDescription("Before specific id")
    ),
  async execute(interaction) {
    const channel = interaction.channel;
    const parentId = channel.parentId;
    const parentChannel = channel.guild.channels.cache.find(
      (c) => c.id == parentId
    );

    if (parentChannel.name !== "Upscales") {
      interaction.reply(
        "Can't start download, outside of the upscales channel."
      );
      return;
    }

    const messages = await channel.messages.fetch({
      limit: 100,
      before: interaction.options.getString("before"),
    });

    const filteredMesssages = messages.filter(
      (m) =>
        m.attachments.size > 0 &&
        (IGNORE_INTERACTIONS || m.reactions.cache.size == 0)
    );

    // const filteredMesssages = botMessagesWithImages.filter(async (msg) => {
    //   const reactions = await msg.reactions.cache;
    //   return reactions.size == 0;
    // });

    interaction.reply("Starting download..");

    const urls = filteredMesssages
      .filter(
        (message) =>
          !message.attachments.entries().next().value[1].url.includes(".zip")
      )
      .map((message) => {
        message.react("✅");
        return message.attachments.entries().next().value[1].url;
      });

    deleteOldFiles();

    await downloadAndZipAll(urls);

    const archives = await createZipArchives(downloadFolder);
    const archivesMapped = archives.map((a) =>
      Object.create({
        attachment: `./archives/${a}`,
      })
    );

    channel.send({
      content: "Images:",
      files: archivesMapped,
    });
  },
};
