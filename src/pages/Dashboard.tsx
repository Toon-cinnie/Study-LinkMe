import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Users, 
  BookOpen, 
  TrendingUp,
  LogOut,
  GraduationCap,
  MessageCircle,
  User as UserIcon
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/studylink-logo.png" 
              alt="StudyLink" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              StudyLink
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || user?.email}!
          </h2>
          <p className="text-muted-foreground">
            Here's your academic collaboration hub
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No active projects yet
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collaborations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No collaborations yet
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No papers uploaded
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 0</div>
              <p className="text-xs text-muted-foreground">
                Start earning today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Post tasks and share research</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button 
                className="h-16 flex items-center justify-start gap-4 shadow-soft hover:shadow-primary transition-smooth"
                onClick={() => navigate("/tasks/new")}
              >
                <Briefcase className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Post a Task</div>
                  <div className="text-xs opacity-90">Get help with assignments</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex items-center justify-start gap-4 shadow-soft hover:shadow-medium transition-smooth"
                onClick={() => navigate("/research/new")}
              >
                <BookOpen className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Upload Research</div>
                  <div className="text-xs opacity-90">Share your work</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Explore</CardTitle>
              <CardDescription>Connect and collaborate</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex items-center justify-start gap-4 shadow-soft hover:shadow-medium transition-smooth"
                onClick={() => navigate("/tasks")}
              >
                <Briefcase className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Browse Tasks</div>
                  <div className="text-xs opacity-90">Find freelance work</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex items-center justify-start gap-4 shadow-soft hover:shadow-medium transition-smooth"
                onClick={() => navigate("/research")}
              >
                <Users className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Find Collaborators</div>
                  <div className="text-xs opacity-90">Connect with researchers</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card 
            className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer"
            onClick={() => navigate("/chats")}
          >
            <CardContent className="pt-6">
              <MessageCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Messages</h3>
              <p className="text-sm text-muted-foreground">Chat with collaborators and clients</p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer"
            onClick={() => navigate("/community")}
          >
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Community Hub</h3>
              <p className="text-sm text-muted-foreground">Join discussions and study groups</p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <CardContent className="pt-6">
              <UserIcon className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Your Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your portfolio and skills</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;