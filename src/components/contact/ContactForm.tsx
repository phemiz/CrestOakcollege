"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
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
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/send-mail.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && (data.status === "success" || data.success === true)) {
        setSent(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setServerError(data.message || "Failed to send message via mail server.");
      }
    } catch {
      setServerError("Unable to connect to the mail server. Please check your connection or email info@crestoakcollege.com.ng directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Delivery Notice</span>
                <p className="mt-0.5 leading-relaxed">{serverError}</p>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold focus:outline-none transition-colors resize-none ${
                errors.message ? "border-brand-red focus:border-brand-red" : "border-slate-200 focus:border-brand-blue"
              }`}
            />
            {errors.message && <span className="text-brand-red text-xs font-bold">{errors.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-red hover:bg-brand-red/90 disabled:bg-slate-400 text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-brand-red/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Send size={16} />
              </>
            )}
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
              Thank you for contacting us. Your message has been sent successfully to info@crestoakcollege.com.ng. We will follow up with you shortly.
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
  );
};
