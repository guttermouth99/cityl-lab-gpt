import { ChatInterface } from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="mb-2 font-bold text-3xl">CityLAB Berlin Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about CityLAB Berlin, its projects like BärGPT, Parla,
          Fairgnügen, and more.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
