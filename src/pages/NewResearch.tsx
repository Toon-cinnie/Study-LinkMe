import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";

const NewResearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    field: "",
    tags: "",
    document_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("research").insert({
        user_id: user.id,
        title: formData.title,
        abstract: formData.abstract,
        field: formData.field,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        document_url: formData.document_url || null,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your research has been shared",
      });
      navigate("/research");
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

        <Card className="max-w-3xl mx-auto shadow-large gradient-card border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Share Your Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Research Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your research title"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="field">Field of Study *</Label>
                <Input
                  id="field"
                  required
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  placeholder="e.g., Computer Science, Biology, Psychology"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea
                  id="abstract"
                  required
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Provide a brief summary of your research..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="machine learning, neural networks, AI"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="document_url">Document URL (optional)</Label>
                <Input
                  id="document_url"
                  type="url"
                  value={formData.document_url}
                  onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-2"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/research")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 shadow-primary hover:shadow-glow transition-all"
                >
                  {loading ? "Sharing..." : "Share Research"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewResearch;
