import config from "./configs/config.js";
import { ArifzynAPI } from "@arifzyn/api";
import baileys from "@whiskeysockets/baileys";
import { exec } from "child_process";
import { plugins } from "./configs/plugins.js";
import Color from "./lib/color.js";
import util from "util";
import { loadDatabase } from "./configs/localdb.js";

const { delay, jidNormalizedUser } = baileys;
const API = new ArifzynAPI();

const handleEvalCommand = async (m) => {
  try {
    const evalCmd = /await/i.test(m.text)
      ? await eval(`(async () => { ${m.text} })()`)
      : eval(m.text);
    m.reply(util.format(evalCmd));
  } catch (e) {
    m.reply(util.format(e));
  }
};

const handleExecCommand = async (m) => {
  try {
    exec(m.text, (err, stdout) => {
      if (err) return m.reply(util.format(err));
      if (stdout) return m.reply(util.format(stdout));
    });
  } catch (e) {
    m.reply(util.format(e));
  }
};

const handleMessagesUpsert = async (client, store, m) => {
  try {
    await loadDatabase(m);
    const quoted = m.isQuoted ? m.quoted : m;

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

    // Handle eval
    if (
      [">", "eval", "=>"].some((a) => m.command.toLowerCase().startsWith(a)) &&
      m.isOwner
    ) {
      await handleEvalCommand(m);
    }

    // Handle exec
    if (
      ["$", "exec"].some((a) => m.command.toLowerCase().startsWith(a)) &&
      m.isOwner
    ) {
      await handleExecCommand(m);
    }

    // Handle command if message starts with a command prefix
    if (m.prefix) {
      const { args, text, prefix } = m;
      const isCommand = m.body.startsWith(m.prefix);
      const command = isCommand ? m.command.toLowerCase() : false;

      for (let name in plugins) {
        const plugin = plugins[name];
        if (!plugin || plugin.disabled) continue;

        try {
          if (typeof plugin.all === "function") {
            await plugin.all.call(ctx, { bot });
          }

          if (
            typeof plugin.before === "function" &&
            (await plugin.before.call(ctx, { bot }))
          )
            continue;

          if (isCommand) {
            const isAccept = Array.isArray(plugin.cmd)
              ? plugin.cmd.includes(m.command)
              : plugin.cmd === m.command;

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
                API,
              });
            } catch (e) {
              console.error(e);
              m.reply(util.format(e));
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

export { handleMessagesUpsert };
export default {
  handleMessagesUpsert,
};
