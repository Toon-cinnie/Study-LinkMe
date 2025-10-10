import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Research = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [research, setResearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      const { data, error } = await supabase
        .from("research")
        .select(`
          *,
          profiles:user_id (full_name, institution)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResearch(data || []);
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

  const filteredResearch = research.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = !fieldFilter || item.field === fieldFilter;
    return matchesSearch && matchesField;
  });

  const uniqueFields = Array.from(new Set(research.map(r => r.field)));

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Research Collaboration
            </h1>
            <p className="text-muted-foreground">
              Discover and collaborate on groundbreaking research
            </p>
          </div>
          <Button
            onClick={() => navigate("/research/new")}
            size="lg"
            className="shadow-primary hover:shadow-glow transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Share Research
          </Button>
        </div>

        <Card className="mb-8 shadow-medium gradient-card border-0 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search research by title or abstract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="px-4 py-2 rounded-md border bg-background"
              >
                <option value="">All Fields</option>
                {uniqueFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredResearch.length === 0 ? (
          <Card className="shadow-medium gradient-card border-0">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No research found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your research!
              </p>
              <Button onClick={() => navigate("/research/new")}>
                Share Research
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResearch.map((item, index) => (
              <Card
                key={item.id}
                className="shadow-medium hover:shadow-large transition-bounce cursor-pointer gradient-card border-0 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/research/${item.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{item.field}</Badge>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>
                    by {item.profiles?.full_name || "Anonymous"} •{" "}
                    {item.profiles?.institution || "Unknown Institution"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {item.abstract}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Research;
