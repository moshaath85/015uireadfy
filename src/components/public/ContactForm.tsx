'use client';

import { type FormEvent, useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="g-contact__sent">
        <h2>Thank you.</h2>
        <p>The gallery will respond within 48 hours.</p>
        <button
          type="button"
          className="g-contact__reset"
          onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="g-contact__form" onSubmit={handleSubmit} noValidate>
      <div className="g-contact__field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
        />
      </div>
      <div className="g-contact__field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
      </div>
      <div className="g-contact__field">
        <label htmlFor="contact-subject">Subject</label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder="Private viewing, acquisition, press..."
        />
      </div>
      <div className="g-contact__field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your interest..."
        />
      </div>
      <button
        type="submit"
        className="g-contact__submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending...' : status === 'error' ? 'Try again' : 'Send message'}
      </button>
      {status === 'error' && (
        <p className="g-contact__error">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
