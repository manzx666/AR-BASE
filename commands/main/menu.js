const cmd = {
  cmd: ["menu", "help", "allmenu"],
  name: ["menu"],
  category: ["main"],
  desc: "Menampilkan menu bot",
  options: {
    text: "query",
  },
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  isBotAdmin: false,
  isOwner: false,
  isNsfw: false,
  isPremium: false,
  isVIP: false,
  isQuoted: false,
  disable: false,
  limit: 0,
  exp: 5,
  timeout: 0,
};

cmd.execute = async (
  m,
  {
    client,
    args,
    prefix,
    command,
    text,
    plugins,
    API,
    Func,
    userPerms,
    groupSettings,
  },
) => {
  try {
    const commandsByCategory = {};

    Object.keys(plugins).forEach((name) => {
      const plugin = plugins[name];
      if (!plugin || plugin.disabled) return;

      const commandNames = Array.isArray(plugin.name)
        ? plugin.name
        : [plugin.name];
      if (!commandNames.length) return;

      const categories = Array.isArray(plugin.category)
        ? plugin.category
        : [plugin.category || "Uncategorized"];

      categories.forEach((category) => {
        if (!commandsByCategory[category]) {
          commandsByCategory[category] = new Map();
        }

        const cmdInfo = {
          names: commandNames,
          rowId: prefix + commandNames[0],
          isLimit: plugin.limit > 0,
          isPremium: plugin.isPremium,
          isVIP: plugin.isVIP,
          desc: plugin.desc || "No description",
        };

        commandsByCategory[category].set(commandNames[0], cmdInfo);
      });
    });

    const totalCommands = Object.values(commandsByCategory).reduce(
      (total, cmds) => total + cmds.size,
      0,
    );

    let menuText = `Hi ${m.pushName || "User"} 👋\n\n`;
    menuText += `🤖 Bot Info:\n`;
    menuText += `◦ Prefix: ${prefix}\n`;
    menuText += `◦ Time: ${new Date().toLocaleString()}\n`;
    menuText += `◦ Total Commands: ${totalCommands}\n`;
    menuText += `◦ User Status: ${userPerms.isPrems ? "Premium" : userPerms.isVIP ? "VIP" : "Free"}\n`;
    menuText += `◦ Limit: ${userPerms.userLimit}\n`;
    menuText += `◦ Level: ${userPerms.userLevel}\n`;
    menuText += `◦ Exp: ${userPerms.userExp}\n\n`;

    const sortedCategories = Object.entries(commandsByCategory).sort(
      ([a], [b]) => a.localeCompare(b),
    );

    sortedCategories.forEach(([category, commands]) => {
      if (commands.size > 0) {
        menuText += `📑 *${category.toUpperCase()}*\n`;
        Array.from(commands.values())
          .sort((a, b) => a.names[0].localeCompare(b.names[0]))
          .forEach((cmd) => {
            const tags = [];
            if (cmd.isLimit) tags.push("Ⓛ");
            if (cmd.isPremium) tags.push("Ⓟ");
            if (cmd.isVIP) tags.push("Ⓥ");

            const allNames = cmd.names.map((name) => prefix + name).join(", ");
            menuText += `◦ ${allNames} ${tags.join("")}\n`;
          });
        menuText += "\n";
      }
    });

    menuText += `📝 Note:\n`;
    menuText += `Ⓛ = Limit\n`;
    menuText += `Ⓟ = Premium\n`;
    menuText += `Ⓥ = VIP\n\n`;
    menuText += `Ketik ${prefix}help <command> untuk melihat detail command`;

    if (text) {
      const pluginName = Object.keys(plugins).find((name) => {
        const plugin = plugins[name];
        return (
          plugin &&
          Array.isArray(plugin.name) &&
          plugin.name.some((n) => n.toLowerCase() === text.toLowerCase())
        );
      });

      if (pluginName) {
        const plugin = plugins[pluginName];
        const allNames = Array.isArray(plugin.name)
          ? plugin.name
          : [plugin.name];

        let helpText = `🔍 *Command Details*\n\n`;
        helpText += `◦ Names: ${allNames.map((n) => prefix + n).join(", ")}\n`;
        helpText += `◦ Category: ${Array.isArray(plugin.category) ? plugin.category.join(", ") : plugin.category || "Uncategorized"}\n`;
        helpText += `◦ Description: ${plugin.desc || "No description"}\n`;
        helpText += `◦ Usage: ${prefix}${allNames[0]} ${Object.entries(
          plugin.options || {},
        )
          .map(([k, v]) => `<${v}>`)
          .join(" ")}\n\n`;
        helpText += `📝 Options:\n`;
        Object.entries(plugin.options || {}).forEach(([key, value]) => {
          helpText += `◦ ${key}: ${value}\n`;
        });
        helpText += `\n📋 Requirements:\n`;
        helpText += `${plugin.isGroup ? "◦ Group\n" : ""}`;
        helpText += `${plugin.isAdmin ? "◦ Admin Group\n" : ""}`;
        helpText += `${plugin.isBotAdmin ? "◦ Bot Admin\n" : ""}`;
        helpText += `${plugin.isPrivate ? "◦ Private Chat\n" : ""}`;
        helpText += `${plugin.isPremium ? "◦ Premium User\n" : ""}`;
        helpText += `${plugin.isVIP ? "◦ VIP User\n" : ""}`;
        helpText += `${plugin.isOwner ? "◦ Owner\n" : ""}`;
        helpText += `${plugin.isQuoted ? "◦ Quoted Message\n" : ""}`;
        helpText += `${plugin.limit ? `◦ Limit: ${plugin.limit}\n` : ""}`;

        return m.reply(helpText);
      } else {
        return m.reply(`Command "${text}" not found.`);
      }
    }

    m.reply(menuText);
  } catch (error) {
    console.error("Error in menu command:", error);
    m.reply("Terjadi error saat menampilkan menu.");
  }
};

export default cmd;
