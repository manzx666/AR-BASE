// lib/commandHandler.js

const fs = require("fs");
const path = require("path");
const Color = require("./color.js");

const commands = new Map();

const loadCommands = () => {
  commands.clear();

  const commandFiles = fs
    .readdirSync(path.join(__dirname, "../commands"))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    command.cmd.forEach((cmdName) => {
      commands.set(cmdName, command);
    });
  }
  console.log(Color.greenBright("Commands loaded successfully!"));
  return commands;
};

const watchCommands = () => {
  const commandsPath = path.join(__dirname, "../commands");

  fs.watch(commandsPath, (eventType, filename) => {
    if (filename) {
      const filePath = path.join(commandsPath, filename);
      if (eventType === "change") {
        delete require.cache[require.resolve(filePath)];
        loadCommands();
        console.log(Color.greenBright(`Command file updated: ${filename}`));
      } else if (eventType === "rename") {
        if (fs.existsSync(filePath)) {
          // File added
          delete require.cache[require.resolve(filePath)];
          loadCommands();
          console.log(Color.blueBright(`New command added: ${filename}`));
        } else {
          // File removed
          loadCommands();
          console.log(Color.redBright(`Command removed: ${filename}`));
        }
      }
    }
  });
};

module.exports = { loadCommands, watchCommands, commands };
