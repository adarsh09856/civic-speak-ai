import { motion } from "framer-motion";
import { MessageSquareText, Cpu, Send, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MessageSquareText,
    title: "Describe Your Issue",
    description: "Use chat, voice, or form to explain your complaint in any language. Attach images if needed.",
    color: "bg-primary",
  },
  {
    icon: Cpu,
    title: "AI Processes",
    description: "Our NLP engine classifies category, analyzes sentiment, and determines priority automatically.",
    color: "bg-accent",
  },
  {
    icon: Send,
    title: "Auto-Routing",
    description: "Complaint is instantly routed to the correct department based on AI classification.",
    color: "bg-warning",
  },
  {
    icon: CheckCircle,
    title: "Track & Resolve",
    description: "Monitor progress in real-time. Get notifications at every step until resolution.",
    color: "bg-success",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Process</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From complaint to resolution in four simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-success" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-accent flex items-center justify-center text-sm font-bold text-accent z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl ${step.color} mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
