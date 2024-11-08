export const cmd = ["ping"];
export const name = "ping";
export const category = "main";
export const description = "Balas dengan pong";
export async function execute(m, { client }) {
  try {
    await client.sendMessage(m.chat, { text: "Pong!" });
  } catch (error) {
    console.error("Error sending pong message:", error);
  }
}
export default {
  cmd,
  name,
  category,
  description,
  execute,
};
