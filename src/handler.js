import config from "./configs/config.js";
import baileys from "@whiskeysockets/baileys";
import Color from "./lib/color.js";
import util from "util";

import { ArifzynAPI } from "@arifzyn/api";
import { exec } from "child_process";
import { plugins } from "./configs/plugins.js";
import { loadDatabase } from "./configs/localdb.js";
import Func from "./lib/function.js";

const { delay, jidNormalizedUser } = baileys;
const API = new ArifzynAPI();

const handleMessagesUpsert = async (client, store, m, messages) => {
  try {
    await loadDatabase(m);
    const quoted = m.isQuoted ? m.quoted : m;

    if (m.isBaileys || (config.self && !m.isOwner)) return;
    if (m.chat && m.isGroup && db.groups[m.chat]?.mute && !m.isOwner) return;

    if (m.message) {
      console.log(
        Color.cyan("From"),
        Color.cyan(await client.getName(m.chat)),
        Color.blueBright(m.chat),
      );
      console.log(
        Color.yellowBright("Chat Type"),
        Color.yellowBright(
          m.isGroup
            ? `Group (${m.sender} : ${await client.getName(m.sender)})`
            : "Private",
        ),
      );
      console.log(
        Color.greenBright("Message:"),
        Color.greenBright(m.body || m.type),
      );
    }

    const checkConditions = (condition, message) => {
      if (condition) {
        m.reply(config.msg[message] || message);
        return true;
      }
      return false;
    };

    for (let name in plugins) {
      const plugin = plugins[name];
      if (!plugin || plugin.disabled) continue;

      try {
        if (typeof plugin.all === "function") {
          await plugin.all.call(client, m, { messages });
        }

        if (typeof plugin.before === "function") {
          if (await plugin.before.call(client, m, { messages })) continue;
        }

        if (m.prefix) {
          const { args, text, prefix } = m;
          const isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false;
          const command = isCommand ? m.command.toLowerCase() : false;

          const isAccept = Array.isArray(plugin.cmd)
            ? plugin.cmd.includes(command)
            : plugin.cmd === command;

          if (!isAccept) continue;

          m.plugin = name;
          m.isCommand = true;

          if (checkConditions(plugin.isOwner && !m.isOwner, "owner")) continue;
          if (checkConditions(plugin.isPremium && !isPrems, "premium"))
            continue;
          if (
            checkConditions(
              plugin.isNsfw && m.isGroup && !db.chats[m.chat]?.nsfw,
              "NSFW Tidak aktif.",
            )
          )
            continue;
          if (
            checkConditions(
              plugin.isGame && m.isGroup && !db.chats[m.chat]?.game,
              "Game Tidak aktif di chat ini.",
            )
          )
            continue;
          if (checkConditions(plugin.isGroup && !m.isGroup, "group")) continue;
          if (checkConditions(plugin.isBotAdmin && !m.isBotAdmin, "botAdmin"))
            continue;
          if (checkConditions(plugin.isAdmin && !m.isAdmin, "admin")) continue;
          if (checkConditions(plugin.isPrivate && m.isGroup, "private"))
            continue;
          if (checkConditions(plugin.isQuoted && !m.isQuoted, "quoted"))
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
              plugins,
              Func,
            });
          } catch (error) {
            console.error(`Error in plugin ${name}:`, error);
            m.reply(util.format(error));
          } finally {
            if (typeof plugin.after === "function") {
              try {
                await plugin.after.call(m, { client });
              } catch (error) {
                console.error(
                  `Error in after function of plugin ${name}:`,
                  error,
                );
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing plugin ${name}:`, error);
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
