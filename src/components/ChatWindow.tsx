"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      const response = await fetch(
        "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7",
            Connection: "keep-alive",
            "Content-Type": "application/json",
            "x-mastra-dev-playground": "true",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: userMessage.content,
              },
            ],
            runId: "2021016402219817",
            maxRetries: 2,
            maxSteps: 5,
            temperature: 0.5,
            topP: 1,
            runtimeContext: {},
            threadId: "test-2025-mumbai",
            resourceId: "weatherAgent",
          }),
        }
      );

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let agentMessage: Message = {
        id: Date.now() + 1,
        role: "agent",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      let fullResponse = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        for (const line of lines) {
          const match = line.match(/0:\s*\"(.*?)\"/);
          if (match) {
            const text = match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
            fullResponse += text;
            agentMessage.content = fullResponse;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentMessage.id ? { ...msg, content: fullResponse } : msg
              )
            );
          }
        }
        buffer = "";
      }
    } catch (err) {
      console.error("API error:", err);
      setError("⚠️ Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setError(null);
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white w-full max-w-3xl flex flex-col h-[90vh] mx-auto rounded-xl shadow-md">
      <div className="flex justify-between items-center p-4 border-b">
        <input
          type="text"
          placeholder="🔍 Search messages..."
          className="border px-3 py-1 rounded text-sm text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-scroll p-6 space-y-6">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="user-bubble text-black text-base">
                <div className="whitespace-pre-wrap">
                  {msg.content.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="agent-text">
                <div className="whitespace-pre-wrap">
                  {msg.content.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500 italic">Agent is typing...</div>}
        <div ref={messageEndRef} />
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 chat-input mr-3 focus:outline-none focus:ring focus:border-blue-300 text-black text-base"
          disabled={loading || !!error}
        />
        <button
          onClick={handleSend}
          disabled={loading || !!error}
          className="send-button text-lg px-5 py-3"
        >
          <span className="send-arrow">↗</span>
        </button>
        <button
          onClick={handleClear}
          className="ml-3 text-base text-red-500 border border-red-500 px-4 py-3 rounded-md hover:bg-red-100"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
}
