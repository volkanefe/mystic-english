# Mystic English — 3D İngilizce Cümle Kurma Oyunu

**Mystic English**, karanlık ve mistik bir 3D fantastik orman/antik tapınak atmosferinde geçen, **CEFR A1’den C2’ye** kadar **4.592 benzersiz İngilizce–Türkçe cümleyi** doğru kelime sırasıyla kurmaya dayalı tarayıcı tabanlı bir dil öğrenme oyunudur.

Klasik adam asmaca mekaniğindeki can sistemi, merkezdeki büyülü kristalin etrafında dönen 6 enerji parçası ve kristalin çatlama/parçalanma efektleriyle yeniden tasarlanmıştır.

---

## Öne Çıkan Özellikler

### 1. Gerçekçi 3D Fantastik Dünya (`Three.js`)
- **Mistik Tapınak ve Orman Sahnesi:** Prosedürel 3D ağaçlar, kayalar, antik sütun/sunak yapıları, rüzgârla hareket eden bitkiler, ateş böcekleri ve uzak dağ siluetleri.
- **Etkileşimli Kamera:** Fare veya dokunmatik ekranla sürükleyerek tapınak sahnesini farklı açılardan inceleyebilir, alt paneli gizleyerek (**Sahneyi İzle**) yalnızca 3D dünyayı izleyebilirsiniz.
- **Kristal Can Mekaniği (6 Can):**
  - Her yanlış cümle denemesinde 1 can eksilir, kristalde görsel çatlaklar oluşur ve ortam daha kasvetli bir hâle bürünür.
  - Son can kaldığında kritik uyarı efekti devreye girer.
  - Doğru cevaplarda kristal parlar, başarı animasyonu oynar ve puan/seri artar.
  - Canlar sıfırlandığında **Kristal Parçalandı (Game Over)** ekranı açılır.

### 2. Dinamik Hava Durumu Sistemi
Oyun sırasında hava durumu belirli aralıklarla otomatik ve yumuşak geçişlerle değişir; ayrıca üst menüden manuel olarak da değiştirilebilir:
- **Normal:** Hafif sis, sakin rüzgâr, loş gece ışığı ve ateş böcekleri.
- **Fırtına:** 3D yağmur parçacıkları, anlık şimşek çakmaları, ışık patlamaları, gök gürültüsü sesleri ve artan rüzgâr/sis yoğunluğu.
- **Güneşli:** Bulutların arasından süzülen hacimsel güneş ışınları, aydınlanan çevre ve dağılan sis.

### 3. 4.592 Cümlelik CEFR Veri Seti ve Tekrarsız Tur Sistemi
- Tüm cümleler harici JSON veri dosyasından (`public/data/sentences.json`) yüklenir.
- **CEFR Seviye Dağılımı (Toplam 4.592 Benzersiz Cümle):**
  | Seviye | CEFR | Tapınak Bölümü | Cümle Sayısı |
  | :---: | :---: | :--- | ---: |
  | 1 | **A1** | Sisli Eşik — Temel Cümleler ve Geniş Zaman | 994 |
  | 2 | **A2** | Kadim Patika — Geçmiş, Gelecek ve Karşılaştırma | 1.910 |
  | 3 | **B1** | Rün Tapınağı — Present Perfect, Kipler ve Koşullar | 626 |
  | 4 | **B2** | Fırtına Sunağı — Edilgen Çatı, Past Perfect ve Phrasal Verbs | 479 |
  | 5 | **C1** | Gölge Kütüphanesi — Bağlaçlar, Nüans ve Akademik İfadeler | 378 |
  | 6 | **C2** | Ebedi Kristal — İleri Anlatım, Perspektif ve İfade Zenginliği | 205 |
- **Tekrarsız 15 Cümlelik Turlar:** Her turda ilgili CEFR seviyesinden çözülmemiş 15 cümle rastgele seçilir. Doğru çözülen hiçbir cümle o seviyedeki tüm cümleler bitene kadar tekrar sorulmaz.
- **Katı Doğrulama & İpucu:** Büyük/küçük harf ve noktalama işaretleri (`.`, `,`, `?`, `!`, `;`, `:`) kontrol edilir; yalnızca noktalama/büyük harf hatası yapıldığında özel uyarı verilir. Her cümlede isteğe bağlı Türkçe **Dilbilgisi İpucu** bulunur.
- **Kalıcı İlerleme:** Seviye, puan, rekor, seri, çözülen cümle kimlikleri ve ses tercihleri tarayıcıda (`localStorage`) saklanır.

### 4. Prosedürel Ses ve Arka Plan Müziği (`Web Audio API`)
Harici ses dosyalarına ihtiyaç duymadan tarayıcı içinde gerçek zamanlı olarak sentezlenir:
- **4 Müzik Modu:**
  - **Dinlendirici** (*Orman Huzuru* — 68 BPM, arp & yumuşak pad)
  - **Motive** (*Kristal Işığı* — 88 BPM, kalimba & akıcı melodi)
  - **Odak** (*Gece Yıldızı* — 74 BPM, sıcak piyano/çan dokusu)
  - **Müzik Yok** (Yalnızca ortam ve efekt sesleri)
- **Atmosfer ve Efektler:** Rüzgâr, yağmur, gök gürültüsü, şimşek, kelime yerleştirme/geri alma, doğru cevap, kristal çatlaması, seviye tamamlama ve oyun sonu sesleri.

---

## Kontroller

| Eylem | Fare / Dokunmatik | Klavye |
| :--- | :--- | :--- |
| Kelime ekleme | Kelime kartına tıkla veya üst alana sürükle | — |
| Kelime sırası değiştirme | Yerleştirilen kelimeleri sürükleyip bırak | — |
| Kelime geri alma | Yerleştirilen kelimeye tıkla veya **Geri Al** | `Backspace` |
| Tümünü temizleme | **Temizle** düğmesi | — |
| Cümleyi kontrol etme | **Kontrol Et** düğmesi | `Enter` |
| 3D sahneyi döndürme | Sahne üzerinde sürükle | — |

---

## Kullanılan Teknolojiler

- **Çekirdek:** React 19, TypeScript, Vite 8
- **3D Grafik:** Three.js
- **Stil & İkonlar:** Tailwind CSS v4, Lucide React
- **Ses Motoru:** Web Audio API (prosedürel sentez, stereo yankı ve dinamik kompresör)

---

## Proje Yapısı

```text
├── public/
│   └── data/
│       └── sentences.json       # 4.592 adet CEFR (A1–C2) İngilizce–Türkçe cümle verisi
├── src/
│   ├── audio/
│   │   └── SoundEngine.ts       # Prosedürel arka plan müzikleri, atmosfer ve SFX motoru
│   ├── components/
│   │   ├── GameModal.tsx        # Seviye seçimi, tur sonu ve Game Over pencereleri
│   │   ├── MysticCanvas.tsx     # Three.js sahne bağlayıcısı ve kamera etkileşimi
│   │   ├── SentenceDock.tsx     # Sürükle-bırak / dokunmatik cümle kurma paneli
│   │   └── TopHud.tsx           # Üst bilgi çubuğu, can kristalleri, hava ve müzik kontrolleri
│   ├── data/
│   │   └── sentences.ts         # JSON veri yükleyici, tokenizasyon ve seviye metaverileri
│   ├── scene/
│   │   ├── MysticWorldEngine.ts # 3D dünya, kristal animasyonları ve aydınlatma döngüsü
│   │   ├── WeatherSystem.ts     # Normal, Fırtına ve Güneşli hava durumu geçişleri
│   │   ├── proceduralModels.ts  # Prosedürel ağaç, kaya, tapınak ve kristal geometrileri
│   │   └── textures.ts          # Prosedürel yüzey dokuları
│   ├── types/
│   │   └── game.ts              # Ortak TypeScript arayüzleri ve tipleri
│   ├── utils/
│   │   └── storage.ts           # localStorage tabanlı ilerleme ve ayar yönetimi
│   ├── App.tsx                  # Ana oyun durumu ve tur akışı
│   └── main.tsx                 # Uygulama giriş noktası
├── index.html
├── package.json
└── vite.config.ts
```

---

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ ve npm

### Adımlar

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın (http://localhost:3000)
npm run dev
```

### Diğer Komutlar

```bash
# Tür denetimi (TypeScript)
npm run lint

# Üretim (production) derlemesi oluşturma
npm run build

# Derlenen uygulamayı önizleme
npm run preview
```
