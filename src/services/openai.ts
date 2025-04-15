import axios from "axios";

const API_URL = "http://localhost:3000";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getChatCompletion(messages: Message[]) {
  try {
    const response = await axios.post(`${API_URL}/api/chat`, { messages });
    return response.data.content;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    throw error;
  }
}
