# Hesaplama Araçları

Günlük ve eğitim amaçlı hesaplamaları tarayıcıda, reklamsız ve sunucusuz yapan basit web araçları. Orijinali Python/Tkinter ile yazılmış masaüstü uygulamalarının statik web sürümüdür.

🔗 **Canlı site:** [yusuf-bayraktar.github.io/mytools](https://yusuf-bayraktar.github.io/mytools/)

## Araçlar

| Araç | Açıklama |
|---|---|
| 🌡️ [Termometre Dönüşümü](tools/temperature.html) | Celsius, Fahrenheit, Kelvin ve kullanıcı tanımlı ölçekler arasında sıcaklık dönüşümü yapar. |
| ∑ [Ağırlıklı Not Ortalaması](tools/grade-average.html) | Ders saatlerine göre ağırlıklandırılmış not ortalaması hesaplar. |
| ≈ [Denge Sıcaklığı](tools/equilibrium-temperature.html) | Farklı kütle, öz ısı ve başlangıç sıcaklığına sahip maddelerin karışımından oluşacak denge sıcaklığını hesaplar. |

## Özellikler

- **Sunucu yok, backend yok.** Tüm hesaplamalar tarayıcıda, vanilla JavaScript ile yapılır.
- **Kalıcı özel veriler.** Kullanıcının eklediği özel termometre ölçeği, ders veya madde `localStorage` üzerinden aynı tarayıcıda saklanır.
- **Form doğrulama.** Boş alan, geçersiz sayı, sıfıra bölme ve tutarsız değer (ör. donma noktası = kaynama noktası) durumları kontrol edilip kullanıcıya anlaşılır hata mesajı gösterilir.
- **Mobil uyumlu.** Harici framework kullanılmadan sade ve responsive bir arayüz.

## Proje yapısı

```
.
├── index.html                          # Ana sayfa, araç listesi
├── tools/                              # Her araç için ayrı sayfa
│   ├── temperature.html
│   ├── grade-average.html
│   └── equilibrium-temperature.html
├── assets/
│   ├── css/site.css                    # Ortak stil
│   └── js/
│       ├── common.js                   # Ortak header/footer
│       ├── temperature.js
│       ├── grade-average.js
│       └── equilibrium-temperature.js
└── data/                               # Varsayılan veri kümeleri
    ├── thermometers.json
    ├── courses.json
    └── materials.json
```

## Yerelde çalıştırma

Veri dosyaları `fetch()` ile yüklendiği için sayfaları doğrudan çift tıklayarak (`file://`) açmak çalışmaz; basit bir yerel sunucu üzerinden çalıştırmak gerekir:

```bash
# Proje klasöründe
python -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresini aç.

## Dağıtım

Site, GitHub Pages üzerinden statik olarak yayınlanır. `main` branch'e yapılan her push otomatik olarak canlıya yansır (Settings → Pages → Source: `main`).

## Katkı / geliştirme fikirleri

- Yeni bir hesaplama aracı eklemek için `tools/` altına yeni bir HTML sayfası ve `assets/js/` altına ilgili mantığı ekleyip `index.html`'e kart olarak eklemek yeterli.
- Ortak tasarım `assets/css/site.css` üzerinden yönetilir.

## Lisans

Bu proje kişisel kullanım ve öğrenme amacıyla paylaşılmıştır.
