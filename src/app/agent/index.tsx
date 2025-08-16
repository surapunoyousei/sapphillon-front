import { useState } from "react";
import * as browseros from "@/lib/browseros.ts";
import * as gemini from "@/lib/gemini.ts";
import type { BrowserCommand } from "@/lib/gemini.ts";

type Message = {
  text?: string;
  imageUrl?: string;
  sender: "user" | "agent";
};

export function Agent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Generate browser commands from the user's prompt
      const commands = await gemini.generateBrowserCommands(input);

      // 2. Execute the commands
      let imageDataUrl = "";
      for (const cmd of commands as BrowserCommand[]) {
        switch (cmd.command) {
          case "openUrl":
            await browseros.openUrl(cmd.url);
            break;
          case "search":
            await browseros.search(cmd.query);
            break;
          case "clickElement":
            await browseros.clickElement(cmd.selector);
            break;
          case "takeScreenshot":
            imageDataUrl = await browseros.takeScreenshot();
            // Add the screenshot to the chat
            const screenshotMessage: Message = {
              text: "この画像を解析します...",
              imageUrl: imageDataUrl,
              sender: "agent",
            };
            setMessages((prev) => [...prev, screenshotMessage]);
            break;
          case "wait":
            await browseros.wait(cmd.ms);
            break;
        }
      }

      // 3. Generate the final response
      if (imageDataUrl) {
        const finalResponse = await gemini.generateFinalResponse(
          input,
          imageDataUrl,
        );
        const agentMessage: Message = { text: finalResponse, sender: "agent" };
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        // Handle cases where no screenshot was taken but the flow finished.
        const agentMessage: Message = {
          text: "操作が完了しましたが、解析する情報がありませんでした。",
          sender: "agent",
        };
        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error("Error processing agent command:", error);
      const errorMessage: Message = {
        text: "エラーが発生しました。処理を完了できませんでした。",
        sender: "agent",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Placeholder for messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              // @ts-ignore
              className={`chat ${
                msg.sender === "user" ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-bubble">
                {msg.text}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Agent Screenshot"
                    className="mt-2 rounded-lg max-w-sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-base-300">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={isLoading
              ? "エージェントが処理中です..."
              : "エージェントに指示を出す..."}
            className="input input-bordered w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            className={`btn btn-primary ${isLoading ? "btn-disabled" : ""}`}
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            {isLoading
              ? <span className="loading loading-spinner"></span>
              : "送信"}
          </button>
        </div>
      </div>
    </div>
  );
}
