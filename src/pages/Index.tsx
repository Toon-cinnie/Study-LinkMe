import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, Award, Sparkles, TrendingUp, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import studylinkLogo from "@/assets/studylink-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-hero py-24 px-4 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8 animate-slide-up">
            <img src={studylinkLogo} alt="StudyLink" className="w-32 h-32 drop-shadow-2xl" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 animate-fade-in bg-gradient-primary bg-clip-text text-transparent">
            Learn, Earn, Collaborate
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl mx-auto animate-slide-up font-medium">
            Join thousands of students monetizing their skills and collaborating on groundbreaking research
          </p>
          <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className="shadow-primary hover:shadow-glow transition-all hover:scale-105" onClick={() => navigate("/auth")}>
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:border-primary hover:shadow-medium transition-all hover:scale-105" onClick={() => navigate("/tasks")}>
              Browse Opportunities
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Why Choose StudyLink?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed academically and financially
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-medium hover:shadow-large transition-bounce hover:-translate-y-2 gradient-card border-0">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Earn Money</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Turn your expertise into income by helping fellow students
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-large transition-bounce hover:-translate-y-2 gradient-card border-0">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-secondary/10 mb-6">
                  <BookOpen className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Get Expert Help</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access skilled peers for assignments, tutoring, and projects
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-large transition-bounce hover:-translate-y-2 gradient-card border-0">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-6">
                  <Users className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Collaborate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Team up with researchers sharing your academic interests
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-large transition-bounce hover:-translate-y-2 gradient-card border-0">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Build Portfolio</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Showcase achievements and grow your academic reputation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-4 gradient-hero">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="animate-slide-up">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">10k+</h3>
              <p className="text-muted-foreground text-lg">Active Students</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-center mb-4">
                <MessageCircle className="h-12 w-12 text-secondary" />
              </div>
              <h3 className="text-4xl font-bold mb-2">50k+</h3>
              <p className="text-muted-foreground text-lg">Tasks Completed</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-center mb-4">
                <Sparkles className="h-12 w-12 text-accent" />
              </div>
              <h3 className="text-4xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground text-lg">Research Collaborations</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="shadow-large gradient-card border-0 p-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Ready to Transform Your Academic Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our thriving community today and unlock your potential
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="shadow-primary hover:shadow-glow transition-all text-lg px-8" onClick={() => navigate("/auth")}>
                <Sparkles className="mr-2 h-5 w-5" />
                Start for Free
              </Button>
              <Button size="lg" variant="outline" className="border-2 text-lg px-8" onClick={() => navigate("/research")}>
                Explore Research
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
