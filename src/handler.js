const config = require("./configs/config.js");
const { ArifzynAPI } = require("@arifzyn/api");
const { delay, jidNormalizedUser } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const { plugins } = require("./configs/plugins.js");
const util = require("util");
const Color = require("./lib/color.js");

const API = new ArifzynAPI();

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
    await require("./configs/localdb").loadDatabase(m);

    let quoted = m.isQuoted ? m.quoted : m;
    if (m.isBaileys || (config.self && !m.isOwner)) return;
    if (m.chat && m.isGroup && db.groups[m.chat]?.mute && !m.isOwner) return;

    if (m.message) {
      console.log(
        Color.cyan("Dari"),
        Color.cyan(client.getName(m.chat)),
        Color.blueBright(m.chat),
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

    const checkConditions = (condition, message) => {
      if (condition) {
        m.reply(message);
        return true;
      }
      return false;
    };

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
      const { args, text, prefix } = m;
      const isCommand = m.prefix && m.body.startsWith(m.prefix);
      const command = isCommand ? m.command.toLowerCase() : false;

      for (let name in plugins) {
        let plugin = plugins[name];

        if (!plugin) continue;
        if (plugin.disabled) continue;

        try {
          if (typeof plugin.all === "function") {
            await plugin.all.call(ctx, { bot });
          }

          if (typeof plugin.before === "function") {
            if (await plugin.before.call(ctx, { bot })) continue;
          }

          if (isCommand) {
            const isAccept = Array.isArray(plugin.cmd)
              ? plugin.cmd.includes(m.command)
              : typeof plugin.cmd === "string" && plugin.cmd === m.command;

            if (!isAccept) continue;
            m.plugin = name;
            m.isCommand = true;

            if (checkConditions(plugin.owner && !m.isOwner, "owner")) continue;
            if (checkConditions(plugin.premium && !isPrems, "premium"))
              continue;
            if (
              checkConditions(
                plugin.nsfw && m.isGroup && !db.chats[m.chat].nsfw,
                "NSFW Tidak aktif.",
              )
            )
              continue;
            if (
              checkConditions(
                plugin.game && m.isGroup && !db.chats[m.chat].game,
                "Game Tidak aktif di chat ini.",
              )
            )
              continue;
            if (checkConditions(plugin.group && !m.isGroup, "group")) continue;
            if (checkConditions(plugin.botAdmin && !m.isBotAdmin, "botAdmin"))
              continue;
            if (checkConditions(plugin.admin && !m.isAdmin, "admin")) continue;
            if (checkConditions(plugin.private && m.isGroup, "private"))
              continue;
            if (checkConditions(plugin.quoted && !m.isQuoted, "quoted"))
              continue;

            try {
              await plugin.execute(m, {
                client,
                command,
                prefix,
                args,
                text,
                quoted,
                plugins,
                store,
                API
              });
            } catch (e) {
              console.error(e);
              await m.reply(util.format(e));
            } finally {
              if (typeof plugin.after === "function") {
                try {
                  await plugin.after.call(ctx, { bot });
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (error) {
    console.error(Color.redBright("Error handling message:"), error);
  }
};

module.exports = { handleMessagesUpsert };
