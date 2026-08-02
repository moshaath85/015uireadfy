import type { Metadata } from 'next';
import ContactForm from '@/components/public/ContactForm';

export const metadata: Metadata = {
  title: 'Contact | Gallery 015',
  description: 'Contact Gallery 015 for private viewings, acquisitions, institutional programmes, and press enquiries.',
};

export default function ContactPage() {
  return (
    <main className="g-contact">
      <div className="g-contact__grid">
        <header className="g-contact__header">
          <p className="g-contact__kicker">Contact</p>
          <h1>
            For acquisition,<br />
            placement, and institutional<br />
            art programmes.
          </h1>
          <p className="g-contact__intro">
            Contact the gallery team for private viewing appointments, artwork
            availability, collection advisory, and press enquiries. We respond to
            all messages within 48 hours.
          </p>
        </header>

        <div className="g-contact__details">
          <div className="g-contact__info">
            <h2>Visit the gallery</h2>
            <address>
              Gallery 015<br />
              Riyadh · Saudi Arabia
            </address>
            <p>Private viewing by appointment</p>
          </div>
          <div className="g-contact__info">
            <h2>Direct contact</h2>
            <a href="mailto:info@gallery015.com">info@gallery015.com</a>
            <a href="tel:+966123456789">+966 12 345 6789</a>
          </div>
          <div className="g-contact__info">
            <h2>Follow</h2>
            <p>Instagram · Twitter · LinkedIn</p>
          </div>
        </div>

        <div className="g-contact__form-wrap">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
