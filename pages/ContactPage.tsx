

import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { postContactForm } from '../hooks/useApi';
import { ContactMessage } from '../types';
import { useTheme } from '../hooks/useTheme';
import Modal from '../components/Modal';
import InteractiveCampusMap from '../components/InteractiveCampusMap';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactMessage>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactMessage, string>>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');
  const { theme } = useTheme();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactMessage, string>> = {};
    if (formData.name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters.';
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactMessage]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setStatus('loading');
    setResponseMessage('');
    try {
      const response = await postContactForm(formData);
      setResponseMessage(response.message);
      if (response.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      setResponseMessage('An unexpected error occurred. Please try again.');
    }
  };
  
  const formBg = theme.name === 'light' ? 'bg-white' : theme.card.background;
  const errorInputClass = 'border-red-500 focus:ring-red-500 focus:border-red-500';

  return (
    <PageWrapper
      title="Contact Us"
      subtitle="We would love to hear from you. Reach out with any questions or enquiries."
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className={`${formBg} p-8 rounded-lg ${theme.card.shadow} ${theme.card.border}`}>
          <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label>
              <input type="text" name="name" id="name" required minLength={3} maxLength={80} value={formData.name} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus} ${theme.input.placeholder} ${errors.name ? errorInputClass : ''}`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
              {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${theme.textMuted}`}>Email Address</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus} ${theme.input.placeholder} ${errors.email ? errorInputClass : ''}`} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}/>
               {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="message" className={`block text-sm font-medium ${theme.textMuted}`}>Message</label>
              <textarea name="message" id="message" rows={5} required minLength={10} maxLength={500} value={formData.message} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus} ${theme.input.placeholder} ${errors.message ? errorInputClass : ''}`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined}></textarea>
               {errors.message && <p id="message-error" className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>
            <div>
              <button type="submit" disabled={status === 'loading'} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crest-gold disabled:opacity-50 transition-colors duration-300`}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
          {responseMessage && (
            <div aria-live="polite" className={`mt-4 text-sm text-center p-3 rounded-md ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {responseMessage}
            </div>
          )}
        </div>

        {/* Map and Info */}
        <div className="space-y-8">
          <div>
              <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Explore Our Campus</h2>
              <InteractiveCampusMap />
          </div>
          <div className={`${formBg} p-8 rounded-lg ${theme.card.shadow} ${theme.card.border}`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Get in Touch</h3>
            <address className={`not-italic ${theme.textMuted} space-y-4`}>
                <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    <span><strong>Address:</strong><br />Crestview College (former JavyvCollege), 6/8 Isaac Street, Ibereko, Badagry, Lagos State.</span>
                </div>
                <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    <span><strong>Email:</strong><br /><a href="mailto:info.crestviewcollege25@gmail.com" className={`${theme.accent} hover:underline`}>info.crestviewcollege25@gmail.com</a></span>
                </div>
                <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.024 11.024 0 006.254 6.254l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    <div>
                        <strong>Phone Numbers:</strong><br />
                        <a href="tel:08038617259" className={`block ${theme.accent} hover:underline`}>0803 861 7259</a>
                        <a href="tel:08036625932" className={`block ${theme.accent} hover:underline`}>0803 662 5932</a>
                        <a href="tel:07025131040" className={`block ${theme.accent} hover:underline`}>0702 513 1040</a>
                        <a href="tel:09081042779" className={`block ${theme.accent} hover:underline`}>0908 104 2779</a>
                    </div>
                </div>
            </address>
             <button onClick={() => { document.getElementById('name')?.focus(); }} className={`mt-6 w-full text-center ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} font-bold py-3 px-6 rounded-full inline-block ${theme.button.secondary.hover} transition-colors duration-300`}>
                Contact Us via Form
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ContactPage;