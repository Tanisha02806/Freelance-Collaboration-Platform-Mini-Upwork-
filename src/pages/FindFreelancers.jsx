import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Users, MapPin } from "lucide-react";

const CATEGORIES = ["All", "Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Science", "DevOps", "Other"];

export default function FindFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.FreelancerProfile.list("-avg_rating", 50).then(data => {
      setFreelancers(data);
      setLoading(false);
    });
  }, []);

  const filtered = freelancers.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.display_name?.toLowerCase().includes(q) || f.title?.toLowerCase().includes(q) || (f.skills || []).some(s => s.toLowerCase().includes(q));
    const matchCat = category === "All" || f.category === category;
    const matchAvail = availability === "All" || f.availability === availability;
    return matchSearch && matchCat && matchAvail;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-lora font-bold text-foreground mb-2">Find Freelancers</h1>
        <p className="text-muted-foreground">Discover talented professionals ready to bring your ideas to life.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4 mb-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, skill, title..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Availability" /></SelectTrigger>
          <SelectContent>
            {["All", "available", "busy", "not_available"].map(a => <SelectItem key={a} value={a} className="capitalize">{a === "All" ? "All" : a.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{filtered.length} freelancers found</p>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/freelancer/${f.id}`}>
                <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-lora font-bold text-primary flex-shrink-0">
                      {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full rounded-full object-cover" alt={f.display_name} /> : f.display_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{f.display_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{f.title}</p>
                      {f.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{f.location}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{f.bio}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(f.skills || []).slice(0, 4).map(s => <Badge key={s} variant="outline" className="text-xs border-border">{s}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-semibold">{(f.avg_rating || 0).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({f.total_reviews || 0})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">${f.hourly_rate}/hr</span>
                      <div>
                        <Badge className={`text-xs mt-0.5 ${f.availability === "available" ? "bg-green-100 text-green-700" : f.availability === "busy" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{f.availability?.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">No freelancers found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}