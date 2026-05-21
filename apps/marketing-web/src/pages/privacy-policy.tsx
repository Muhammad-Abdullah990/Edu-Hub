import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <Helmet>
        <title>Privacy Policy | Toppers Coaching Center</title>
        <meta
          name="description"
          content="Learn how Toppers Coaching Center collects and protects your data. Trusted privacy practices for parents and students in Karachi."
        />
        <link rel="canonical" href="https://topperscoachingcenter.com/privacy-policy" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 md:p-12">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-primary font-semibold mb-3">Legal & Privacy</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="mt-4 text-slate-600 leading-8">
                At Toppers Coaching Center, we respect your privacy and work to keep your personal information safe. This Privacy Policy explains how we collect, use, and protect information from parents, students, and website visitors.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
              <p className="text-slate-600 leading-7">
                We collect only the information needed to support admissions and communication. This may include:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 pl-4">
                <li>Name</li>
                <li>Phone number</li>
                <li>Student class or program interest</li>
                <li>Form submissions and WhatsApp inquiry details</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">How We Use Information</h2>
              <p className="text-slate-600 leading-7">
                We use collected information to respond to admission inquiries, schedule appointments, and communicate with parents and students about programs, fees, course details, and enrollment updates.
              </p>
              <p className="text-slate-600 leading-7">
                We do not use your information for marketing outside the purpose of supporting your inquiry and helping your family make the best decision for the student’s education.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Data Protection</h2>
              <p className="text-slate-600 leading-7">
                We keep personal data secure through appropriate administrative and technical safeguards. We do not sell or share your information with third parties for commercial purposes.
              </p>
              <p className="text-slate-600 leading-7">
                Access to personal information is limited to staff members who need it to support admissions and student services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Cookies</h2>
              <p className="text-slate-600 leading-7">
                Our website may use cookies and similar technologies to improve the browsing experience and understand how visitors use the site. Cookies help us maintain basic site functionality and improve performance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Third-Party Services</h2>
              <p className="text-slate-600 leading-7">
                We may use third-party services such as Google Analytics or other trusted providers to understand traffic patterns and improve our website. These services may collect anonymized usage data, but they do not receive personal information unless you submit it through our contact forms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Contact Information</h2>
              <p className="text-slate-600 leading-7">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700 leading-7">
                <p className="font-semibold">Toppers Coaching Center</p>
                <p>Street Number 04, New Saeedabad Block 9-D Baldia, Karachi, 75760, Pakistan</p>
                <p>Phone: +92 326 3987 552</p>
                <p>Email: info@topperscoachingcenter.com</p>
              </div>
              <p className="text-slate-600 leading-7">
                For admissions or course questions, visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

