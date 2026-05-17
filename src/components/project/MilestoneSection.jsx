import { useState, useEffect } from "react";
import { base44 } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, XCircle, Upload, Clock, DollarSign } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function MilestoneSection({ projectId, project, user, profile }) {
  const [milestones, setMilestones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", amount: "", due_date: "" });
  const [submissionNotes, setSubmissionNotes] = useState({});
  const [loading, setLoading] = useState(true);

  const isClient = profile?.role === "client";
  const isFreelancer = profile?.role === "freelancer";

  useEffect(() => {
    base44.entities.Milestone.filter({ project_id: projectId }, "created_date").then(data => {
      setMilestones(data);
      setLoading(false);
    });
  }, [projectId]);

  const createMilestone = async () => {
    const m = await base44.entities.Milestone.create({
      project_id: projectId,
      title: form.title,
      description: form.description,
      amount: parseFloat(form.amount),
      due_date: form.due_date,
      status: "pending",
      client_id: user.id,
      freelancer_id: project.hired_freelancer_id
    });
    setMilestones(prev => [...prev, m]);
    setForm({ title: "", description: "", amount: "", due_date: "" });
    setShowForm(false);
  };

  const updateStatus = async (milestoneId, status, extra = {}) => {
    await base44.entities.Milestone.update(milestoneId, { status, ...extra });
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status, ...extra } : m));
  };

  const submitMilestone = async (milestone) => {
    const note = submissionNotes[milestone.id] || "";
    await updateStatus(milestone.id, "submitted", { submission_note: note });
  };

  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const approvedAmount = milestones.filter(m => m.status === "approved").reduce((sum, m) => sum + (m.amount || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-lora font-semibold text-foreground text-lg">Milestones</h3>
          {totalAmount > 0 && <p className="text-xs text-muted-foreground">${approvedAmount.toFixed(0)} of ${totalAmount.toFixed(0)} approved</p>}
        </div>
        {isClient && (
          <Button size="sm" className="bg-primary gap-1" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {totalAmount > 0 && (
        <div className="w-full bg-secondary rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(approvedAmount / totalAmount) * 100}%` }} />
        </div>
      )}

      {showForm && isClient && (
        <div className="bg-secondary/30 rounded-xl p-4 mb-4 space-y-3">
          <Input placeholder="Milestone title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea placeholder="Description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary" onClick={createMilestone} disabled={!form.title || !form.amount}>Create</Button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-3">
          {milestones.map(m => (
            <div key={m.id} className="border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{m.title}</h4>
                  {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                </div>
                <Badge className={`text-xs ml-2 ${STATUS_COLORS[m.status]}`}>{m.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${m.amount}</span>
                {m.due_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.due_date).toLocaleDateString()}</span>}
              </div>

              {m.submission_note && m.status !== "pending" && (
                <p className="text-xs bg-blue-50 text-blue-700 p-2 rounded-lg mb-3">📝 {m.submission_note}</p>
              )}
              {m.rejection_reason && (
                <p className="text-xs bg-red-50 text-red-700 p-2 rounded-lg mb-3">❌ {m.rejection_reason}</p>
              )}

              {/* Freelancer actions */}
              {isFreelancer && m.status === "in_progress" && (
                <div className="mt-3 space-y-2">
                  <Textarea placeholder="Submission note..." rows={2} value={submissionNotes[m.id] || ""} onChange={e => setSubmissionNotes(prev => ({ ...prev, [m.id]: e.target.value }))} className="text-sm" />
                  <Button size="sm" className="bg-primary gap-1 w-full" onClick={() => submitMilestone(m)}>
                    <Upload className="w-3 h-3" /> Submit for Review
                  </Button>
                </div>
              )}
              {isFreelancer && m.status === "pending" && (
                <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => updateStatus(m.id, "in_progress")}>
                  Start Working
                </Button>
              )}

              {/* Client actions */}
              {isClient && m.status === "submitted" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 gap-1" onClick={() => updateStatus(m.id, "approved")}>
                    <CheckCircle className="w-3 h-3" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateStatus(m.id, "rejected", { rejection_reason: "Needs revision" })}>
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
          {milestones.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No milestones yet.{isClient ? " Add one to track progress." : ""}</p>
          )}
        </div>
      )}
    </div>
  );
}