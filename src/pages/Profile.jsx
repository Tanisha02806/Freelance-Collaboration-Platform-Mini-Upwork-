import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, X, Plus } from "lucide-react";

const SKILL_OPTIONS = ["React", "Node.js", "Python", "UI/UX Design", "Figma", "TypeScript", "Vue.js", "AWS", "Content Writing", "SEO", "Mobile Dev", "Data Science"];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [freelancerProfile, setFreelancerProfile] = useState(null);
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length === 0) { navigate("/onboarding"); return; }
      setUserProfile(profiles[0]);
      if (profiles[0].role === "freelancer") {
        const fps = await base44.entities.FreelancerProfile.filter({ user_id: u.id });
        if (fps.length > 0) {
          setFreelancerProfile(fps[0]);
          setForm(fps[0]);
        }
      } else {
        setForm({ display_name: profiles[0].display_name });
      }
    }).catch(() => navigate("/"));
  }, []);

  const toggleSkill = (s) => setForm(f => ({ ...f, skills: (f.skills || []).includes(s) ? (f.skills || []).filter(x => x !== s) : [...(f.skills || []), s] }));
  const addSkill = (s) => { if (s && !(form.skills || []).includes(s)) { setForm(f => ({ ...f, skills: [...(f.skills || []), s] })); setSkillInput(""); } };
  const removeSkill = (s) => setForm(f => ({ ...f, skills: (f.skills || []).filter(x => x !== s) }));

  const save = async () => {
    setSaving(true);
    await base44.entities.UserProfile.update(userProfile.id, { display_name: form.display_name });
    if (userProfile.role === "freelancer" && freelancerProfile) {
      await base44.entities.FreelancerProfile.update(freelancerProfile.id, {
        display_name: form.display_name, title: form.title, bio: form.bio,
        hourly_rate: parseFloat(form.hourly_rate) || 0, skills: form.skills,
        location: form.location, availability: form.availability, category: form.category
      });
    }
    setSaving(false);
    toast.success("Profile saved!");
  };

  if (!user) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-lora font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground mb-8">Manage your account information</p>

        <div className="bg-white rounded-2xl border border-border p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
            <Input value={form.display_name || ""} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>

          {userProfile?.role === "freelancer" && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Professional Title</label>
                <Input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Full-Stack Developer" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
                <Textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hourly Rate (USD)</label>
                  <Input type="number" value={form.hourly_rate || ""} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                  <Input value={form.location || ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Availability</label>
                  <Select value={form.availability || "available"} onValueChange={v => setForm(f => ({ ...f, availability: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="not_available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                  <Select value={form.category || ""} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Science", "DevOps", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(form.skills || []).map(s => (
                    <Badge key={s} className="bg-primary/10 text-primary gap-1 pr-1">
                      {s} <button onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {SKILL_OPTIONS.filter(s => !(form.skills || []).includes(s)).map(s => (
                    <Badge key={s} onClick={() => toggleSkill(s)} variant="outline" className="cursor-pointer text-xs hover:bg-primary hover:text-white transition-colors">{s}</Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Custom skill..." onKeyDown={e => e.key === "Enter" && addSkill(skillInput)} />
                  <Button variant="outline" size="sm" onClick={() => addSkill(skillInput)}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
          )}

          <Button className="w-full bg-primary gap-2 h-12" onClick={save} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}