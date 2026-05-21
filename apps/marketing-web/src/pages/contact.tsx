import { motion } from "framer-motion";
import { Button } from "@toppers/ui";
import { WaveWrap } from "@toppers/ui";
import { FormFeedback, formValidation } from "@toppers/ui";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader } from "lucide-react";
import { useState } from "react";
import { useToast } from "@toppers/ui";
import { formatInquiryMessage, WHATSAPP_PHONE, openWhatsApp, WHATSAPP_STATUS_MESSAGE } from "@toppers/ui";
import { Helmet } from "react-helmet-async";

interface FormData {
  name: string;
  phone: string;
  grade: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  grade?: string;
  message?: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    grade: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    const nameValidation = formValidation.validateName(formData.name);
    if (!nameValidation.valid) newErrors.name = nameValidation.error;

    // Validate phone
    const phoneValidation = formValidation.validatePhone(formData.phone);
    if (!phoneValidation.valid) newErrors.phone = phoneValidation.error;

    // Validate grade
    const gradeValidation = formValidation.validateClass(formData.grade);
    if (!gradeValidation.valid) newErrors.grade = gradeValidation.error;

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Show success state briefly before redirecting
      setSubmitSuccess(true);
      
      // Build and send WhatsApp message with form data
      const whatsappMessage = formatInquiryMessage({
        name: formData.name,
        phone: formData.phone,
        class: formData.grade,
        message: formData.message,
      });
      
      // Brief delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 700));

      // Clear form data
      setFormData({
        name: "",
        phone: "",
        grade: "",
        message: "",
      });

      // Open WhatsApp with formatted message
      openWhatsApp(whatsappMessage);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error processing inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to process inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Toppers Coaching Center Karachi | Admissions & Inquiries</title>
        <meta name="description" content="Contact Toppers Coaching Center in Karachi for admissions and inquiries. Located in Baldia Town, we're here to help your child succeed academically." />
        <link rel="canonical" href="https://topperscoachingcenter.com/contact" />
        <meta property="og:title" content="Contact Toppers Coaching Center Karachi | Admissions & Inquiries" />
        <meta property="og:description" content="Contact Toppers Coaching Center in Karachi for admissions and inquiries. Located in Baldia Town, we're here to help your child succeed." />
        <meta property="og:url" content="https://topperscoachingcenter.com/contact" />
        <meta property="og:type" content="website" />
      </Helmet>
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
                    <p className="text-slate-600 text-sm mt-1">Sector 9D, Street no 4, Baldia town, Karachi</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <a href="tel:+923263987552" className="text-slate-600 text-sm mt-1 hover:text-primary transition-colors">+92 326 3987 552</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <a href="mailto:info@topperscoachingcenter.com" className="text-slate-600 text-sm mt-1 hover:text-primary transition-colors">info@topperscoachingcenter.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Timings</p>
                    <p className="text-slate-600 text-sm mt-1">Monday to Sunday<br/>5:00 PM to 11:59 PM</p>
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
                      href="https://wa.me/923263987552?text=Hi%20Toppers%20Coaching.%20I%20want%20to%20inquire%20about%20admissions."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white py-5 px-6 rounded-xl font-bold text-base transition-colors duration-200 shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)]"
                    >
                      <MessageCircle size={20} />
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

              {submitSuccess && (
                <FormFeedback
                  type="success"
                  message="✓ Inquiry sent! WhatsApp will open in a new tab. We'll respond within 15-30 minutes."
                  onClose={() => setSubmitSuccess(false)}
                  autoClose={true}
                  autoCloseDelay={5000}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Parent/Student Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="name"
                      name="name"
                      type="text" 
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full h-12 px-4 rounded-xl border transition-all outline-none ${
                        errors.name
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary"
                      } disabled:bg-slate-50 disabled:text-slate-500`}
                      placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="phone"
                      name="phone"
                      type="tel" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full h-12 px-4 rounded-xl border transition-all outline-none ${
                        errors.phone
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary"
                      } disabled:bg-slate-50 disabled:text-slate-500`}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="grade" className="text-sm font-semibold text-slate-700">
                    Class/Grade <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full h-12 px-4 rounded-xl border transition-all outline-none bg-white ${
                      errors.grade
                        ? "border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    } disabled:bg-slate-50 disabled:text-slate-500`}
                  >
                    <option value="">Select Grade</option>
                    <option value="montessori">Montessori</option>
                    <option value="primary">Primary (Class 1-5)</option>
                    <option value="middle">Middle (Class 6-8)</option>
                    <option value="matric">Matric (Class 9-10)</option>
                  </select>
                  {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-slate-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-xl border transition-all outline-none resize-none ${
                      errors.message
                        ? "border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    } disabled:bg-slate-50 disabled:text-slate-500`}
                    placeholder="Tell us about your child and what you're looking for..."
                  ></textarea>
                  {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                </div>
                <motion.div 
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}} 
                  className="rounded-xl w-full"
                >
                  <WaveWrap 
                    variant="red" 
                    rounded="rounded-xl" 
                    className={`w-full ${isSubmitting ? "pointer-events-none opacity-75" : ""}`}
                  >
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 text-white rounded-xl transition-all disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 w-5 h-5 animate-spin" />
                          Opening WhatsApp...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 w-5 h-5" />
                          Send via WhatsApp
                        </>
                      )}
                    </Button>
                  </WaveWrap>
                </motion.div>

                <div className="pt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-blue-700">💬 Quick Response:</span> {WHATSAPP_STATUS_MESSAGE}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    ✓ 19+ Years of Teaching Excellence | Direct communication with our team
                  </p>
                </div>
              </form>
            </motion.div>

            {/* Google Maps Embed */}
            <div className="w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden border border-slate-100 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
              <iframe
                title="Toppers Coaching Center Location - Baldia Town, Karachi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.860435092709!2d66.95836637515474!3d24.936823977879484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb36bf29916a2e5%3A0xf1db8cb2ff0bce94!2sToppers%20Coaching%20Center!5e0!3m2!1sen!2s!4v1775896675071!5m2!1sen!2s"
                width="600"
                height="450"
                className="h-full w-full"
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
    </>
  );
}


