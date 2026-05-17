import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Briefcase, FileText, CheckSquare, Star, ArrowRight, Clock } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length === 0) { navigate("/onboarding"); return; }
      const p = profiles[0];
      setProfile(p);

      if (p.role === "client") {
        const [projs, ms] = await Promise.all([
          base44.entities.Project.filter({ client_id: u.id }, "-created_date", 10),
          base44.entities.Milestone.filter({ client_id: u.id }, "-created_date", 10)
        ]);
        setProjects(projs);
        setMilestones(ms);
      } else {
        const [props, ms] = await Promise.all([
          base44.entities.Proposal.filter({ freelancer_id: u.id }, "-created_date", 10),
          base44.entities.Milestone.filter({ freelancer_id: u.id }, "-created_date", 10)
        ]);
        setProposals(props);
        setMilestones(ms);
      }
      setLoading(false);
    }).catch(() => navigate("/"));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const isClient = profile?.role === "client";
  const activeProjects = projects.filter(p => ["open", "in_progress"].includes(p.status));
  const completedProjects = projects.filter(p => p.status === "completed");
  const pendingProposals = proposals.filter(p => p.status === "pending");
  const acceptedProposals = proposals.filter(p => p.status === "accepted");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
          <h1 className="text-3xl font-lora font-bold text-foreground">{profile?.display_name || user?.full_name}</h1>
          <Badge className="mt-2 bg-primary/10 text-primary border-0 capitalize">{profile?.role}</Badge>
        </div>
        {isClient ? (
          <Link to="/post-project"><Button className="bg-primary gap-2"><Plus className="w-4 h-4" /> Post a Project</Button></Link>
        ) : (
          <Link to="/browse-projects"><Button className="bg-primary gap-2"><Briefcase className="w-4 h-4" /> Find Work</Button></Link>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {isClient ? [
          { label: "Active Projects", value: activeProjects.length, icon: Briefcase, color: "text-primary" },
          { label: "Completed", value: completedProjects.length, icon: CheckSquare, color: "text-green-600" },
          { label: "Milestones", value: milestones.length, icon: CheckSquare, color: "text-accent-foreground" },
          { label: "Open Projects", value: projects.filter(p => p.status === "open").length, icon: Clock, color: "text-blue-600" },
        ] : [
          { label: "Proposals Sent", value: proposals.length, icon: FileText, color: "text-primary" },
          { label: "Active Projects", value: acceptedProposals.length, icon: Briefcase, color: "text-green-600" },
          { label: "Milestones", value: milestones.length, icon: CheckSquare, color: "text-accent-foreground" },
          { label: "Pending", value: pendingProposals.length, icon: Clock, color: "text-blue-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
                <div className="text-2xl font-lora font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {isClient ? (
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="font-lora text-lg">My Projects</CardTitle>
                <Link to="/post-project"><Button variant="ghost" size="sm" className="text-primary gap-1">New <Plus className="w-3 h-3" /></Button></Link>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="mb-4">No projects yet.</p>
                    <Link to="/post-project"><Button size="sm" className="bg-primary">Post Your First Project</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map(p => (
                      <Link key={p.id} to={`/project/${p.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.proposals_count || 0} proposals · ${p.budget_min}–${p.budget_max}</p>
                          </div>
                          <Badge className={`ml-3 text-xs capitalize ${p.status === "open" ? "bg-green-100 text-green-700" : p.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{p.status.replace("_", " ")}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="font-lora text-lg">My Proposals</CardTitle>
                <Link to="/browse-projects"><Button variant="ghost" size="sm" className="text-primary gap-1">Browse <ArrowRight className="w-3 h-3" /></Button></Link>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="mb-4">No proposals yet.</p>
                    <Link to="/browse-projects"><Button size="sm" className="bg-primary">Browse Projects</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proposals.slice(0, 5).map(p => (
                      <Link key={p.id} to={`/project/${p.project_id}`}>
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{p.project_title}</p>
                            <p className="text-xs text-muted-foreground">Bid: ${p.bid_amount} · {p.delivery_days} days</p>
                          </div>
                          <Badge className={`ml-3 text-xs capitalize ${p.status === "accepted" ? "bg-green-100 text-green-700" : p.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-lora text-lg">Recent Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No milestones yet.</p>
              ) : (
                <div className="space-y-3">
                  {milestones.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground">${m.amount}</p>
                      </div>
                      <Badge className={`text-xs capitalize ${m.status === "approved" ? "bg-green-100 text-green-700" : m.status === "submitted" ? "bg-blue-100 text-blue-700" : m.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-lora text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/messages"><Button variant="outline" className="w-full justify-start gap-2 text-sm">💬 Messages</Button></Link>
              <Link to="/profile"><Button variant="outline" className="w-full justify-start gap-2 text-sm">👤 My Profile</Button></Link>
              {isClient && <Link to="/browse-projects"><Button variant="outline" className="w-full justify-start gap-2 text-sm">🔍 Browse Freelancers</Button></Link>}
              {!isClient && <Link to="/browse-projects"><Button variant="outline" className="w-full justify-start gap-2 text-sm">💼 Find Projects</Button></Link>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}