import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, X } from "lucide-react";

const CATEGORIES = ["Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Science", "DevOps", "Other"];
const SKILL_OPTIONS = ["React", "Node.js", "Python", "UI/UX Design", "Figma", "TypeScript", "Vue.js", "AWS", "PostgreSQL", "MongoDB", "Flutter", "Swift", "Content Writing", "SEO", "Data Analysis", "Machine Learning"];

export default function PostProject() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "", budget_min: "", budget_max: "",
    deadline: "", experience_level: "Intermediate", skills_required: []
  });
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate("/"));
  }, []);

  const addSkill = (skill) => {
    if (skill && !form.skills_required.includes(skill)) {
      setForm(f => ({ ...f, skills_required: [...f.skills_required, skill] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => setForm(f => ({ ...f, skills_required: f.skills_required.filter(s => s !== skill) }));

  const handleSubmit = async () => {
    setSubmitting(true);
    const project = await base44.entities.Project.create({
      ...form,
      budget_min: parseFloat(form.budget_min) || 0,
      budget_max: parseFloat(form.budget_max) || 0,
      client_id: user.id,
      client_name: user.full_name,
      status: "open",
      proposals_count: 0
    });
    setSubmitting(false);
    navigate(`/project/${project.id}`);
  };

  const isValid = form.title && form.description && form.category && form.budget_min && form.budget_max;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-lora font-bold text-foreground">Post a Project</h1>
            <p className="text-muted-foreground text-sm">Find the perfect freelancer for your needs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Project Title *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Build a React e-commerce website" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your project in detail. Include goals, deliverables, and any specific requirements..." rows={5} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category *</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Experience Level</label>
              <Select value={form.experience_level} onValueChange={v => setForm(f => ({ ...f, experience_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Entry", "Intermediate", "Expert"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Min Budget (USD) *</label>
              <Input type="number" value={form.budget_min} onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))} placeholder="500" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Max Budget (USD) *</label>
              <Input type="number" value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} placeholder="2000" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Deadline</label>
            <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skills_required.map(s => (
                <Badge key={s} className="bg-primary/10 text-primary gap-1 pr-1">
                  {s}
                  <button onClick={() => removeSkill(s)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {SKILL_OPTIONS.filter(s => !form.skills_required.includes(s)).map(s => (
                <Badge key={s} onClick={() => addSkill(s)} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs border-border">{s}</Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add custom skill..." onKeyDown={e => e.key === "Enter" && addSkill(skillInput)} className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => addSkill(skillInput)} disabled={!skillInput}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <Button className="w-full bg-primary h-12 text-base font-semibold" onClick={handleSubmit} disabled={submitting || !isValid}>
            {submitting ? "Posting..." : "Post Project"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}