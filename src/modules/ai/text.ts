// Helpers de texto para el mock y el respaldo por etiquetas

const STOPWORDS = new Set(
  (
    'a al algo como con de del el en entre es esta este esto hay la las lo los me mi mis muy ' +
    'no o para pero por que se sin sobre su sus tengo un una uno unos y ya yo cual cuando donde ' +
    'hacer entiendo entender ayuda ayudar necesito alguien quien tema temas the of and to in'
  ).split(' '),
);

export interface Term {
  stem: string;
  word: string; // palabra original
}

// minusculas, sin tildes ni stopwords, cortadas a 6 letras (stemming basico)
export function terms(text: string): Term[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#]+/u)
    .map((word) => ({
      word,
      plain: word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    }))
    .filter(({ plain }) => plain.length > 1 && !STOPWORDS.has(plain))
    .map(({ word, plain }) => ({ word, stem: plain.slice(0, 6) }));
}

export function tokenize(text: string): string[] {
  return terms(text).map((t) => t.stem);
}

export function matchingWords(stems: string[], text: string): string[] {
  const wanted = new Set(stems);
  const seen = new Set<string>();
  const words: string[] = [];
  for (const { stem, word } of terms(text)) {
    if (wanted.has(stem) && !seen.has(stem)) {
      seen.add(stem);
      words.push(word);
    }
  }
  return words;
}

export function overlap(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return [...new Set(a.filter((w) => set.has(w)))];
}

// hash FNV-1a de 32 bits
export function hash(text: string, seed = 0x811c9dc5): number {
  let h = seed;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function toPgVector(values: number[]): string {
  return `[${values.join(',')}]`;
}
