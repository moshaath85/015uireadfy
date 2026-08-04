/* Sixty of the seventy artists on the roster have no portrait on file. The
   answer a gallery gives to that is not a grey silhouette and not a generated
   face — it is the same thing a museum puts on a label when there is no
   photograph: the name, set well. */

/** Words that file under the next word, not under themselves. */
const PARTICLES = new Set([
  'al', 'el', 'bin', 'ibn', 'bint', 'abu', 'de', 'del', 'della', 'van', 'von',
  'der', 'den', 'la', 'le', 'du', 'dos', 'da', 'of', 'the',
]);

const ARABIC = /[\u0600-\u06FF\u0750-\u077F]/;
const LETTER = /[A-Za-z\u00C0-\u024F\u0600-\u06FF\u0750-\u077F]/;

/** "Al-Ahmari" → "Ahmari", "المطلق" → "مطلق". The definite article is not the
    letter anyone would file this name under. */
function stripArticle(token: string): string {
  const latin = token.replace(/^(?:al|el)[-'’]/i, '');
  if (latin !== token) return latin;
  if (token.length > 2 && token.startsWith('ال')) return token.slice(2);
  return token;
}

function firstLetter(token: string): string {
  const characters = Array.from(token);
  return characters.length ? characters[0].toUpperCase() : '';
}

/**
 * One or two letters for an artist, in whichever script the name is written.
 * Returns an empty string when the name yields nothing usable, which is the
 * signal to fall back to the 015 mark.
 */
export function artistInitials(name: string): string {
  const cleaned = (name || '').replace(/[()[\]{}"'‘’“”.,،]/g, ' ').trim();
  if (!cleaned) return '';

  const tokens = cleaned
    .split(/[\s\u00A0\u2000-\u200A]+/)
    .map(stripArticle)
    /* A token counts if it opens with a letter in either script. The unicode
       property escape would be tidier, but the build targets ES5. */
    .filter((token) => token && !PARTICLES.has(token.toLowerCase()) && LETTER.test(token));

  if (!tokens.length) return '';

  const letters = tokens.length === 1
    ? [firstLetter(tokens[0])]
    : [firstLetter(tokens[0]), firstLetter(tokens[tokens.length - 1])];

  const usable = letters.filter(Boolean);
  if (!usable.length) return '';

  /* Two isolated Arabic letters set side by side would try to join into a
     ligature and read as a word that does not exist. A zero-width non-joiner
     keeps them as the two marks they are. */
  return ARABIC.test(cleaned) ? usable.join('\u200C') : usable.join('');
}

function defaultLabel(name: string): string {
  return ARABIC.test(name)
    ? `لا توجد صورة لـ ${name}`
    : `No portrait of ${name} on file`;
}

/**
 * The plate that stands in for a portrait. Renders at whatever dimensions its
 * parent figure gives it, so it keeps the proportions of the real portraits it
 * sits beside.
 */
export function ArtistMonogram({ name, label }: { name: string; label?: string }) {
  const initials = artistInitials(name);
  /* The face follows the letters, not the page: an Arabic page showing a
     Latin name must not set that name in the Arabic face, and the display
     serif has no Arabic at all. */
  const arabic = ARABIC.test(initials);

  return (
    <span className="artist-monogram" role="img" aria-label={label ?? defaultLabel(name)}>
      {initials ? (
        <span className="artist-monogram__mark" lang={arabic ? 'ar' : 'en'} aria-hidden="true">{initials}</span>
      ) : (
        <span className="artist-monogram__mark artist-monogram__mark--house" aria-hidden="true">015</span>
      )}
    </span>
  );
}
