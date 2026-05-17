import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const convs = await base44.entities.Conversation.list("-last_message_at", 50);
      const myConvs = convs.filter(c => c.participant_ids?.includes(u.id));
      setConversations(myConvs);
      if (conversationId) {
        const conv = myConvs.find(c => c.id === conversationId);
        if (conv) {
          setActiveConv(conv);
          loadMessages(conversationId);
        }
      }
      setLoading(false);
    }).catch(() => navigate("/"));
  }, [conversationId]);

  const loadMessages = async (convId) => {
    const msgs = await base44.entities.Message.filter({ conversation_id: convId }, "created_date", 100);
    setMessages(msgs);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Real-time subscription
  useEffect(() => {
    if (!activeConv) return;
    const unsub = base44.entities.Message.subscribe(event => {
      if (event.data?.conversation_id === activeConv.id) {
        if (event.type === "create") setMessages(prev => [...prev, event.data]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });
    return unsub;
  }, [activeConv]);

  const selectConv = (conv) => {
    setActiveConv(conv);
    loadMessages(conv.id);
    navigate(`/messages/${conv.id}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || !user) return;
    setSending(true);
    const profile = await base44.entities.UserProfile.filter({ user_id: user.id });
    const displayName = profile[0]?.display_name || user.full_name;
    await base44.entities.Message.create({
      conversation_id: activeConv.id,
      sender_id: user.id,
      sender_name: displayName,
      content: input.trim(),
      is_read: false,
      project_id: activeConv.project_id
    });
    await base44.entities.Conversation.update(activeConv.id, { last_message: input.trim(), last_message_at: new Date().toISOString() });
    setInput("");
    setSending(false);
  };

  const getOtherParticipant = (conv) => {
    if (!user || !conv.participant_ids) return "Unknown";
    const idx = conv.participant_ids.indexOf(user.id);
    const otherIdx = idx === 0 ? 1 : 0;
    return conv.participant_names?.[otherIdx] || "Unknown";
  };

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-lora font-bold text-foreground mb-6">Messages</h1>
      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeConv && "hidden md:flex"}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground px-4">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No conversations yet.</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button key={conv.id} onClick={() => selectConv(conv)} className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors border-b border-border/50 ${activeConv?.id === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {getOtherParticipant(conv)?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{getOtherParticipant(conv)}</p>
                        {conv.project_title && <p className="text-xs text-primary truncate">{conv.project_title}</p>}
                        {conv.last_message && <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {activeConv ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button className="md:hidden" onClick={() => { setActiveConv(null); navigate("/messages"); }}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {getOtherParticipant(activeConv)?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{getOtherParticipant(activeConv)}</p>
                  {activeConv.project_title && <p className="text-xs text-muted-foreground">{activeConv.project_title}</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <motion.div key={msg.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary text-white" : "bg-secondary text-foreground"}`}>
                        {!isMe && <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                          {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border flex gap-3">
                <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} />
                <Button className="bg-primary gap-2" onClick={sendMessage} disabled={sending || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground flex-col gap-3">
              <MessageSquare className="w-16 h-16 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}