import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Chat from "@/components/Chat";

interface Conversation {
  id: string;
  updated_at: string;
  task_id?: string;
  research_id?: string;
  participants: Array<{
    user_id: string;
    profiles: {
      full_name: string;
    };
  }>;
  messages: Array<{
    content: string;
    created_at: string;
  }>;
}

export default function Chats() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUser(user);
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          updated_at,
          task_id,
          research_id,
          conversation_participants!inner(
            user_id,
            profiles!inner(full_name)
          ),
          messages(content, created_at)
        `)
        .eq("conversation_participants.user_id", currentUser.id)
        .order("updated_at", { ascending: false });

      if (error) {
        toast({
          title: "Error loading conversations",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const normalized = (data || []).map((item: any) => ({
          id: item.id,
          updated_at: item.updated_at,
          task_id: item.task_id,
          research_id: item.research_id,
          participants: item.conversation_participants,
          messages: item.messages || [],
        }));
        setConversations(normalized);
      }
    };

    loadConversations();

    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, toast]);

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl h-screen">
          <Chat
            conversationId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-slideUp">
            Messages
          </h1>
        </div>

        <div className="grid gap-4">
          {conversations.length === 0 ? (
            <Card className="border-white/10 bg-card/50 backdrop-blur animate-fadeIn">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No conversations yet. Start chatting by bidding on tasks or collaborating on research!
                </p>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => {
              const otherParticipants = conversation.participants.filter(
                (p) => p.user_id !== currentUser?.id
              );
              const lastMessage = conversation.messages[0];

              return (
                <Card
                  key={conversation.id}
                  className="border-white/10 bg-card/50 backdrop-blur hover:bg-card/70 transition-all cursor-pointer animate-fadeIn"
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {otherParticipants[0]?.profiles.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-foreground">
                            {otherParticipants.map((p) => p.profiles.full_name).join(", ")}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        {lastMessage && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
