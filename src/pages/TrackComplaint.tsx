import { useState } from "react";
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
  AlertCircle, 
  ArrowRight,
  FileText,
  User,
  Building2,
  Calendar
} from "lucide-react";

// Mock data for demo
const mockComplaint = {
  id: "JC-2024-00847",
  title: "Broken streetlight near Main Market",
  category: "Electricity",
  status: "IN_PROGRESS",
  priority: "HIGH",
  submittedAt: "2024-01-15",
  lastUpdated: "2024-01-17",
  department: "Municipal Electricity Board",
  assignedTo: "Rajesh Kumar",
  description: "The streetlight near Main Market has been broken for 2 weeks. It's causing safety concerns for pedestrians and shopkeepers in the evening.",
  timeline: [
    {
      status: "SUBMITTED",
      date: "2024-01-15 10:30 AM",
      description: "Complaint submitted successfully",
      completed: true,
    },
    {
      status: "AI_PROCESSED",
      date: "2024-01-15 10:31 AM",
      description: "AI classified as Electricity issue with HIGH priority",
      completed: true,
    },
    {
      status: "ASSIGNED",
      date: "2024-01-15 02:15 PM",
      description: "Assigned to Municipal Electricity Board",
      completed: true,
    },
    {
      status: "IN_PROGRESS",
      date: "2024-01-17 09:00 AM",
      description: "Team dispatched for on-site inspection",
      completed: true,
    },
    {
      status: "RESOLVED",
      date: "Expected: 2024-01-20",
      description: "Issue resolution expected",
      completed: false,
    },
  ],
};

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-secondary text-secondary-foreground",
  AI_PROCESSED: "bg-accent/20 text-accent",
  ASSIGNED: "bg-primary/20 text-primary",
  IN_PROGRESS: "bg-warning/20 text-warning",
  RESOLVED: "bg-success/20 text-success",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-destructive text-destructive-foreground",
  MEDIUM: "bg-warning text-warning-foreground",
  LOW: "bg-success text-success-foreground",
};

export default function TrackComplaint() {
  const [searchId, setSearchId] = useState("");
  const [complaint, setComplaint] = useState<typeof mockComplaint | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (searchId.toUpperCase() === "JC-2024-00847" || searchId) {
      setComplaint(mockComplaint);
    }
    setIsSearching(false);
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
                  placeholder="Enter Complaint ID (e.g., JC-2024-00847)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" disabled={isSearching}>
                {isSearching ? "Searching..." : "Track"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Try: JC-2024-00847 for demo
            </p>
          </motion.div>

          {/* Complaint Details */}
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Status Card */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-foreground">{complaint.id}</h2>
                      <Badge className={priorityColors[complaint.priority]}>
                        {complaint.priority}
                      </Badge>
                    </div>
                    <p className="text-lg text-foreground">{complaint.title}</p>
                  </div>
                  <Badge className={`${statusColors[complaint.status]} text-sm px-4 py-2`}>
                    {complaint.status.replace("_", " ")}
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
                      <span className="text-xs">Department</span>
                    </div>
                    <p className="font-medium text-foreground text-sm">{complaint.department}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-xs">Assigned To</span>
                    </div>
                    <p className="font-medium text-foreground">{complaint.assignedTo}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Last Updated</span>
                    </div>
                    <p className="font-medium text-foreground">{complaint.lastUpdated}</p>
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
                <div className="space-y-6">
                  {complaint.timeline.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-success text-success-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        {index < complaint.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-full min-h-[40px] ${
                              step.completed ? "bg-success" : "bg-border"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={step.completed ? "border-success text-success" : ""}
                          >
                            {step.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-foreground font-medium">{step.description}</p>
                        <p className="text-sm text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!complaint && !isSearching && (
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
