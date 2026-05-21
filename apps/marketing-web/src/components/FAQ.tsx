import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@toppers/ui";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "What classes and subjects do you offer at Toppers Coaching Center?",
    answer: "We provide complete academic support from Montessori/Nursery to Matric, O Level, and A Level. Our expert faculty covers all major subjects, ensuring students gain strong conceptual clarity and academic excellence at every stage.",
  },
  {
    question: "Do you teach all subjects or only specific ones?",
    answer: "We specialize in teaching all subjects across all classes. Whether it’s Mathematics, Science, English, or Commerce, our team ensures deep understanding and high performance.",
  },
  {
    question: "What makes Toppers Coaching Center different from other academies?",
    answer: "We focus on concept-based learning (not rote memorization), personalized attention for every student, result-oriented teaching strategies, and regular testing with performance tracking. Our mission is to turn every student into a topper.",
  },
  {
    question: "How experienced are your teachers?",
    answer: "Our faculty consists of highly experienced and dedicated educators who understand both subject expertise and student psychology. We focus on clear explanation, exam preparation, and confidence building, while inspiring students to achieve their best.",
  },
  {
    question: "What is your admission process?",
    answer: "Our admission process is simple: visit our campus or contact us online, followed by an initial discussion and basic assessment. We then guide students toward the most suitable class and batch.",
  },
  {
    question: "Do you provide individual attention to students?",
    answer: "Yes, this is one of our core strengths. We ensure every student receives personal guidance, dedicated doubt-solving, and regular performance feedback until they reach their full academic potential.",
  },
  {
    question: "Do you conduct tests and track student progress?",
    answer: "We conduct regular tests, mock exams, and evaluations. We also maintain written performance records with teacher verification and keep parents updated regularly.",
  },
  {
    question: "Do you provide study materials?",
    answer: "Yes, we provide well-structured notes, practice worksheets, and exam-focused materials designed to help students achieve high scores with confidence.",
  },
  {
    question: "Can weak students improve here?",
    answer: "Absolutely. We identify root causes of weakness, strengthen core concepts step-by-step, and build confidence. Many students improve from average to top performers.",
  },
  {
    question: "How can I contact or visit Toppers Coaching Center?",
    answer: "You can visit our campus, contact us via phone or WhatsApp, or submit a query through our website. Our team responds quickly and guides you properly.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};

export function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const schemaJson = useMemo(() => JSON.stringify(faqSchema), []);

  return (
    <section className="py-20 bg-slate-50">
      <Helmet>
        <script type="application/ld+json">{schemaJson}</script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="text-sm uppercase tracking-[0.28em] text-primary font-semibold mb-3">Frequently Asked Questions</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            Everything you need to know before joining Toppers Coaching Center.
          </p>
        </div>

        <Accordion type="single" collapsible value={openItem ?? undefined} onValueChange={setOpenItem} className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              value={`faq-${index}`}
              key={faq.question}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <AccordionTrigger className="px-5 py-5 md:px-6 md:py-6 text-left text-base md:text-lg font-semibold text-slate-900 hover:bg-slate-50 transition-all duration-300">
                <h3>{faq.question}</h3>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-slate-600 leading-7">
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-[32px] border border-slate-200 bg-white p-8 md:p-10 shadow-sm text-center">
          <p className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">Still have questions?</p>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Chat with our admissions team on WhatsApp for fast guidance, batch availability, and personalized support.
          </p>
          <a
            href="https://wa.me/923263987552"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition duration-300 hover:bg-primary/90"
          >
            <MessageCircle className="h-5 w-5" />
            Contact Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

