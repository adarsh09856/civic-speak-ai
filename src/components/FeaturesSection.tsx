import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Mic, 
  FileImage, 
  Brain, 
  BarChart3, 
  Bell,
  Languages,
  MapPin
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "Describe your complaint in natural language. Our AI understands context and guides you through the process.",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak in any Indian language. Our speech-to-text AI transcribes and processes your complaint instantly.",
  },
  {
    icon: FileImage,
    title: "Image Upload",
    description: "Attach photos as evidence. AI analyzes images to better categorize and prioritize your grievance.",
  },
  {
    icon: Brain,
    title: "Smart Classification",
    description: "NLP engine automatically detects category, sentiment, and urgency level with 98% accuracy.",
  },
  {
    icon: Languages,
    title: "12+ Languages",
    description: "Submit complaints in Hindi, Tamil, Telugu, Bengali, Marathi, and 7 more regional languages.",
  },
  {
    icon: MapPin,
    title: "Geo-Location",
    description: "Auto-detect location for location-specific issues like road damage, streetlights, etc.",
  },
  {
    icon: BarChart3,
    title: "Real-time Tracking",
    description: "Monitor your complaint status from submission to resolution with live updates.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get updates via SMS, email, or app notifications at every stage of resolution.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform for citizen grievance management powered by cutting-edge AI technology
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
