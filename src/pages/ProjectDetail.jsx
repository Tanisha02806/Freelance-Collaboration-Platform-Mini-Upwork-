import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock, Users, DollarSign, Calendar, CheckCircle, ArrowLeft, Send } from "lucide-react";
import MilestoneSection from "@/components/project/MilestoneSection";
import ProposalList from "@/components/project/ProposalList";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [myProposal, setMyProposal] = useState(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [form, setForm] = useState({ cover_letter: "", bid_amount: "", delivery_days: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, u] = await Promise.all([
        base44.entities.Project.filter({ id }),
        base44.auth.me().catch(() => null)
      ]);
      if (p.length > 0) setProject(p[0]);
      if (u) {
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        if (profiles.length > 0) setProfile(profiles[0]);
        const props = await base44.entities.Proposal.filter({ project_id: id });
        setProposals(props);
        const mine = props.find(pr => pr.freelancer_id === u.id);
        if (mine) setMyProposal(mine);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const submitProposal = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setSubmitting(true);
    const created = await base44.entities.Proposal.create({
      project_id: id,
      project_title: project.title,
      freelancer_id: user.id,
      freelancer_name: profile?.display_name || user.full_name,
      cover_letter: form.cover_letter,
      bid_amount: parseFloat(form.bid_amount),
      delivery_days: parseInt(form.delivery_days),
      status: "pending",
      client_id: project.client_id
    });
    await base44.entities.Project.update(id, { proposals_count: (project.proposals_count || 0) + 1 });
    setMyProposal(created);
    setProject(p => ({ ...p, proposals_count: (p.proposals_count || 0) + 1 }));
    setShowProposalForm(false);
    setSubmitting(false);
  };

  const startChat = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const existing = await base44.entities.Conversation.filter({ project_id: id });
    const myConv = existing.find(c => c.participant_ids?.includes(user.id));
    if (myConv) { navigate(`/messages/${myConv.id}`); return; }
    const conv = await base44.entities.Conversation.create({
      participant_ids: [user.id, project.client_id],
      participant_names: [profile?.display_name || user.full_name, project.client_name],
      project_id: id,
      project_title: project.title,
      last_message: "",
      last_message_at: new Date().toISOString()
    });
    navigate(`/messages/${conv.id}`);
  };

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-24 text-muted-foreground">Project not found.</div>;

  const isClient = profile?.role === "client" && user?.id === project.client_id;
  const isFreelancer = profile?.role === "freelancer";
  const canApply = isFreelancer && !myProposal && project.status === "open";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/browse-projects" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="flex items-start justify-between mb-4">
                <Badge className="bg-primary/10 text-primary border-0">{project.category}</Badge>
                <Badge className={`capitalize ${project.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{project.status.replace("_", " ")}</Badge>
              </div>
              <h1 className="text-3xl font-lora font-bold text-foreground mb-4">{project.title}</h1>
              <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {(project.skills_required || []).map(s => <Badge key={s} variant="outline" className="border-border">{s}</Badge>)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="font-bold text-foreground">${project.budget_min}–${project.budget_max}</p>
                  <p className="text-xs text-muted-foreground">Budget</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="font-bold text-foreground">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}</p>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="font-bold text-foreground">{project.proposals_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Proposals</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="font-bold text-foreground">{project.experience_level}</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Proposal Form */}
          {canApply && (
            <div className="bg-white rounded-2xl border border-border p-6">
              {!showProposalForm ? (
                <div className="text-center py-4">
                  <h3 className="font-lora font-semibold text-foreground mb-2">Interested in this project?</h3>
                  <p className="text-muted-foreground text-sm mb-4">Submit a proposal to get started.</p>
                  <Button className="bg-primary gap-2" onClick={() => setShowProposalForm(true)}>
                    <Send className="w-4 h-4" /> Submit Proposal
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="font-lora font-semibold text-foreground mb-4">Your Proposal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Cover Letter</label>
                      <Textarea value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))} placeholder="Introduce yourself and explain why you're the best fit..." rows={5} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Bid Amount (USD)</label>
                        <Input type="number" value={form.bid_amount} onChange={e => setForm(f => ({ ...f, bid_amount: e.target.value }))} placeholder="500" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Delivery (days)</label>
                        <Input type="number" value={form.delivery_days} onChange={e => setForm(f => ({ ...f, delivery_days: e.target.value }))} placeholder="14" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowProposalForm(false)}>Cancel</Button>
                      <Button className="bg-primary flex-1" onClick={submitProposal} disabled={submitting || !form.cover_letter || !form.bid_amount}>
                        {submitting ? "Submitting..." : "Submit Proposal"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {myProposal && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-700">Proposal Submitted</h3>
              </div>
              <p className="text-sm text-green-600">Bid: ${myProposal.bid_amount} · {myProposal.delivery_days} days · Status: <strong className="capitalize">{myProposal.status}</strong></p>
            </div>
          )}

          {/* Milestones */}
          {(isClient || (isFreelancer && project.hired_freelancer_id === user?.id)) && (
            <MilestoneSection projectId={id} project={project} user={user} profile={profile} />
          )}

          {/* Proposals List (client only) */}
          {isClient && <ProposalList proposals={proposals} projectId={id} project={project} onUpdate={(updated) => setProposals(updated)} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-lora font-semibold text-foreground mb-4">About the Client</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {project.client_name?.charAt(0) || "C"}
              </div>
              <div>
                <p className="font-semibold text-foreground">{project.client_name}</p>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
            </div>
            {isFreelancer && user?.id !== project.client_id && (
              <Button className="w-full bg-primary" onClick={startChat}>Message Client</Button>
            )}
          </div>

          {!user && (
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Sign in to Apply</h3>
              <p className="text-sm text-muted-foreground mb-4">Create an account to submit proposals and connect with clients.</p>
              <Button className="w-full bg-primary" onClick={() => base44.auth.redirectToLogin()}>Sign In / Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}