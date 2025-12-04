import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Send, 
  FileImage,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "Road & Transport",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Public Health",
  "Education",
  "Housing",
  "Law & Order",
  "Environment",
  "Other",
];

const languages = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Urdu",
];

export default function SubmitComplaint() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    language: "English",
    description: "",
    location: "",
    attachments: [] as File[],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a complaint",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, isLoading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to submit a complaint",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          location: formData.location || null,
          language: formData.language,
        })
        .select('id, complaint_id')
        .single();

      if (error) throw error;

      // Send notification for new submission - use id (uuid) not complaint_id (text)
      await supabase.functions.invoke('send-notification', {
        body: {
          complaintId: data.id,
          userId: user.id,
          status: 'SUBMITTED',
          complaintTitle: formData.title,
        }
      });

      toast({
        title: "Complaint Submitted Successfully!",
        description: `Your complaint ID is ${data.complaint_id}. Track it anytime.`,
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        language: "English",
        description: "",
        location: "",
        attachments: [],
      });

      // Navigate to track page
      navigate("/track");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)],
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              New Complaint
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Submit Your Grievance
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Describe your issue below. Our AI will automatically categorize, prioritize, 
              and route your complaint to the right department.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg"
            >
              {/* AI Badge */}
              <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">AI-Assisted Submission</p>
                  <p className="text-xs text-muted-foreground">
                    Our AI will analyze and categorize your complaint automatically
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Complaint Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief title describing your issue"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Category & Language Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your issue in detail. You can write in any language..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      placeholder="Enter address or area"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors">
                    <input
                      type="file"
                      id="files"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-accent font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB each
                      </p>
                    </label>
                  </div>
                  {formData.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.attachments.map((file, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-secondary text-sm text-secondary-foreground"
                        >
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </div>
            </motion.form>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Average Response Time</p>
                  <p className="text-muted-foreground text-xs">Most complaints are acknowledged within 24 hours</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">For Emergencies</p>
                  <p className="text-muted-foreground text-xs">Call 112 or visit your nearest police station</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
