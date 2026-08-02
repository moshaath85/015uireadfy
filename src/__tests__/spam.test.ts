import { describe, it, expect } from 'vitest';
import {
  hashIp,
  checkSubmissionTimestamp,
  checkPayloadSize,
  checkContent,
  normalizeWhitespace,
  generateReference,
  hashMessage,
} from '@/lib/security/spam';

describe('hashIp', () => {
  it('produces a hex string', () => {
    const result = hashIp('127.0.0.1');
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for different IPs', () => {
    const a = hashIp('192.168.1.1');
    const b = hashIp('192.168.1.2');
    expect(a).not.toBe(b);
  });

  it('is deterministic', () => {
    expect(hashIp('10.0.0.1')).toBe(hashIp('10.0.0.1'));
  });
});

describe('checkSubmissionTimestamp', () => {
  it('rejects too-fast submissions', () => {
    const result = checkSubmissionTimestamp(Date.now());
    expect(result.passed).toBe(false);
  });

  it('accepts slow submissions', () => {
    const result = checkSubmissionTimestamp(Date.now() - 5000);
    expect(result.passed).toBe(true);
  });
});

describe('checkPayloadSize', () => {
  it('accepts normal payloads', () => {
    expect(checkPayloadSize('small').passed).toBe(true);
  });

  it('rejects oversized payloads', () => {
    const big = 'x'.repeat(21000);
    expect(checkPayloadSize(big).passed).toBe(false);
  });
});

describe('checkContent', () => {
  it('accepts plain text', () => {
    expect(checkContent('Hello, I would like to inquire.').passed).toBe(true);
  });

  it('accepts Arabic text', () => {
    expect(checkContent('مرحباً، أود الاستفسار عن عمل فني.').passed).toBe(true);
  });

  it('rejects HTML tags', () => {
    expect(checkContent('Hello <b>world</b>').passed).toBe(false);
  });

  it('rejects script tags', () => {
    expect(checkContent('<script>alert("xss")</script>').passed).toBe(false);
  });

  it('allows up to 3 URLs', () => {
    expect(checkContent('Check https://a.com https://b.com https://c.com').passed).toBe(true);
  });

  it('rejects too many URLs', () => {
    expect(checkContent('a https://1.com b https://2.com c https://3.com d https://4.com').passed).toBe(false);
  });
});

describe('normalizeWhitespace', () => {
  it('trims and collapses spaces', () => {
    expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
  });

  it('handles newlines and tabs', () => {
    expect(normalizeWhitespace('a\t\tb\n\nc')).toBe('a b c');
  });

  it('handles empty string', () => {
    expect(normalizeWhitespace('   ')).toBe('');
  });
});

describe('generateReference', () => {
  it('matches expected format', () => {
    const ref = generateReference();
    expect(ref).toMatch(/^G015-\d{4}-[A-Z0-9]{6}$/);
  });
});

describe('hashMessage', () => {
  it('is case- and whitespace-insensitive', () => {
    const a = hashMessage('  Hello World  ');
    const b = hashMessage('hello world');
    expect(a).toBe(b);
  });

  it('is deterministic', () => {
    expect(hashMessage('test')).toBe(hashMessage('test'));
  });
});
