import { describe, expect, it } from 'vitest';
import { artistInitials } from '@/components/public/ArtistMonogram';

const ZWNJ = '‌';

describe('artistInitials — Latin names from the roster', () => {
  it('takes the first and last meaningful word', () => {
    expect(artistInitials('Omar Farouk')).toBe('OF');
    expect(artistInitials('Hassan Massoudy')).toBe('HM');
    expect(artistInitials('George Bahgory')).toBe('GB');
  });

  it('files past the definite article rather than under it', () => {
    expect(artistInitials('Layla Al-Hassan')).toBe('LH');
    expect(artistInitials('Alia Al Farsi')).toBe('AF');
    expect(artistInitials('Khaled Al-Ghannam')).toBe('KG');
    expect(artistInitials('Hatem Al-Mutlaq')).toBe('HM');
  });

  it('uses the first and last word of a three-part name, not the middle', () => {
    expect(artistInitials('Abdullah Al-Faisal Al-Rasheed')).toBe('AR');
    expect(artistInitials('Mohammed Al-Rasees')).toBe('MR');
  });

  it('gives a single letter for a single name', () => {
    expect(artistInitials('Ahmed')).toBe('A');
  });
});

describe('artistInitials — Arabic names', () => {
  it('takes the first letter of each end of the name', () => {
    expect(artistInitials('عمر فاروق')).toBe(`ع${ZWNJ}ف`);
    expect(artistInitials('حسن مسعودي')).toBe(`ح${ZWNJ}م`);
  });

  it('strips the attached definite article', () => {
    expect(artistInitials('ليلى الحسن')).toBe(`ل${ZWNJ}ح`);
    expect(artistInitials('خالد الغنام')).toBe(`خ${ZWNJ}غ`);
    expect(artistInitials('حاتم المطلق')).toBe(`ح${ZWNJ}م`);
  });

  it('treats a detached article as the particle it is', () => {
    expect(artistInitials('ابتسام ال ابراهيم')).toBe(`ا${ZWNJ}ا`);
  });

  it('separates the two letters so they cannot form a ligature', () => {
    expect(artistInitials('عبدالله نواوي')).toContain(ZWNJ);
  });

  it('gives a single letter for a single name', () => {
    expect(artistInitials('احمد')).toBe('ا');
  });
});

describe('artistInitials — nothing usable', () => {
  it('returns empty so the caller can fall back to the house mark', () => {
    expect(artistInitials('')).toBe('');
    expect(artistInitials('   ')).toBe('');
    expect(artistInitials('...')).toBe('');
    expect(artistInitials('015')).toBe('');
    expect(artistInitials('Al')).toBe('');
  });

  it('never invents a letter that is not in the name', () => {
    const name = 'Suroor Al-Alwani';
    const initials = artistInitials(name);
    const letters = name.toLowerCase().replace(/[^a-z]/g, '');
    Array.from(initials).forEach((letter) => {
      expect(letters).toContain(letter.toLowerCase());
    });
  });
});
