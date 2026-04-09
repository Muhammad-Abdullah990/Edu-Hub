import { motion } from "framer-motion";
import { Play, Star, Quote } from "lucide-react";
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
  }, [emblaApi]);

  const studentVideos = [
    { name: "Ahmed R.", grade: "Matric Student" },
    { name: "Zara K.", grade: "9th Grade" },
    { name: "Usman A.", grade: "10th Grade" },
    { name: "Fatima S.", grade: "8th Grade" },
    { name: "Bilal M.", grade: "Alumni" },
  ];

  const parentTestimonials = [
    { text: "I have seen a remarkable difference in my son's confidence since he joined Toppers. The teachers genuinely care.", parent: "Mrs. Salman", role: "Parent of 9th Grader" },
    { text: "Finding a coaching center in Baldia with such dedicated and qualified teachers was a blessing. Highly recommended.", parent: "Mr. Tariq", role: "Parent of Matric Student" },
    { text: "The small class sizes mean my daughter gets the attention she needs. Her grades have improved from B's to A's.", parent: "Mrs. Khan", role: "Parent of 8th Grader" },
    { text: "A truly professional environment. They keep parents updated and ensure the child is actually learning, not just memorizing.", parent: "Mr. Raza", role: "Parent of Alumni" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f9fafb 40%, #fffde7 100%)" }}>
      
      {/* Student Voices (Video Placeholders) */}
      <section className="container mx-auto px-4 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Hear From Our Students</h1>
          <p className="text-lg text-slate-600">Real experiences from the students who study with us every day.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {studentVideos.map((vid, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[9/16] bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
                {/* Fake thumbnail bg */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 opacity-80"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                    <Play className="text-white fill-white ml-1" size={20} />
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold text-sm">{vid.name}</p>
                  <p className="text-slate-300 text-xs">{vid.grade}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Parents Testimonials Carousel */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted By Parents</h2>
            <div className="flex justify-center gap-1 mb-4 text-accent">
              {[1,2,3,4,5].map(n => <Star key={n} fill="currentColor" size={20} />)}
            </div>
          </div>

          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex">
              {parentTestimonials.map((testimonial, index) => (
                <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-6">
                  <div className="bg-white p-8 rounded-3xl h-full flex flex-col">
                    <Quote className="text-primary/20 mb-4" size={40} />
                    <p className="text-slate-700 text-lg italic flex-grow mb-8">
                      "{testimonial.text}"
                    </p>
                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <p className="font-bold text-slate-900">{testimonial.parent}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
