export async function before(m) {
  if (m.body === "test") {
    m.reply("Yoo");
  }
}
