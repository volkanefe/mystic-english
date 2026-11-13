import { CEFRLevel, SentenceEntry } from '../types/game';

export const LEVEL_METADATA: Record<
  number,
  { cefr: CEFRLevel; title: string; subtitle: string }
> = {
  1: { cefr: 'A1', title: 'Sisli Eşik', subtitle: 'Temel Cümleler ve Geniş Zaman' },
  2: { cefr: 'A2', title: 'Kadim Patika', subtitle: 'Geçmiş, Gelecek ve Karşılaştırma' },
  3: { cefr: 'B1', title: 'Rün Tapınağı', subtitle: 'Present Perfect, Kipler ve Koşullar' },
  4: { cefr: 'B2', title: 'Fırtına Sunağı', subtitle: 'Edilgen Çatı, Past Perfect ve Phrasal Verbs' },
  5: { cefr: 'C1', title: 'Gölge Kütüphanesi', subtitle: 'Bağlaçlar, Nüans ve Akademik İfadeler' },
  6: { cefr: 'C2', title: 'Ebedi Kristal', subtitle: 'İleri Anlatım, Perspektif ve İfade Zenginliği' },
};

export interface RawSentenceItem {
  id: string;
  level: number;
  cefr: CEFRLevel;
  turkish: string;
  english: string;
  grammarTip: string;
}

const PUNCTUATION_SET = new Set(['.', ',', '?', '!', ';', ':']);

export const MAX_LEVEL = 6;
export const MAX_LIVES = 6;
export const STAGE_SIZE = 15;

export function normalizeEnglish(english: string): string {
  const normalized = english.replace(/’/g, "'").trim();
  return /[.?!]$/.test(normalized) ? normalized : `${normalized}.`;
}

export function tokenizeSentence(english: string): string[] {
  const withEnding = normalizeEnglish(english);
  const tokens = withEnding.match(/[\p{L}\p{N}'-]+|[.,?!;:]/gu);
  return tokens ?? [withEnding];
}

export function joinWordTokens(tokens: string[]): string {
  let result = '';
  for (const token of tokens) {
    if (PUNCTUATION_SET.has(token)) {
      result += token;
    } else if (result.length === 0) {
      result = token;
    } else {
      result += ' ' + token;
    }
  }
  return result;
}

export function stripPunctuationAndCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,?!;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function shufflePool<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function hydrateEntries(rawItems: RawSentenceItem[]): SentenceEntry[] {
  return rawItems.map((item) => {
    const english = normalizeEnglish(item.english);
    return {
      ...item,
      english,
      wordPool: tokenizeSentence(english),
    };
  });
}

export const STARTER_SENTENCES: SentenceEntry[] = hydrateEntries([
  {
    id: 'starter-a1',
    level: 1,
    cefr: 'A1',
    turkish: 'Mutluyum.',
    english: 'I am happy.',
    grammarTip: 'İngilizce temel dizilimde Özne + Fiil + Nesne sırasını takip et.',
  },
  {
    id: 'starter-a2',
    level: 2,
    cefr: 'A2',
    turkish: 'Dün evde çalıştım.',
    english: 'I worked at home yesterday.',
    grammarTip: 'Düzenli fiiller geçmiş zamanda -ed takısı alır.',
  },
  {
    id: 'starter-b1',
    level: 3,
    cefr: 'B1',
    turkish: 'Beni aradığında kitap okuyordum.',
    english: 'I was reading a book when you called me.',
    grammarTip: 'Past Continuous devam eden eylemi, "when + V2" ise kesen olayı anlatır.',
  },
  {
    id: 'starter-b2',
    level: 4,
    cefr: 'B2',
    turkish: 'Herkes ayrıldıktan sonra vardım.',
    english: 'I arrived after everyone had left.',
    grammarTip: 'Geçmişte daha önce olan eylem Past Perfect (had + V3) ile kurulur.',
  },
  {
    id: 'starter-c1',
    level: 5,
    cefr: 'C1',
    turkish: 'Yol su altında kalmıştı; bu nedenle geri döndük.',
    english: 'The road was flooded; therefore, we turned back.',
    grammarTip: '"Therefore" iki cümleyi bağlarken "; therefore," noktalama yapısını alır.',
  },
  {
    id: 'starter-c2',
    level: 6,
    cefr: 'C2',
    turkish: 'Sözlerinin diğer insanları nasıl etkileyebileceğini düşün.',
    english: 'Consider how your words might affect other people.',
    grammarTip: 'Emir cümlesi sonrası "how + özne + fiil" isim cümleciği olarak kullanılır.',
  },
]);

let cachedBank: SentenceEntry[] | null = null;

export async function loadSentenceBank(): Promise<SentenceEntry[]> {
  if (cachedBank) return cachedBank;
  const response = await fetch('/data/sentences.json');
  if (!response.ok) {
    throw new Error(`Cümle veri dosyası yüklenemedi (${response.status})`);
  }
  const raw = (await response.json()) as RawSentenceItem[];
  cachedBank = hydrateEntries(raw);
  return cachedBank;
}
