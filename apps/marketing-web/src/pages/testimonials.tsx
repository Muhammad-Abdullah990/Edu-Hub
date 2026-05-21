import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });

  useEffect(() => {
    if (emblaApi) {
      const interval = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [emblaApi]);

  const studentReels = [
    { label: "Student: Kiswa", sub: "Matric Student" },
    { label: "Student: Arfa", sub: "Matric Student" },
  ];

  const parentReels = [
    { label: "Parent: Arfa" },
    { label: "Parent: Abdul Hadi" },
    { label: "Parent: Zawar" },
  ];

  const parentTestimonials = [
    { text: "I have seen a remarkable difference in my son's confidence since he joined Toppers. The teachers genuinely care.", parent: "Mrs. Salman", role: "Parent of 9th Grader" },
    { text: "Finding a coaching center in Baldia with such dedicated and qualified teachers was a blessing. Highly recommended.", parent: "Mr. Tariq", role: "Parent of Matric Student" },
    { text: "The small class sizes mean my daughter gets the attention she needs. Her grades have improved from B's to A's.", parent: "Mrs. Khan", role: "Parent of 8th Grader" },
    { text: "A truly professional environment. They keep parents updated and ensure the child is actually learning, not just memorizing.", parent: "Mr. Raza", role: "Parent of Alumni" },
  ];

  const ComingSoonCard = ({ label, sub }: { label: string; sub?: string }) => (
    <div className="relative aspect-[9/16] bg-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 opacity-90" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/90 font-bold text-lg tracking-widest uppercase"
        >
          Coming Soon
        </motion.div>
        <div className="w-12 h-px bg-white/30 rounded-full" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <p className="text-white font-bold text-sm">{label}</p>
        {sub && <p className="text-slate-300 text-xs">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>

      {/* Student Reels Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Successful Stories</h1>
          <p className="text-lg text-slate-600">Real experiences from the students who study with us every day.</p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {studentReels.map((vid, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="w-40 sm:w-48 shrink-0"
            >
              <ComingSoonCard label={vid.label} sub={vid.sub} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Parents Videos Carousel */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Parents Speak</h2>
            <div className="flex justify-center gap-1 mb-4 text-accent">
              {[1,2,3,4,5].map(n => <Star key={n} fill="currentColor" size={20} />)}
            </div>
          </div>

          {/* Parent Video Reels Carousel */}
          <div className="overflow-hidden cursor-grab active:cursor-grabbing mb-16" ref={emblaRef}>
            <div className="flex">
              {parentReels.map((reel, index) => (
                <div key={index} className="flex-[0_0_100%] md:flex-[0_0_33.33%] min-w-0 pl-6">
                  <div className="w-full max-w-[200px] mx-auto">
                    <ComingSoonCard label={reel.label} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Written Testimonials */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {parentTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl flex flex-col">
                <Quote className="text-primary/20 mb-4" size={40} />
                <p className="text-slate-700 text-lg italic flex-grow mb-6">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-bold text-slate-900">{testimonial.parent}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

