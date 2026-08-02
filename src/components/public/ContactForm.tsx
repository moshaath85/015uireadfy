'use client';

import { type FormEvent, useState } from 'react';
import { useLanguage } from '@/components/layout/LanguageProvider';

const STR = {
  name: { ar: 'الاسم', en: 'Name' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  subject: { ar: 'الموضوع', en: 'Subject' },
  message: { ar: 'الرسالة', en: 'Message' },
  name_placeholder: { ar: 'الاسم الكامل', en: 'Your full name' },
  email_placeholder: { ar: 'example@example.com', en: 'you@example.com' },
  subject_placeholder: { ar: 'مشاهدة خاصة، اقتناء، صحافة...', en: 'Private viewing, acquisition, press...' },
  message_placeholder: { ar: 'أخبرنا عن اهتمامك...', en: 'Tell us about your interest...' },
  send: { ar: 'إرسال', en: 'Send message' },
  sending: { ar: 'جاري الإرسال...', en: 'Sending...' },
  error: { ar: 'حدث خطأ. يرجى المحاولة مرة أخرى.', en: 'Something went wrong. Please try again.' },
  try_again: { ar: 'حاول مرة أخرى', en: 'Try again' },
  thanks: { ar: 'شكراً لك.', en: 'Thank you.' },
  reply: { ar: 'سيرد الغاليري خلال ٤٨ ساعة.', en: 'The gallery will respond within 48 hours.' },
  another: { ar: 'إرسال رسالة أخرى', en: 'Send another message' },
};

export default function ContactForm() {
  const { lang } = useLanguage();
  const s = (k: keyof typeof STR) => lang === 'ar' ? STR[k].ar : STR[k].en;
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
        <h2>{s('thanks')}</h2>
        <p>{s('reply')}</p>
        <button type="button" className="g-contact__reset"
          onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}>
          {s('another')}
        </button>
      </div>
    );
  }

  return (
    <form className="g-contact__form" onSubmit={handleSubmit} noValidate>
      <div className="g-contact__field">
        <label htmlFor="contact-name">{s('name')}</label>
        <input id="contact-name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder={s('name_placeholder')} />
      </div>
      <div className="g-contact__field">
        <label htmlFor="contact-email">{s('email')}</label>
        <input id="contact-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder={s('email_placeholder')} />
      </div>
      <div className="g-contact__field">
        <label htmlFor="contact-subject">{s('subject')}</label>
        <input id="contact-subject" name="subject" type="text" value={form.subject} onChange={handleChange} placeholder={s('subject_placeholder')} />
      </div>
      <div className="g-contact__field">
        <label htmlFor="contact-message">{s('message')}</label>
        <textarea id="contact-message" name="message" required rows={6} value={form.message} onChange={handleChange} placeholder={s('message_placeholder')} />
      </div>
      <button type="submit" className="g-contact__submit" disabled={status === 'sending'}>
        {status === 'sending' ? s('sending') : status === 'error' ? s('try_again') : s('send')}
      </button>
      {status === 'error' && <p className="g-contact__error">{s('error')}</p>}
    </form>
  );
}
