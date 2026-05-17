import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, ChevronRight } from "lucide-react";

const SKILL_OPTIONS = ["React", "Node.js", "Python", "UI/UX Design", "Figma", "TypeScript", "Vue.js", "AWS", "Content Writing", "SEO", "Mobile Dev", "Data Science"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ display_name: "", title: "", bio: "", hourly_rate: "", skills: [], location: "", availability: "available" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, display_name: u.full_name || "" }));
    }).catch(() => navigate("/"));
  }, []);

  const toggleSkill = (s) => {
    setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await base44.entities.UserProfile.create({ user_id: user.id, role, display_name: form.display_name, onboarding_completed: true });
    if (role === "freelancer") {
      await base44.entities.FreelancerProfile.create({
        user_id: user.id, user_email: user.email,
        display_name: form.display_name, title: form.title, bio: form.bio,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        skills: form.skills, location: form.location, availability: form.availability,
        avg_rating: 0, total_reviews: 0, completed_projects: 0
      });
    }
    setSaving(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#FAF9F6] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-border p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">FF</span></div>
          <span className="font-lora font-bold text-foreground">FreelanceFlow</span>
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-lora font-bold text-foreground mb-2">Welcome! How will you use FreelanceFlow?</h1>
            <p className="text-muted-foreground mb-8">Choose your role to get started with the right experience.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { val: "client", icon: Briefcase, title: "I'm a Client", desc: "I need to hire talented freelancers for my projects" },
                { val: "freelancer", icon: User, title: "I'm a Freelancer", desc: "I want to offer my skills and find exciting work" }
              ].map(opt => (
                <button key={opt.val} onClick={() => setRole(opt.val)} className={`p-6 rounded-2xl border-2 text-left transition-all ${role === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  <opt.icon className={`w-8 h-8 mb-3 ${role === opt.val ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold text-foreground mb-1">{opt.title}</h3>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
            <Button className="w-full bg-primary" disabled={!role} onClick={() => setStep(2)}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-lora font-bold text-foreground mb-2">Set up your profile</h1>
            <p className="text-muted-foreground mb-6">Tell us a bit about yourself.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
                <Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Your full name" />
              </div>
              {role === "freelancer" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Professional Title</label>
                    <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Full-Stack Developer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
                    <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell clients about your experience..." rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Hourly Rate (USD)</label>
                    <Input type="number" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} placeholder="50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                    <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map(s => (
                        <Badge key={s} onClick={() => toggleSkill(s)} className={`cursor-pointer transition-all ${form.skills.includes(s) ? "bg-primary text-white" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 bg-primary" onClick={handleSubmit} disabled={saving || !form.display_name}>
                {saving ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}