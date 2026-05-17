import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/api";
import { motion } from "framer-motion";
import { Search, Star, ArrowRight, Briefcase, Users, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { label: "Active Freelancers", value: "12,000+", icon: Users },
  { label: "Projects Completed", value: "48,000+", icon: CheckCircle },
  { label: "Client Satisfaction", value: "98%", icon: TrendingUp },
  { label: "Categories", value: "50+", icon: Briefcase },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Startup Founder", text: "Found an incredible developer in 2 days. The milestone system kept everything on track.", rating: 5, avatar: "SM" },
  { name: "James K.", role: "Full-Stack Developer", text: "Best platform I've used. Clients are serious, payments are fast, and the chat is seamless.", rating: 5, avatar: "JK" },
  { name: "Aisha T.", role: "Product Manager", text: "The proposal system filters out noise. I only hear from freelancers who truly understand my project.", rating: 5, avatar: "AT" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    base44.entities.Project.filter({ status: "open" }, "-created_date", 6).then(setProjects).catch(() => {});
    base44.entities.FreelancerProfile.list("-avg_rating", 6).then(setFreelancers).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/browse-projects?q=${encodeURIComponent(search)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F0E8] via-[#FAF9F6] to-[#EDF5EC] py-24 px-4">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 bg-accent/20 text-accent-foreground border-accent/30 text-sm px-4 py-1.5 font-inter">
              🌱 The Marketplace Built on Trust
            </Badge>
            <h1 className="text-5xl md:text-6xl font-lora font-bold text-foreground mb-6 leading-tight">
              Find the perfect <span className="text-primary">freelancer</span> for your next project
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-inter font-light">
              Connect with skilled professionals, collaborate seamlessly, and bring your ideas to life — on budget and on time.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects or skills..."
                  className="pl-12 h-14 text-base bg-white border-border shadow-sm rounded-xl"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 rounded-xl text-base font-semibold">
                Search
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {["React", "UI Design", "Node.js", "Content Writing", "Python", "Figma"].map(tag => (
                <Link key={tag} to={`/browse-projects?q=${tag}`}>
                  <Badge variant="outline" className="text-sm px-3 py-1 cursor-pointer hover:bg-primary hover:text-white transition-colors border-border bg-white/80">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-border">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl font-lora font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground font-inter">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-2">Open Opportunities</p>
              <h2 className="text-3xl font-lora font-bold text-foreground">Featured Projects</h2>
            </div>
            <Link to="/browse-projects">
              <Button variant="ghost" className="text-primary font-semibold gap-2">Browse All <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={`/project/${p.id}`}>
                  <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{p.category}</Badge>
                      <span className="text-xs text-muted-foreground">{p.proposals_count || 0} proposals</span>
                    </div>
                    <h3 className="font-lora font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(p.skills_required || []).slice(0, 3).map(s => (
                        <Badge key={s} variant="outline" className="text-xs border-border">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-semibold text-foreground">${p.budget_min}–${p.budget_max}</span>
                      <Badge className="bg-accent/10 text-accent-foreground border-0 text-xs">{p.experience_level}</Badge>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No projects yet. <Link to="/post-project" className="text-primary underline">Post the first one!</Link></p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Freelancers */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-2">Top Talent</p>
              <h2 className="text-3xl font-lora font-bold text-foreground">Featured Freelancers</h2>
            </div>
            <Link to="/find-freelancers">
              <Button variant="ghost" className="text-primary font-semibold gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.slice(0, 6).map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={`/freelancer/${f.id}`}>
                  <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-lora font-bold text-primary">
                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full rounded-full object-cover" /> : f.display_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{f.display_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{f.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(f.skills || []).slice(0, 3).map(s => (
                        <Badge key={s} variant="outline" className="text-xs border-border">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-sm font-semibold">{(f.avg_rating || 0).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({f.total_reviews || 0})</span>
                      </div>
                      <span className="font-semibold text-foreground">${f.hourly_rate}/hr</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {freelancers.length === 0 && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No freelancers yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-2">Success Stories</p>
            <h2 className="text-3xl font-lora font-bold text-foreground">What people are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="bg-secondary/40 rounded-2xl border border-border p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                  </div>
                  <p className="text-foreground mb-6 font-inter leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{t.avatar}</div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-lora font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-white/80 text-lg mb-8 font-inter">Join thousands of clients and freelancers building great things together.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/post-project"><Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 font-semibold">Post a Project</Button></Link>
            <Link to="/find-freelancers"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 font-semibold">Find Freelancers</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}