import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Rocket, Users, Zap, Trophy, ArrowRight, Code2, Briefcase } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Share Projects',
    description: 'Showcase your work, get feedback, and find collaborators for your next big idea.',
  },
  {
    icon: Trophy,
    title: 'Discover Hackathons',
    description: 'Find exciting hackathons, form teams, and compete for prizes and recognition.',
  },
  {
    icon: Briefcase,
    title: 'Land Internships',
    description: 'Connect with companies looking for talented students like you.',
  },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Projects' },
  { value: '100+', label: 'Companies' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-8"
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">The platform for ambitious students</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Build. Connect.{' '}
              <span className="text-transparent bg-clip-text gradient-primary">
                Succeed.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              MiniHub is where students share projects, discover hackathons, 
              and find internship opportunities that launch careers.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 text-lg px-8"
                  asChild
                >
                  <Link to="/feed">
                    Explore Feed
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 text-lg px-8"
                    asChild
                  >
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-white/10 text-lg px-8"
                    asChild
                  >
                    <Link to="/feed">
                      Browse Feed
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to{' '}
              <span className="text-primary">grow</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              One platform to showcase your work, connect with peers, and discover opportunities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl gradient-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-primary font-medium">Join our community</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to launch your journey?
            </h2>
            <p className="text-gray-300 mb-10 text-lg">
              Join thousands of students building, learning, and growing together.
            </p>
            <Button 
              size="lg" 
              className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 text-lg px-10"
              asChild
            >
              <Link to="/register">
                Start Building Today
                <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Rocket className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">MiniHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MiniHub. Built for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
