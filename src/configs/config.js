require("dotenv").config();

module.exports = {
  owner: ["62895347198105", "6285691464024"],
  pairingNumber: "62895347198105",
  self: true,
  autoReadStory: true,
  autoReadStoryEmoji: true,
  autoOnline: true,
  storyReadInterval: 1000,
  autoRestart: "350 MB",
  autoReadMessage: false,
  writeStore: true,
  session: process.env.SESSION,
  database: process.env.DATABASE,
};
