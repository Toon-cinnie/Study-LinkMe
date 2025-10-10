import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, ExternalLink, Send } from "lucide-react";

const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [research, setResearch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResearch();
    getCurrentUser();
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchResearch = async () => {
    try {
      const { data, error } = await supabase
        .from("research")
        .select(`
          *,
          profiles:user_id (id, full_name, institution, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setResearch(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollaborationRequest = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request collaboration",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please provide a message with your collaboration request",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("research_collaborations").insert({
        research_id: id,
        requester_id: currentUser.id,
        message: message,
      });

      if (error) throw error;

      toast({
        title: "Request sent!",
        description: "The researcher will be notified of your collaboration request",
      });
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="shadow-large gradient-card border-0">
          <CardContent className="py-12 text-center">
            <p className="text-xl text-muted-foreground">Research not found</p>
            <Button onClick={() => navigate("/research")} className="mt-4">
              Back to Research
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnResearch = currentUser?.id === research.user_id;

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/research")}
          className="mb-6 animate-slide-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Research
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-large gradient-card border-0 animate-slide-up">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {research.field}
                  </Badge>
                </div>
                <CardTitle className="text-4xl bg-gradient-primary bg-clip-text text-transparent">
                  {research.title}
                </CardTitle>
                <p className="text-muted-foreground text-lg mt-2">
                  by {research.profiles?.full_name || "Anonymous"} •{" "}
                  {research.profiles?.institution || "Unknown Institution"}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Abstract</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {research.abstract}
                  </p>
                </div>

                {research.tags && research.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {research.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {research.document_url && (
                  <div>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => window.open(research.document_url, "_blank")}
                    >
                      View Full Document
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {!isOwnResearch && (
              <Card className="shadow-large gradient-card border-0 animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Request Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you'd like to collaborate..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleCollaborationRequest}
                    disabled={submitting}
                    className="w-full shadow-primary hover:shadow-glow transition-all"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Sending..." : "Send Request"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-medium gradient-card border-0 animate-slide-up">
              <CardHeader>
                <CardTitle>Researcher Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{research.profiles?.full_name || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{research.profiles?.institution || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{research.profiles?.email || "Not public"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchDetail;
