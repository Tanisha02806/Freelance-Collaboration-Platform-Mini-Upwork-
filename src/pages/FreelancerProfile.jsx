import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Clock, Briefcase, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profiles, u] = await Promise.all([
        base44.entities.FreelancerProfile.filter({ id }),
        base44.auth.me().catch(() => null)
      ]);
      if (profiles.length > 0) setFreelancer(profiles[0]);
      if (u) setUser(u);
      const revs = await base44.entities.Review.filter({ reviewee_id: profiles[0]?.user_id });
      setReviews(revs);
      setLoading(false);
    };
    load();
  }, [id]);

  const startChat = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const existing = await base44.entities.Conversation.list("-created_date", 50);
    const myConv = existing.find(c => c.participant_ids?.includes(user.id) && c.participant_ids?.includes(freelancer.user_id));
    if (myConv) { navigate(`/messages/${myConv.id}`); return; }
    const userProfile = await base44.entities.UserProfile.filter({ user_id: user.id });
    const conv = await base44.entities.Conversation.create({
      participant_ids: [user.id, freelancer.user_id],
      participant_names: [userProfile[0]?.display_name || user.full_name, freelancer.display_name],
      last_message: "",
      last_message_at: new Date().toISOString()
    });
    navigate(`/messages/${conv.id}`);
  };

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (!freelancer) return <div className="text-center py-24 text-muted-foreground">Freelancer not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/find-freelancers" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Freelancers
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-lora font-bold text-primary flex-shrink-0">
                  {freelancer.avatar_url ? <img src={freelancer.avatar_url} className="w-full h-full rounded-full object-cover" alt={freelancer.display_name} /> : freelancer.display_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-lora font-bold text-foreground mb-1">{freelancer.display_name}</h1>
                  <p className="text-muted-foreground mb-3">{freelancer.title}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {freelancer.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{freelancer.location}</span>}
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent text-accent" />{(freelancer.avg_rating || 0).toFixed(1)} ({freelancer.total_reviews || 0} reviews)</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{freelancer.completed_projects || 0} projects</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{freelancer.bio}</p>
            </div>
          </motion.div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-lora font-semibold text-foreground mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(freelancer.skills || []).map(s => (
                <Badge key={s} className="bg-primary/10 text-primary border-0 px-3 py-1">{s}</Badge>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-lora font-semibold text-foreground mb-5">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No reviews yet.</p>
            ) : (
              <div className="space-y-5">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-border pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-accent text-accent" : "text-muted fill-muted"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{r.reviewer_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="text-center mb-5">
              <p className="text-3xl font-lora font-bold text-foreground">${freelancer.hourly_rate}<span className="text-base text-muted-foreground font-normal">/hr</span></p>
              <Badge className={`mt-2 ${freelancer.availability === "available" ? "bg-green-100 text-green-700" : freelancer.availability === "busy" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                {freelancer.availability?.replace("_", " ")}
              </Badge>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium">{freelancer.experience_years || 0} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{freelancer.category || "N/A"}</span>
              </div>
            </div>
            <Button className="w-full bg-primary gap-2" onClick={startChat}>
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}