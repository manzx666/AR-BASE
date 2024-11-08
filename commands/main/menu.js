const readMore = String.fromCharCode(8206).repeat(4001);
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const toUpper = (str) => str.replace(/^\w/, (c) => c.toUpperCase());

export default {
  cmd: ["menu", "help"],
  name: ["menu", "help"],
  category: ["main"],
  description: "Menampilkan list menu",
  execute: async (m, { client, plugins }) => {
    const objChats = client.chats.dict;
    const groupChat = await client.groupFetchAllParticipating();
    const personalChats = Object.values(objChats).filter(
      (chat) => !chat.id.includes("@g.us"),
    );
    const groupChats = Object.values(groupChat).filter((chat) =>
      chat.id.includes("@g.us"),
    );
    const communityChats = Object.values(groupChat).filter(
      (chat) => chat.isCommunity,
    );

    let runtime = new Date(process.uptime() * 1000).toUTCString().split(" ")[4];
    let ping = Date.now() - m.timestamp * 1000;

    let botInfo =
      `\`</> *BOT INFO* </>\`\n` +
      `- Personal Chats: ${personalChats.length}\n` +
      `- Group Chats: ${groupChats.length}\n` +
      `- Community: ${communityChats.length}\n` +
      `- Uptime: ${runtime}\n` +
      `- Mode: Public\n`;

    let body = `🤖 Hai @${m.sender.split("@")[0]}, selamat datang di asisten pribadi Anda di WhatsApp! Berikut adalah daftar menu:\n\n${botInfo}${readMore}`;

    const commandsByCategory = {};

    for (const [filePath, command] of Object.entries(plugins)) {
      const cmd = command.default || command;
      if (!cmd || !cmd.cmd || !Array.isArray(cmd.cmd) || !cmd.cmd[0]) {
        continue;
      }

      const tags = cmd.category
        ? Array.isArray(cmd.category)
          ? cmd.category
          : [cmd.category]
        : [];
      tags.forEach((category) => {
        if (!commandsByCategory[category]) {
          commandsByCategory[category] = [];
        }
        commandsByCategory[category].push(cmd);
      });
    }

    for (const category in commandsByCategory) {
      body += `\n*${toUpper(category)} Features*\n`;
      commandsByCategory[category].forEach((cmd, index) => {
        const names = Array.isArray(cmd.name) ? cmd.name : [cmd.name];
        names
          .sort((a, b) => a.toString().localeCompare(b))
          .forEach((name, i) => {
            body += `${index + 1 + i}. ${m.prefix + name}: ${cmd.description || "No description"}\n`;
          });
      });
    }

    body += `\nCreate With ❤️ Made By Arifzyn.`;

    await m.reply(body);
  },
};
