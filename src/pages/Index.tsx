import { Link } from "react-router-dom";
import { AlertTriangle, Shield, Camera, MapPin, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Camera,
    title: "Upload or Capture",
    description: "Take a photo or upload an image of the accident scene instantly.",
  },
  {
    icon: Brain,
    title: "AI Detection",
    description: "Our CNN model analyzes the image with 91.2% accuracy to verify accidents.",
  },
  {
    icon: MapPin,
    title: "Auto Location",
    description: "GPS coordinates and timestamps are captured automatically.",
  },
  {
    icon: Shield,
    title: "Instant Dispatch",
    description: "Verified reports are dispatched to the admin dashboard immediately.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">AI-Powered Accident Detection</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="text-foreground">TrafficAuto</span>
              <span className="text-gradient">Dispatcher</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Smart Accident Reporting System
            </p>
            <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-10">
              Upload an image, share your location, and let our AI verify the accident.
              Reports are automatically dispatched to emergency responders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25">
                <Link to="/report">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report an Accident
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-border hover:bg-secondary">
                <Link to="/admin/login">
                  <Shield className="w-5 h-5 mr-2" />
                  Admin Login
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
            Report accidents in seconds with our AI-powered system
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card-hover rounded-xl p-6 text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 TrafficAutoDispatcher. AI-powered accident reporting system.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
