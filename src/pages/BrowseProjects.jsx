import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Briefcase, Clock, Users } from "lucide-react";

const CATEGORIES = ["All", "Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Science", "DevOps", "Other"];

export default function BrowseProjects() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.filter({ status: "open" }, "-created_date", 50).then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || (p.skills_required || []).some(s => s.toLowerCase().includes(q));
    const matchCat = category === "All" || p.category === category;
    const matchExp = experience === "All" || p.experience_level === experience;
    return matchSearch && matchCat && matchExp;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-lora font-bold text-foreground mb-2">Browse Projects</h1>
        <p className="text-muted-foreground">Find the perfect project that matches your skills.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, skills..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={experience} onValueChange={setExperience}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            {["All", "Entry", "Intermediate", "Expert"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{filtered.length} projects found</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/project/${p.id}`}>
                <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{p.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{p.proposals_count || 0} proposals</span>
                  </div>
                  <h3 className="font-lora font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 text-lg">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(p.skills_required || []).map(s => <Badge key={s} variant="outline" className="text-xs border-border">{s}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="font-bold text-foreground text-lg">${p.budget_min}–${p.budget_max}</span>
                      {p.deadline && <span className="text-xs text-muted-foreground ml-3 flex items-center gap-1 inline-flex"><Clock className="w-3 h-3" />{new Date(p.deadline).toLocaleDateString()}</span>}
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground border-0 text-xs">{p.experience_level}</Badge>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-20 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">No projects found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}