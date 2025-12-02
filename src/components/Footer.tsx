import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Twitter, Facebook, Linkedin } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Submit Complaint", href: "/submit" },
    { label: "Track Status", href: "/track" },
    { label: "AI Assistant", href: "/chat" },
    { label: "Analytics", href: "/dashboard" },
  ],
  resources: [
    { label: "Help Center", href: "#" },
    { label: "API Documentation", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Guidelines", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "RTI Information", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">J+</span>
              </div>
              <span className="font-bold text-xl">JanConnect+</span>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              AI-powered citizen grievance platform. Where citizens speak, AI listens, and governance responds.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@janconnect.gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 JanConnect+. A Digital India Initiative.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
