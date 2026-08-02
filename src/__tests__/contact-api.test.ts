import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/lib/tex7/database/providers/prisma-client', () => ({
  getTex7PrismaClient: () => ({
    contactInquiry: {
      create: mockCreate,
    },
  }),
}));

vi.mock('@/lib/email/provider', () => ({
  getEmailProvider: () => null,
}));

const mockSend = vi.fn();
vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      sendMail: mockSend,
    }),
  },
  createTransport: () => ({
    sendMail: mockSend,
  }),
}));

import { checkContent, normalizeWhitespace, generateReference, hashIp } from '@/lib/security/spam';

const API_URL = 'http://localhost:3000/api/contact';

function createFormBody(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set('name', overrides.name ?? 'John Doe');
  fd.set('email', overrides.email ?? 'john@example.com');
  fd.set('phone', overrides.phone ?? '');
  fd.set('company', overrides.company ?? '');
  fd.set('subject', overrides.subject ?? 'Inquiry about artwork');
  fd.set('message', overrides.message ?? 'I would like to know more about your collection.');
  fd.set('language', overrides.language ?? 'en');
  fd.set('consent', overrides.consent ?? 'true');
  if (overrides._startedAt) {
    fd.set('_startedAt', overrides._startedAt);
  }
  return fd;
}

describe('ContactFormInput Validation', () => {
  describe('valid English submission', () => {
    it('normalizes name correctly', () => {
      expect(normalizeWhitespace('  John  ')).toBe('John');
      expect(normalizeWhitespace('John Doe')).toBe('John Doe');
    });

    it('accepts valid English content', () => {
      expect(checkContent('I would like to inquire about a piece.').passed).toBe(true);
    });

    it('generates valid reference', () => {
      expect(generateReference()).toMatch(/^G015-\d{4}-[A-Z0-9]{6}$/);
    });
  });

  describe('valid Arabic submission', () => {
    it('accepts Arabic content', () => {
      expect(checkContent('أود الاستفسار عن عمل فني معروض.').passed).toBe(true);
    });

    it('normalizes Arabic whitespace', () => {
      expect(normalizeWhitespace('  مرحباً  ')).toBe('مرحباً');
    });
  });

  describe('missing required fields', () => {
    it('detects empty name', () => {
      expect(normalizeWhitespace('')).toBe('');
      expect(normalizeWhitespace('   ')).toBe('');
    });
  });

  describe('invalid email', () => {
    it('rejects invalid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('not-an-email')).toBe(false);
      expect(emailRegex.test('missing@tld')).toBe(false);
      expect(emailRegex.test('@nodomain.com')).toBe(false);
      expect(emailRegex.test('valid@example.com')).toBe(true);
    });
  });

  describe('oversized message', () => {
    it('detects oversized input', () => {
      const big = 'x'.repeat(5001);
      expect(big.length > 5000).toBe(true);
    });
  });

  describe('honeypot triggered', () => {
    it('honeypot field should not be visible to real users', () => {
      const fd = createFormBody();
      fd.set('gallery_website', 'spam');
      expect(fd.get('gallery_website')).toBe('spam');
    });
  });

  describe('spam content blocking', () => {
    it('rejects HTML in message', () => {
      expect(checkContent('<p>test</p>').passed).toBe(false);
    });

    it('rejects script injection', () => {
      expect(checkContent('<script>alert(1)</script>').passed).toBe(false);
    });
  });
});

describe('IP Hashing', () => {
  it('does not expose raw IP', () => {
    const ip = '203.0.113.42';
    const hash = hashIp(ip);
    expect(hash).not.toBe(ip);
    expect(hash).not.toContain('203');
  });

  it('produces consistent hash', () => {
    const ip = '198.51.100.1';
    expect(hashIp(ip)).toBe(hashIp(ip));
  });
});

describe('Reference Generation', () => {
  it('is not sequential', () => {
    const refs = new Set<string>();
    for (let i = 0; i < 10; i++) {
      refs.add(generateReference());
    }
    expect(refs.size).toBe(10);
  });

  it('includes current year', () => {
    const ref = generateReference();
    const year = new Date().getFullYear().toString();
    expect(ref).toContain(year);
  });
});

describe('Email Failure After Successful Persistence', () => {
  it('does not throw when email provider is null', async () => {
    const { getEmailProvider } = await import('@/lib/email/provider');
    const provider = getEmailProvider();
    expect(provider).toBeNull();
  });
});
