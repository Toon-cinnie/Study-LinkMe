import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  MapPin, 
  Star, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter,
  Edit,
  Briefcase,
  Award
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  institution?: string;
  major?: string;
  year_of_study?: number;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  skills?: Array<{ name: string }>;
  reviews?: Array<{
    rating: number;
    comment: string;
    reviewer: { full_name: string };
    created_at: string;
  }>;
  portfolio?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    created_at: string;
  }>;
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const profileId = id || user?.id;
      if (!profileId) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_skills(skill:skills(name)),
          reviews:reviews!reviews_reviewee_id_fkey(
            rating,
            comment,
            created_at,
            reviewer:profiles!reviews_reviewer_id_fkey(full_name)
          ),
          portfolio:portfolio_items(id, title, description, category, created_at)
        `)
        .eq("id", profileId)
        .single();

      if (profileError) {
        toast({
          title: "Error loading profile",
          description: profileError.message,
          variant: "destructive",
        });
      } else {
        setProfile({
          ...profileData,
          skills: profileData.user_skills?.map((us: any) => us.skill) || [],
        });
      }
      setLoading(false);
    };

    loadData();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profile.id;
  const avgRating = profile.reviews?.length 
    ? (profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Profile
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-white/10 bg-card/50 backdrop-blur animate-fadeIn">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 border-4 border-primary/20 mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-3xl">
                      {profile.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {profile.full_name}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl font-bold">{avgRating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({profile.reviews?.length || 0} reviews)
                    </span>
                  </div>

                  {isOwnProfile && (
                    <Button
                      onClick={() => navigate("/profile/edit")}
                      className="w-full bg-gradient-to-r from-primary to-accent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {profile.institution && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{profile.institution}</p>
                        {profile.major && (
                          <p className="text-xs text-muted-foreground">{profile.major}</p>
                        )}
                        {profile.year_of_study && (
                          <p className="text-xs text-muted-foreground">
                            Year {profile.year_of_study}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}

                  {/* Social Links */}
                  <div className="flex gap-2 pt-4">
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {profile.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card className="border-white/10 bg-card/50 backdrop-blur animate-fadeIn">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Portfolio & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio */}
            <Card className="border-white/10 bg-card/50 backdrop-blur animate-fadeIn">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.portfolio && profile.portfolio.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {profile.portfolio.map((item) => (
                      <Card key={item.id} className="border-white/5 bg-secondary/20">
                        <CardContent className="p-4">
                          <Badge className="mb-2" variant="secondary">
                            {item.category}
                          </Badge>
                          <h3 className="font-semibold text-foreground mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No portfolio items yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-white/10 bg-card/50 backdrop-blur animate-fadeIn">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.reviews && profile.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {profile.reviews.map((review, index) => (
                      <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {review.reviewer.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
