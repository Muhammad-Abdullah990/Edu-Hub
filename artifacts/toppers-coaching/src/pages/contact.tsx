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
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-full"
                >
                  <WaveWrap variant="green" rounded="rounded-xl" className="w-full">
                    <a
                      href="https://wa.me/923263987552"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white py-5 px-6 rounded-xl font-bold text-base transition-colors duration-200 shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </WaveWrap>
                </motion.div>
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
                src="https://maps.google.com/maps?q=Sector+9D+Street+4+Baldia+Town+Karachi+Pakistan&z=16&output=embed"
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
