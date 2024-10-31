const config = require("./configs/config");
const { delay, jidNormalizedUser } = require("@whiskeysockets/baileys");
const util = require("util");
const { exec } = require("child_process");
const { loadCommands, watchCommands, commands } = require("./lib/commands");
const Color = require("./lib/color.js");

loadCommands();
watchCommands();

const handleEvalCommand = async (m) => {
  let evalCmd = "";
  try {
    evalCmd = /await/i.test(m.text)
      ? await eval("(async() => { " + m.text + " })()")
      : eval(m.text);
    m.reply(util.format(evalCmd));
  } catch (e) {
    m.reply(util.format(e));
  }
};

const handleExecCommand = async (m) => {
  try {
    exec(m.text, async (err, stdout) => {
      if (err) return m.reply(util.format(err));
      if (stdout) return m.reply(util.format(stdout));
    });
  } catch (e) {
    await m.reply(util.format(e));
  }
};

const handleMessagesUpsert = async (client, store, m) => {
  try {
    let quoted = m.isQuoted ? m.quoted : m;
    if (m.isBot || (config.self && !m.isOwner)) return;
    if (m.from && db.groups[m.from]?.mute && !m.isOwner) return;

    await require("./lib/loadDB").loadDatabase(m);

    if (m.message) {
      console.log(
        Color.cyan("Dari"),
        Color.cyan(client.getName(m.from)),
        Color.blueBright(m.from),
      );
      console.log(
        Color.yellowBright("Chat"),
        Color.yellowBright(
          m.isGroup
            ? `Grup (${m.sender} : ${client.getName(m.sender)})`
            : "Pribadi",
        ),
      );
      console.log(
        Color.greenBright("Pesan :"),
        Color.greenBright(m.body || m.type),
      );
    }

    // eval
    if (
      [">", "eval", "=>"].some((a) => m.command.toLowerCase().startsWith(a)) &&
      m.isOwner
    ) {
      await handleEvalCommand(m);
    }

    // exec
    if (
      ["$", "exec"].some((a) => m.command.toLowerCase().startsWith(a)) &&
      m.isOwner
    ) {
      await handleExecCommand(m);
    }

    // Handle command if message starts with a command prefix
    if (m.prefix) {
      const { args, text } = m;
      const isCommand = m.prefix && m.body.startsWith(m.prefix);
      const commandName = isCommand ? m.command.toLowerCase() : false;

      if (commandName && commands.has(commandName)) {
        const command = commands.get(commandName);
        const isAccept = Array.isArray(command.cmd)
          ? command.cmd.includes(commandName)
          : false;

        if (isAccept) {
          try {
            await command.execute(m, {
              client,
              args,
              text,
              quoted,
              commands,
              store,
            });
          } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            await m.reply(util.format(error));
          }
        }
      }
    }
  } catch (error) {
    console.error(Color.redBright("Error handling message:"), error);
  }
};

module.exports = { handleMessagesUpsert };
