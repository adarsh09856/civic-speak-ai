import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  FileText,
  Building2,
  Calendar,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Complaint = Database['public']['Tables']['complaints']['Row'];
type ComplaintStatus = Database['public']['Enums']['complaint_status'];

const statusColors: Record<ComplaintStatus, string> = {
  SUBMITTED: "bg-secondary text-secondary-foreground",
  AI_PROCESSED: "bg-accent/20 text-accent",
  ASSIGNED: "bg-primary/20 text-primary",
  IN_PROGRESS: "bg-warning/20 text-warning",
  RESOLVED: "bg-success/20 text-success",
  REJECTED: "bg-destructive/20 text-destructive",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-destructive text-destructive-foreground",
  MEDIUM: "bg-warning text-warning-foreground",
  LOW: "bg-success text-success-foreground",
};

const statusLabels: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  AI_PROCESSED: "AI Processed",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export default function TrackComplaint() {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState("");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingUserComplaints, setIsLoadingUserComplaints] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserComplaints();
    }
  }, [user]);

  const fetchUserComplaints = async () => {
    if (!user) return;
    
    setIsLoadingUserComplaints(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUserComplaints(data);
    }
    setIsLoadingUserComplaints(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setIsSearching(true);
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', searchId.toUpperCase())
      .single();

    if (!error && data) {
      setComplaint(data);
    } else {
      setComplaint(null);
    }
    setIsSearching(false);
  };

  const selectComplaint = (c: Complaint) => {
    setComplaint(c);
    setSearchId(c.complaint_id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              Track Status
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Track Your Complaint
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter your complaint ID to view real-time status and updates
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter Complaint ID (e.g., JC-2024-00001)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" disabled={isSearching}>
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
              </Button>
            </form>
          </motion.div>

          {/* User's Complaints List */}
          {user && userComplaints.length > 0 && !complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Complaints</h3>
              <div className="space-y-3">
                {isLoadingUserComplaints ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  userComplaints.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => selectComplaint(c)}
                      className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-primary">{c.complaint_id}</span>
                            <Badge className={priorityColors[c.priority]}>{c.priority}</Badge>
                          </div>
                          <p className="text-foreground font-medium truncate">{c.title}</p>
                          <p className="text-sm text-muted-foreground">{c.category}</p>
                        </div>
                        <Badge className={statusColors[c.status]}>
                          {statusLabels[c.status]}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Complaint Details */}
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Back button */}
              {userComplaints.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="mb-4"
                  onClick={() => setComplaint(null)}
                >
                  ← Back to list
                </Button>
              )}

              {/* Status Card */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-foreground">{complaint.complaint_id}</h2>
                      <Badge className={priorityColors[complaint.priority]}>
                        {complaint.priority}
                      </Badge>
                    </div>
                    <p className="text-lg text-foreground">{complaint.title}</p>
                  </div>
                  <Badge className={`${statusColors[complaint.status]} text-sm px-4 py-2`}>
                    {statusLabels[complaint.status]}
                  </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">Category</span>
                    </div>
                    <p className="font-medium text-foreground">{complaint.category}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs">Location</span>
                    </div>
                    <p className="font-medium text-foreground text-sm">{complaint.location || "Not specified"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Submitted</span>
                    </div>
                    <p className="font-medium text-foreground">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Last Updated</span>
                    </div>
                    <p className="font-medium text-foreground">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-sm text-muted-foreground">{complaint.description}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">Progress Timeline</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success text-success-foreground">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="w-0.5 h-full min-h-[40px] bg-success" />
                    </div>
                    <div className="pb-6">
                      <Badge variant="outline" className="border-success text-success mb-1">
                        SUBMITTED
                      </Badge>
                      <p className="text-foreground font-medium">Complaint submitted successfully</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(complaint.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {complaint.status !== 'SUBMITTED' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          complaint.status === 'RESOLVED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'ASSIGNED' || complaint.status === 'AI_PROCESSED'
                            ? 'bg-success text-success-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        {complaint.status !== 'AI_PROCESSED' && complaint.status !== 'REJECTED' && (
                          <div className={`w-0.5 h-full min-h-[40px] ${
                            complaint.status === 'RESOLVED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'ASSIGNED'
                              ? 'bg-success' : 'bg-border'
                          }`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <Badge variant="outline" className={
                          complaint.status === 'AI_PROCESSED' || complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED'
                            ? "border-success text-success" : ""
                        }>
                          {statusLabels[complaint.status]}
                        </Badge>
                        <p className="text-foreground font-medium">
                          {complaint.status === 'AI_PROCESSED' && 'Complaint analyzed and categorized'}
                          {complaint.status === 'ASSIGNED' && 'Assigned to relevant department'}
                          {complaint.status === 'IN_PROGRESS' && 'Work in progress'}
                          {complaint.status === 'RESOLVED' && 'Issue has been resolved'}
                          {complaint.status === 'REJECTED' && 'Complaint rejected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(complaint.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!complaint && !isSearching && userComplaints.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Enter your Complaint ID
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your complaint ID was provided when you submitted your grievance. 
                It starts with "JC-" followed by the year and a unique number.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
