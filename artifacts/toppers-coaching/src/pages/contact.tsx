import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WaveWrap } from "@/components/ui/wave-button";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent Successfully",
        description: "We will get back to you shortly regarding admission.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      <div className="container mx-auto px-4">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-600">
            Admissions for the current session are open. Contact us to schedule a visit or discuss your child's educational needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Info</h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Address</p>
                    <p className="text-slate-600 text-sm mt-1">Sector 9D, Street no 4, Baldia town</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <p className="text-slate-600 text-sm mt-1">+92 326 3987 552</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-slate-600 text-sm mt-1">info@topperscoachingcenter.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Timings</p>
                    <p className="text-slate-600 text-sm mt-1">Mon to Sun: 5:00 PM to 11:59 PM</p>
                  </div>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <WaveWrap variant="green" rounded="rounded-xl" className="w-full">
                  <a 
                    href="https://wa.me/923263987552" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold transition-colors"
                  >
                    <MessageCircle size={24} />
                    Chat on WhatsApp
                  </a>
                </WaveWrap>
              </div>
            </div>
          </div>

          {/* Form & Map */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send an Inquiry</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Parent/Student Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input 
                      required 
                      type="tel" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Class/Grade Inquiry For</label>
                  <select required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                    <option value="">Select Grade</option>
                    <option value="montessori">Montessori</option>
                    <option value="primary">Primary (1-5)</option>
                    <option value="middle">Middle (6-8)</option>
                    <option value="matric">Matric (9-10)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Message</label>
                  <textarea 
                    required 
                    rows={4}
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <motion.div whileHover={!isSubmitting ? { scale: 1.02 } : {}} className="rounded-xl w-full">
                  <WaveWrap variant="red" rounded="rounded-xl" className={`w-full ${isSubmitting ? "pointer-events-none" : ""}`}>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 text-white rounded-xl transition-all"
                    >
                      {isSubmitting ? "Sending..." : "Submit Inquiry"}
                      {!isSubmitting && <Send className="ml-2 w-5 h-5" />}
                    </Button>
                  </WaveWrap>
                </motion.div>
              </form>
            </motion.div>

            {/* Google Maps Embed */}
            <div className="w-full h-[300px] rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <iframe
                title="Toppers Coaching Center Location"
                src="https://maps.google.com/maps?q=Sector+9D+Street+4+Baldia+Town+Karachi&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
