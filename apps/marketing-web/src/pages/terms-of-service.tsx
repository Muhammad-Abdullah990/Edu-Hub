import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <Helmet>
        <title>Terms of Service | Toppers Coaching Center</title>
        <meta
          name="description"
          content="Read the terms and conditions for using Toppers Coaching Center website and services. Understand how our coaching center serves parents and students in Karachi."
        />
        <link rel="canonical" href="https://topperscoachingcenter.com/terms-of-service" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 md:p-12">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-primary font-semibold mb-3">Legal</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Terms of Service</h1>
              <p className="mt-4 text-slate-600 leading-8">
                These Terms of Service explain the rules for using the Toppers Coaching Center website and services. By using our site or contacting us, you agree to follow these terms.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Use of Website</h2>
              <p className="text-slate-600 leading-7">
                The website is intended to provide information about our academic services. Users must provide accurate contact details and student information when submitting forms or inquiries.
              </p>
              <p className="text-slate-600 leading-7">
                Parents and students may use the site for admissions questions, program details, and general coaching information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Educational Services Disclaimer</h2>
              <p className="text-slate-600 leading-7">
                Toppers Coaching Center provides coaching, guidance, and study support. We do not guarantee specific academic results. Student performance depends on individual effort, attendance, and practice.
              </p>
              <p className="text-slate-600 leading-7">
                Our aim is to support each student with quality teaching and a disciplined learning environment, but results may vary from student to student.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Admissions & Fees</h2>
              <p className="text-slate-600 leading-7">
                Admissions are managed by Toppers Coaching Center based on class availability and program suitability. Fees are communicated during the admission process and may vary by program and batch.
              </p>
              <p className="text-slate-600 leading-7">
                Enrollment is confirmed after payment and completion of any required paperwork. Please contact us directly for the most current fee details.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Changes to Services</h2>
              <p className="text-slate-600 leading-7">
                Toppers Coaching Center may update class schedules, faculty assignments, or course offerings as needed. We strive to communicate changes promptly to students and parents.
              </p>
              <p className="text-slate-600 leading-7">
                Service changes are made to improve quality and adapt to academic requirements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Limitation of Liability</h2>
              <p className="text-slate-600 leading-7">
                The website and our coaching services are provided for informational purposes. Use of the site and services is at your own discretion.
              </p>
              <p className="text-slate-600 leading-7">
                Toppers Coaching Center is not responsible for any indirect or incidental damages arising from use of the website or services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Contact Information</h2>
              <p className="text-slate-600 leading-7">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700 leading-7">
                <p className="font-semibold">Toppers Coaching Center</p>
                <p>Street Number 04, New Saeedabad Block 9-D Baldia, Karachi, 75760, Pakistan</p>
                <p>Phone: +92 326 3987 552</p>
                <p>Email: info@topperscoachingcenter.com</p>
              </div>
              <p className="text-slate-600 leading-7">
                For the latest admissions details, visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

