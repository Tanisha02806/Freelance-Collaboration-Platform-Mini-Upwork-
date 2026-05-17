import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, DollarSign, CheckCircle, XCircle, MessageSquare } from "lucide-react";

export default function ProposalList({ proposals, projectId, project, onUpdate }) {
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (proposal, action) => {
    setActionLoading(proposal.id);
    await base44.entities.Proposal.update(proposal.id, { status: action });
    if (action === "accepted") {
      await base44.entities.Project.update(projectId, {
        status: "in_progress",
        hired_freelancer_id: proposal.freelancer_id,
        hired_freelancer_name: proposal.freelancer_name
      });
      // Reject other proposals
      for (const p of proposals.filter(pr => pr.id !== proposal.id && pr.status === "pending")) {
        await base44.entities.Proposal.update(p.id, { status: "rejected" });
      }
    }
    const updated = proposals.map(p => {
      if (p.id === proposal.id) return { ...p, status: action };
      if (action === "accepted" && p.status === "pending") return { ...p, status: "rejected" };
      return p;
    });
    onUpdate(updated);
    setActionLoading(null);
  };

  if (proposals.length === 0) return (
    <div className="bg-white rounded-2xl border border-border p-6 text-center text-muted-foreground py-10">
      <p>No proposals yet. Share your project to attract freelancers.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="font-lora font-semibold text-foreground text-lg mb-5">Proposals ({proposals.length})</h3>
      <div className="space-y-4">
        {proposals.map(p => (
          <div key={p.id} className={`border rounded-xl p-5 transition-all ${p.status === "accepted" ? "border-green-200 bg-green-50" : "border-border hover:border-primary/20"}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                {p.freelancer_avatar ? <img src={p.freelancer_avatar} className="w-full h-full rounded-full object-cover" /> : p.freelancer_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/freelancer/${p.freelancer_id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{p.freelancer_name}</Link>
                  <Badge className={`text-xs capitalize ${p.status === "accepted" ? "bg-green-100 text-green-700" : p.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${p.bid_amount}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.delivery_days} days</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.cover_letter}</p>

                {p.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" disabled={actionLoading === p.id} onClick={() => handleAction(p, "accepted")}>
                      <CheckCircle className="w-3 h-3" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-1" disabled={actionLoading === p.id} onClick={() => handleAction(p, "rejected")}>
                      <XCircle className="w-3 h-3" /> Decline
                    </Button>
                  </div>
                )}
                {p.status === "accepted" && (
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-700">✓ Hired</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}