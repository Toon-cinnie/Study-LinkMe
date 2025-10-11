import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: {
    full_name: string;
  };
}

interface ChatProps {
  conversationId: string;
  onBack?: () => void;
}

export default function Chat({ conversationId, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          title: "Error loading messages",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setMessages(data || []);
      }
    };

    loadMessages();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data: newMsg } = await supabase
            .from("messages")
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(full_name)
            `)
            .eq("id", payload.new.id)
            .single();

          if (newMsg) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, toast]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    setIsLoading(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-secondary/30">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <h2 className="text-xl font-bold text-foreground">Chat</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                    {message.sender?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[70%] ${
                    isOwn ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-2xl ${
                      isOwn
                        ? "bg-gradient-to-br from-primary to-accent text-white"
                        : "bg-card border border-white/10"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {message.sender?.full_name}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10 bg-secondary/30">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 bg-background/50 border-white/10"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
