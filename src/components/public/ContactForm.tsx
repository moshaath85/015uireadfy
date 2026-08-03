'use client';

import { type FormEvent, useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/components/layout/LanguageProvider';

const STR = {
  name: { ar: 'الاسم', en: 'Name' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  phone: { ar: 'رقم الهاتف (اختياري)', en: 'Phone (optional)' },
  company: { ar: 'الشركة (اختياري)', en: 'Company (optional)' },
  subject: { ar: 'الموضوع', en: 'Subject' },
  message: { ar: 'الرسالة', en: 'Message' },
  name_placeholder: { ar: 'الاسم الكامل', en: 'Your full name' },
  email_placeholder: { ar: 'example@example.com', en: 'you@example.com' },
  phone_placeholder: { ar: '+966 5xxxxxxxx', en: '+966 5xxxxxxxx' },
  company_placeholder: { ar: 'اسم الشركة أو المؤسسة', en: 'Company or organization' },
  subject_placeholder: { ar: 'مشاهدة خاصة، اقتناء، صحافة...', en: 'Private viewing, acquisition, press...' },
  message_placeholder: { ar: 'أخبرنا عن اهتمامك...', en: 'Tell us about your interest...' },
  consent: { ar: 'أوافق على معالجة بياناتي للرد على هذا الاستفسار.', en: 'I consent to my data being processed to respond to this inquiry.' },
  send: { ar: 'إرسال', en: 'Send message' },
  sending: { ar: 'جارٍ الإرسال…', en: 'Sending…' },
  thanks: { ar: 'شكراً لتواصلك.', en: 'Thank you for your inquiry.' },
  reply: { ar: 'تم استلام رسالتك وسيراجعها فريقنا.', en: 'Your message has been received and will be reviewed by our team.' },
  reference: { ar: 'الرقم المرجعي', en: 'Reference number' },
  another: { ar: 'إرسال رسالة أخرى', en: 'Send another message' },
  validation_error: { ar: 'يرجى مراجعة الحقول المحددة', en: 'Please check the highlighted fields' },
  server_error: { ar: 'تعذر إرسال الاستفسار. يرجى المحاولة مرة أخرى.', en: 'We could not send your inquiry. Please try again.' },
  rate_limited: { ar: 'محاولات كثيرة. يرجى المحاولة لاحقًا.', en: 'Too many attempts. Please try again later.' },
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  consent: boolean;
}

const EMPTY: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
  consent: false,
};

type Status = 'idle' | 'submitting' | 'success' | 'validationError' | 'serverError' | 'rateLimited';

const FIELD_IDS: Record<string, string> = {
  name: 'contact-name-err',
  email: 'contact-email-err',
  subject: 'contact-subject-err',
  message: 'contact-message-err',
  consent: 'contact-consent-err',
};

export default function ContactForm() {
  const { lang } = useLanguage();
  const s = (k: keyof typeof STR) => lang === 'ar' ? STR[k].ar : STR[k].en;
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState<FormData>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState('');
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: checked !== undefined ? checked : value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!form.consent) {
      setFieldErrors({ consent: lang === 'ar' ? 'الموافقة مطلوبة' : 'Consent is required' });
      return;
    }

    setStatus('submitting');

    try {
      const body = new FormData();
      body.set('name', form.name);
      body.set('email', form.email);
      body.set('phone', form.phone);
      body.set('company', form.company);
      body.set('subject', form.subject);
      body.set('message', form.message);
      body.set('language', lang);
      body.set('consent', 'true');
      body.set('_startedAt', String(startedAt.current));

      const res = await fetch('/api/contact', { method: 'POST', body });

      if (res.status === 429) {
        setStatus('rateLimited');
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data && data.code === 'VALIDATION_ERROR' && data.errors) {
          const errors: Record<string, string> = {};
          for (const issue of data.errors) {
            errors[issue.field] = issue.message;
          }
          setFieldErrors(errors);
          setStatus('validationError');
        } else {
          setStatus('serverError');
        }
        return;
      }

      setReference(data?.reference ?? '');
      setStatus('success');
      setForm(EMPTY);
      startedAt.current = Date.now();
    } catch {
      setStatus('serverError');
    }
  };

  const reset = () => {
    setStatus('idle');
    setForm(EMPTY);
    setFieldErrors({});
    setReference('');
    startedAt.current = Date.now();
  };

  if (status === 'success') {
    return (
      <div className="g-contact__sent" role="status" aria-live="polite">
        <h2>{s('thanks')}</h2>
        <p>{s('reply')}</p>
        {reference && (
          <p className="g-contact__reference">
            {s('reference')}: <strong>{reference}</strong>
          </p>
        )}
        <button type="button" className="g-contact__reset" onClick={reset}>
          {s('another')}
        </button>
      </div>
    );
  }

  if (status === 'rateLimited') {
    return (
      <div className="g-contact__sent" role="alert">
        <h2>{s('rate_limited')}</h2>
        <button type="button" className="g-contact__reset" onClick={reset}>
          {s('another')}
        </button>
      </div>
    );
  }

  return (
    <>
      <form className="g-contact__form" onSubmit={handleSubmit} noValidate>
        {/* Honeypot. Clipped rather than pushed off-canvas: a negative `left`
            creates 9999px of scrollable emptiness once `dir="rtl"` flips the
            scroll origin. */}
        <div
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
            opacity: 0,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <label htmlFor="gallery_website">Website</label>
          <input id="gallery_website" name="gallery_website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className={`g-contact__field${fieldErrors.name ? ' g-contact__field--error' : ''}`}>
          <label htmlFor="contact-name">{s('name')}</label>
          <input id="contact-name" name="name" type="text" required
            value={form.name} onChange={handleChange}
            placeholder={s('name_placeholder')}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'contact-name-err' : undefined}
          />
          {fieldErrors.name && <span id="contact-name-err" className="g-contact__field-error" role="alert">{fieldErrors.name}</span>}
        </div>

        <div className={`g-contact__field${fieldErrors.email ? ' g-contact__field--error' : ''}`}>
          <label htmlFor="contact-email">{s('email')}</label>
          <input id="contact-email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            placeholder={s('email_placeholder')}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'contact-email-err' : undefined}
          />
          {fieldErrors.email && <span id="contact-email-err" className="g-contact__field-error" role="alert">{fieldErrors.email}</span>}
        </div>

        <div className="g-contact__field">
          <label htmlFor="contact-phone">{s('phone')}</label>
          <input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder={s('phone_placeholder')} />
        </div>

        <div className="g-contact__field">
          <label htmlFor="contact-company">{s('company')}</label>
          <input id="contact-company" name="company" type="text" value={form.company} onChange={handleChange} placeholder={s('company_placeholder')} />
        </div>

        <div className={`g-contact__field${fieldErrors.subject ? ' g-contact__field--error' : ''}`}>
          <label htmlFor="contact-subject">{s('subject')}</label>
          <input id="contact-subject" name="subject" type="text"
            value={form.subject} onChange={handleChange}
            placeholder={s('subject_placeholder')}
            aria-invalid={Boolean(fieldErrors.subject)}
            aria-describedby={fieldErrors.subject ? 'contact-subject-err' : undefined}
          />
          {fieldErrors.subject && <span id="contact-subject-err" className="g-contact__field-error" role="alert">{fieldErrors.subject}</span>}
        </div>

        <div className={`g-contact__field${fieldErrors.message ? ' g-contact__field--error' : ''}`}>
          <label htmlFor="contact-message">{s('message')}</label>
          <textarea id="contact-message" name="message" required rows={6}
            value={form.message} onChange={handleChange}
            placeholder={s('message_placeholder')}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? 'contact-message-err' : undefined}
          />
          {fieldErrors.message && <span id="contact-message-err" className="g-contact__field-error" role="alert">{fieldErrors.message}</span>}
        </div>

        <div className={`g-contact__field g-contact__field--checkbox${fieldErrors.consent ? ' g-contact__field--error' : ''}`}>
          <label htmlFor="contact-consent">
            <input id="contact-consent" name="consent" type="checkbox" checked={form.consent} onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.consent)}
              aria-describedby={fieldErrors.consent ? 'contact-consent-err' : undefined}
            />
            <span>{s('consent')}</span>
          </label>
          {fieldErrors.consent && <span id="contact-consent-err" className="g-contact__field-error" role="alert">{fieldErrors.consent}</span>}
        </div>

        {status === 'serverError' && (
          <p className="g-contact__error" role="alert">{s('server_error')}</p>
        )}
        {status === 'validationError' && !Object.keys(fieldErrors).length && (
          <p className="g-contact__error" role="alert">{s('validation_error')}</p>
        )}

        <button type="submit" className="g-contact__submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? s('sending') : s('send')}
        </button>
      </form>
    </>
  );
}
