const { serialize } = require("../lib/serialize");
const { getRandomEmoji } = require("../lib/emoji");
const { handleMessagesUpsert } = require("../handler");

module.exports = async (client, store) => {
  client.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages[0].message) return;
    let m = await serialize(client, messages[0], store);

    if (store.groupMetadata && Object.keys(store.groupMetadata).length === 0)
      store.groupMetadata = await client.groupFetchAllParticipating();

    if (m.key && !m.key.fromMe && m.key.remoteJid === "status@broadcast") {
      if (m.type === "protocolMessage" && m.message.protocolMessage.type === 0)
        return;
      await client.readMessages([m.key]);
      let id = m.key.participant;
      let name = client.getName(id);
      try {
        const randomEmoji = getRandomEmoji();
        await client.sendMessage(
          "status@broadcast",
          { react: { text: randomEmoji, key: m.key } },
          { statusJidList: [m.key.participant] },
        );
      } catch (error) {
        console.error("Error sending emoji reaction:", error);
      }
    }

    await handleMessagesUpsert(client, store, m);
  });
};
