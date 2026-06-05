"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!formData.name.trim()) tempErrors.name = "Full Name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) tempErrors.subject = "Subject is required";
    if (!formData.message.trim()) tempErrors.message = "Message content is required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setSent(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Header />

      <main className="flex-grow bg-slate-50">
        {/* HERO HEADER */}
        <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
            <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">Connect with CCHSMT</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Contact Our Campus
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
              Have questions about registration, courses, or events? Reach out, and we will guide you.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact coordinates (Left Side) */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-6">
                <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl border-b border-slate-100 pb-3">
                  Contact Information
                </h3>

                <div className="flex flex-col gap-6">
                  {/* Address */}
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-700 text-sm">College Location</h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold">
                        6/8 Isaac Street, Ibereko, Badagry, Lagos State, Nigeria.
                      </p>
                    </div>
                  </div>

                  {/* Phones */}
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
                      <Phone size={22} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-700 text-sm">Phone Numbers</h4>
                      <div className="flex flex-col gap-1 mt-1 text-xs sm:text-sm text-slate-500 font-semibold">
                        <a href="tel:+2348155884804" className="hover:text-brand-red transition-colors">+234 (0) 815 588 4804</a>
                        <a href="tel:+2348038617259" className="hover:text-brand-red transition-colors">+234 (0) 803 861 7259</a>
                        <a href="tel:+2349123592617" className="hover:text-brand-red transition-colors">+234 (0) 912 359 2617</a>
                        <a href="tel:+2348068635152" className="hover:text-brand-red transition-colors">+234 (0) 806 863 5152</a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
                      <Mail size={22} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-700 text-sm">Email Coordinate</h4>
                      <a href="mailto:info.crestoakcollege@gmail.com" className="text-xs sm:text-sm text-slate-500 font-semibold hover:text-brand-red transition-colors block mt-1">
                        info.crestoakcollege@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Admin hours */}
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-blue-dark/5 text-brand-blue rounded-xl shrink-0">
                      <Clock size={22} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-700 text-sm">Administrative Hours</h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed font-semibold">
                        Monday – Friday: 8:00 AM – 4:00 PM <br />
                        Saturday (Part-Time): 9:00 AM – 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden h-72 relative">
                <iframe
                  title="CrestOak College Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7265215469493!2d2.8943187!3d6.4291419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b610c12345679%3A0x1234567890abcdef!2sBadagry%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

            </div>

            {/* Interactive Contact Form (Right Side) */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
                
                {!sent ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="font-display font-extrabold text-brand-blue-dark text-lg sm:text-xl flex items-center gap-2">
                        <MessageSquare size={22} className="text-brand-red" />
                        Send an Enquiry
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">Our administrative desk will reply to your mail within 24 hours.</p>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                          errors.name ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                        }`}
                      />
                      {errors.name && <span className="text-brand-red text-xs font-bold">{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                          errors.email ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                        }`}
                      />
                      {errors.email && <span className="text-brand-red text-xs font-bold">{errors.email}</span>}
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g., Question about admissions"
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors ${
                          errors.subject ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                        }`}
                      />
                      {errors.subject && <span className="text-brand-red text-xs font-bold">{errors.subject}</span>}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Message Content</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="How can we assist you?"
                        className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors resize-none ${
                          errors.message ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
                        }`}
                      />
                      {errors.message && <span className="text-brand-red text-xs font-bold">{errors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-brand-red/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <span>Send Message</span>
                      <Send size={16} />
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 gap-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                      <CheckCircle size={54} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-2xl text-brand-blue-dark">Message Sent!</h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Thank you for contacting us. Your message has been sent successfully. We will follow up with you shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => setSent(false)}
                      className="text-brand-blue hover:text-brand-blue-light text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
