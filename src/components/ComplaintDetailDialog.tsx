import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/integrations/supabase/types";
import {
  Clock,
  MapPin,
  User,
  FileText,
  Calendar,
  Tag,
  AlertTriangle,
} from "lucide-react";

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
  CRITICAL: "bg-destructive text-destructive-foreground",
  MEDIUM: "bg-warning text-warning-foreground",
  LOW: "bg-success text-success-foreground",
};

interface ComplaintDetailDialogProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComplaintDetailDialog({
  complaint,
  open,
  onOpenChange,
}: ComplaintDetailDialogProps) {
  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Complaint Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="font-mono">
              {complaint.complaint_id}
            </Badge>
            <Badge className={statusColors[complaint.status]}>
              {complaint.status.replace('_', ' ')}
            </Badge>
            <Badge className={priorityColors[complaint.priority]}>
              {complaint.priority} Priority
            </Badge>
          </div>

          <Separator />

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {complaint.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {complaint.description}
            </p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Tag className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium text-foreground">{complaint.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Priority Level</p>
                <p className="font-medium text-foreground">{complaint.priority}</p>
              </div>
            </div>

            {complaint.location && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{complaint.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted On</p>
                <p className="font-medium text-foreground">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">
                  {new Date(complaint.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm text-foreground truncate">
                  {complaint.user_id}
                </p>
              </div>
            </div>
          </div>

          {/* Language */}
          {complaint.language && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Language:</span>
                <Badge variant="outline">{complaint.language}</Badge>
              </div>
            </>
          )}

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {complaint.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AI Classification */}
          {complaint.ai_classification && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">AI Classification</p>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(complaint.ai_classification, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
