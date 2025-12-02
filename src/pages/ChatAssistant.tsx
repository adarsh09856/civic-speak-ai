import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  Paperclip, 
  Sparkles,
  Loader2
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "नमस्ते! 🙏 I'm your JanConnect+ AI Assistant. I can help you:\n\n• Submit a new complaint in any language\n• Track your existing complaints\n• Get information about departments\n• Answer questions about civic services\n\nHow can I assist you today?",
    timestamp: new Date(),
  },
];

const quickActions = [
  "Report a road pothole",
  "Check water supply issue",
  "Report streetlight problem",
  "Track my complaint",
];

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      default: `I understand you're concerned about "${userMessage}". Let me help you with that.\n\nBased on your description, this appears to be related to civic infrastructure. Would you like me to:\n\n1. Create a formal complaint for you\n2. Check if similar complaints exist in your area\n3. Connect you with the relevant department\n\nJust let me know how you'd like to proceed!`,
      pothole: "I can help you report the road pothole. 🛣️\n\n**AI Analysis:**\n• Category: Road & Transport\n• Priority: Estimated HIGH (safety concern)\n\nTo file this complaint, I'll need:\n1. Exact location (or enable GPS)\n2. Brief description of the damage\n3. Photo if available\n\nWould you like to proceed with filing this complaint?",
      water: "I'll help you report the water supply issue. 💧\n\n**Quick Questions:**\n1. Is this about no water supply or contaminated water?\n2. How long has this been happening?\n3. Is it affecting your area only or the entire locality?\n\nOnce you provide these details, I'll classify and route your complaint to the appropriate water department.",
      streetlight: "Let me help you report the streetlight problem. 💡\n\n**AI Pre-Analysis:**\n• Category: Electricity/Municipal\n• Typical Resolution: 3-5 days\n\nPlease provide:\n1. Location (landmark or GPS)\n2. Number of lights affected\n3. Is it completely off or flickering?\n\nI'll create a HIGH priority complaint as this is a safety concern.",
      track: "To track your complaint, please share your **Complaint ID** (format: JC-YYYY-XXXXX).\n\nAlternatively, I can search by:\n• Your registered phone number\n• Your email address\n\nWhich would you prefer?",
    };

    let response = responses.default;
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("pothole") || lowerMessage.includes("road")) {
      response = responses.pothole;
    } else if (lowerMessage.includes("water")) {
      response = responses.water;
    } else if (lowerMessage.includes("streetlight") || lowerMessage.includes("light")) {
      response = responses.streetlight;
    } else if (lowerMessage.includes("track")) {
      response = responses.track;
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    await simulateResponse(userInput);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">JanConnect+ AI Assistant</h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">Online • Multilingual Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-3xl">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 mb-6 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      message.role === "assistant"
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "assistant"
                        ? "bg-card border border-border"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "assistant"
                          ? "text-muted-foreground"
                          : "text-primary-foreground/70"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-6"
              >
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="border-t border-border bg-card/50">
            <div className="container mx-auto px-4 py-4 max-w-3xl">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="rounded-full"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <div className="container mx-auto px-4 py-4 max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                <Mic className="w-5 h-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message in any language..."
                className="flex-1 h-12 rounded-xl"
              />
              <Button type="submit" size="icon" className="flex-shrink-0 h-12 w-12 rounded-xl">
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">
              JanConnect+ AI supports Hindi, English, and 10+ regional languages
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
