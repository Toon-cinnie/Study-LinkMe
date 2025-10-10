import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  BookOpen, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Briefcase,
      title: "Freelancing Marketplace",
      description: "Post tasks, bid on projects, and earn money helping fellow students with assignments and tutoring.",
    },
    {
      icon: Users,
      title: "Research Collaboration",
      description: "Upload your research, find similar studies, and connect with peers working on related topics.",
    },
    {
      icon: BookOpen,
      title: "Real-time Communication",
      description: "Chat with collaborators, share files, and get AI-powered summaries of your conversations.",
    },
    {
      icon: TrendingUp,
      title: "Earn & Grow",
      description: "Track your earnings, build your portfolio, and gain recognition in the academic community.",
    },
  ];

  const benefits = [
    "Secure escrow payment system",
    "AI-powered research matching",
    "Community forums and leaderboards",
    "University email verification",
    "24/7 chat support",
    "Profile and portfolio showcase",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              StudyLink
            </h1>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Content */}
      <section className="gradient-hero py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-medium text-primary">Learn • Earn • Collaborate</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Academic
            <span className="gradient-primary bg-clip-text text-transparent"> Collaboration Hub</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow students, monetize your skills, collaborate on research, 
            and grow your academic network — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 shadow-primary hover:shadow-large transition-smooth"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 shadow-soft hover:shadow-medium transition-smooth"
              onClick={() => navigate("/tasks")}
            >
              Browse Tasks
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-xl text-muted-foreground">
              A comprehensive platform built for student collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose StudyLink?
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                We provide a secure, feature-rich environment designed specifically 
                for university students to thrive academically and financially.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="shadow-large">
              <CardHeader>
                <CardTitle>Ready to Get Started?</CardTitle>
                <CardDescription>
                  Join thousands of students already collaborating and earning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <span>Create your free account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <span>Complete your profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <span>Start collaborating and earning</span>
                  </div>
                </div>
                <Button 
                  className="w-full shadow-primary"
                  size="lg"
                  onClick={() => navigate("/auth")}
                >
                  Create Account Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 StudyLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
