import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Visit | Gallery 015',
  description: 'Plan your visit to Gallery 015 in Riyadh. Hours, location, and private viewing appointments.',
};

export default function VisitPage() {
  return (
    <main className="g-page">
      <div className="g-page__grid">
        <header className="g-page__header">
          <p className="g-page__kicker">Visit</p>
          <h1>
            Private viewing<br />
            by appointment.
          </h1>
        </header>

        <div className="g-page__body">
          <div className="g-page__section">
            <h2>Location</h2>
            <address>
              Gallery 015<br />
              Riyadh · Saudi Arabia
            </address>
          </div>

          <div className="g-page__section">
            <h2>Hours</h2>
            <p>Private viewing by appointment</p>
            <p>Monday–Thursday, 10:00–18:00</p>
            <p>Friday, 14:00–18:00</p>
            <p>Saturday by arrangement</p>
            <p>Sunday closed</p>
          </div>

          <div className="g-page__section">
            <h2>Contact</h2>
            <a href="mailto:info@gallery015.com">info@gallery015.com</a>
            <a href="tel:+966123456789">+966 12 345 6789</a>
          </div>

          <div className="g-page__section">
            <h2>Access</h2>
            <p>
              The gallery is accessible to visitors with reduced mobility. Please
              inform us of any access requirements when booking your appointment.
            </p>
          </div>

          <div className="g-page__links">
            <Link href="/contact">Book a private viewing</Link>
            <Link href="/about">About the gallery</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
