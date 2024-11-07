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

const handleMessagesUpsert = async (client, store, m, messages) => {
  try {
    // Load the database before processing the message
    await loadDatabase(m);
    const quoted = m.isQuoted ? m.quoted : m;

    // Skip processing certain messages
    if (m.isBaileys || (config.self && !m.isOwner)) return;
    if (m.chat && m.isGroup && db.groups[m.chat]?.mute && !m.isOwner) return;

    // Log message details
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

    // Loop through all plugins
    for (let name in plugins) {
      const plugin = plugins[name];
      if (!plugin || plugin.disabled) continue;

      try {
        // Execute 'all' function of the plugin if defined
        if (typeof plugin.all === "function") {
          await plugin.all.call(client, m, { messages });
        }

        // Execute 'before' function of the plugin if defined
        if (typeof plugin.before === "function") {
          if (await plugin.before.call(client, m, { messages })) continue;
        }

        // Check if the message is a command
        if (m.prefix) {
          const { args, text, prefix } = m;
          const isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false;
          const command = isCommand ? m.command.toLowerCase() : false;

          // Check if the plugin accepts the command
          const isAccept = Array.isArray(plugin.cmd)
            ? plugin.cmd.includes(command)
            : plugin.cmd === command;

          if (!isAccept) continue;

          // Set plugin name and mark the message as a command
          m.plugin = name;
          m.isCommand = true;

          // Check plugin-specific conditions
          if (checkConditions(plugin.owner && !m.isOwner, "owner")) continue;
          if (checkConditions(plugin.premium && !isPrems, "premium")) continue;
          if (
            checkConditions(
              plugin.nsfw && m.isGroup && !db.chats[m.chat]?.nsfw,
              "NSFW Tidak aktif.",
            )
          )
            continue;
          if (
            checkConditions(
              plugin.game && m.isGroup && !db.chats[m.chat]?.game,
              "Game Tidak aktif di chat ini.",
            )
          )
            continue;
          if (checkConditions(plugin.group && !m.isGroup, "group")) continue;
          if (checkConditions(plugin.botAdmin && !m.isBotAdmin, "botAdmin"))
            continue;
          if (checkConditions(plugin.admin && !m.isAdmin, "admin")) continue;
          if (checkConditions(plugin.private && m.isGroup, "private")) continue;
          if (checkConditions(plugin.quoted && !m.isQuoted, "quoted")) continue;

          // Try to execute the plugin's main logic
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
          } catch (error) {
            console.error(`Error in plugin ${name}:`, error);
            m.reply(util.format(error));
          } finally {
            // Execute 'after' function of the plugin if it exists
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
