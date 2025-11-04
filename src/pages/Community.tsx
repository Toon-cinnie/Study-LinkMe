import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Users, Trophy, Plus, ThumbsUp } from "lucide-react";

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsData, groupsData, leaderboardData] = await Promise.all([
        supabase.from('community_posts').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('study_groups').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('leaderboard_entries').select('*, profiles(full_name)').eq('period', 'weekly').order('score', { ascending: false }).limit(10)
      ]);

      if (postsData.data) setPosts(postsData.data);
      if (groupsData.data) setStudyGroups(groupsData.data);
      if (leaderboardData.data) setLeaderboard(leaderboardData.data);
    } catch (error: any) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('community_posts').insert([{
        user_id: user.id,
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        category: formData.get('category') as string,
      }]);

      if (error) throw error;

      toast({ title: "Success", description: "Post created successfully!" });
      setNewPostOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: group, error } = await supabase.from('study_groups').insert([{
        creator_id: user.id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
      }]).select().single();

      if (error) throw error;

      // Add creator as first member
      await supabase.from('study_group_members').insert([{
        group_id: group.id,
        user_id: user.id,
      }]);

      toast({ title: "Success", description: "Study group created!" });
      setNewGroupOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already a member
      const { data: existing } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        toast({ title: "Already a member", description: "You're already part of this group!" });
        return;
      }

      // Join the group
      const { error } = await supabase.from('study_group_members').insert([{
        group_id: groupId,
        user_id: user.id,
      }]);

      if (error) throw error;

      // Update member count manually
      const { data: groupData } = await supabase
        .from('study_groups')
        .select('member_count')
        .eq('id', groupId)
        .single();

      if (groupData) {
        await supabase
          .from('study_groups')
          .update({ member_count: groupData.member_count + 1 })
          .eq('id', groupId);
      }

      toast({ title: "Success", description: "You've joined the study group!" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")} 
            className="mb-2 transition-smooth hover:bg-accent/10"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Connect, Learn, and Compete</p>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <Tabs defaultValue="discussions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="discussions" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5 transition-smooth">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Discussions</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5 transition-smooth">
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5 transition-smooth">
              <Trophy className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4 mt-4 sm:mt-6 animate-fade-in">
            <div className="flex justify-end">
              <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-soft hover:shadow-medium transition-smooth">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">New Post</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>Share your thoughts with the community</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <Input name="title" placeholder="Post title" required />
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="help">Help</SelectItem>
                        <SelectItem value="resources">Resources</SelectItem>
                        <SelectItem value="opportunities">Opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea name="content" placeholder="Write your post..." rows={5} required />
                    <Button type="submit" className="w-full">Create Post</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {posts.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="shadow-soft hover:shadow-medium transition-smooth animate-slide-up">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl truncate">{post.title}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            by {post.profiles?.full_name || 'Anonymous'} • {new Date(post.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className="self-start">{post.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="transition-smooth hover:bg-accent/10">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">{post.upvotes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="transition-smooth hover:bg-accent/10">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Reply</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4 mt-4 sm:mt-6 animate-fade-in">
            <div className="flex justify-end">
              <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-soft hover:shadow-medium transition-smooth">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Create Group</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Study Group</DialogTitle>
                    <DialogDescription>Start a new study group</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <Input name="name" placeholder="Group name" required />
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea name="description" placeholder="Group description..." rows={4} required />
                    <Button type="submit" className="w-full">Create Group</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studyGroups.length === 0 ? (
                <Card className="shadow-soft sm:col-span-2 lg:col-span-3">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No study groups yet. Create one to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                studyGroups.map((group) => (
                  <Card key={group.id} className="shadow-soft hover:shadow-medium transition-smooth animate-slide-up flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg sm:text-xl">{group.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{group.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{group.description}</p>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t">
                        <span className="text-xs sm:text-sm text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinGroup(group.id)}
                          className="shadow-soft hover:shadow-medium transition-smooth text-xs sm:text-sm"
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4 sm:mt-6 animate-fade-in">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Weekly Leaderboard</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Top contributors this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No leaderboard data yet. Start contributing!</p>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <div 
                        key={entry.id} 
                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-smooth animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm flex-shrink-0 ${
                            index === 0 ? 'bg-gradient-primary text-white shadow-primary' :
                            index === 1 ? 'bg-gradient-secondary text-white' :
                            index === 2 ? 'bg-accent text-white' :
                            'bg-primary text-primary-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">{entry.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{entry.category}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs sm:text-sm ml-2 flex-shrink-0">
                          {entry.score} pts
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;