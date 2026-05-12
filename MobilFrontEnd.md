# Mobil Frontend Görev Dağılımı (CodeBlooms)

Bu dokümanda, CodeBlooms mobil uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan ekranların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Mobil Frontend Görevleri

1. [Sedef Gizem Orulluoğlu'nun Mobil Frontend Görevleri](./Sedef-Gizem-Orulluoglu/Sedef-Gizem-Orulluoglu-Mobil-Frontend-Gorevleri.md)
2. [Eda Gögebakan'ın Mobil Frontend Görevleri](./Eda-Gogebakan/Eda-Gogebakan-Mobil-Frontend-Gorevleri.md)

---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi
* **Renk Paleti:** Tutarlı ve floral konsepte uygun renk kullanımı (primary, secondary, error, success).
* **Tipografi:** Okunabilir font boyutları ve ağırlıkları (Estetik ve modern font aileleri).
* **Spacing:** Tutarlı padding ve margin değerleri (8dp/8pt grid sistemi).
* **Iconography:** Standart icon seti kullanımı (Material Icons / SF Symbols).

### 2. Responsive Tasarım
* Farklı ekran boyutlarına uyum (phone, tablet).
* Landscape ve portrait mod desteği.
* Safe area desteği (notch, status bar).

### 3. Kullanıcı Deneyimi (UX)
* **Loading States:** Skeleton screens, progress indicators.
* **Error Handling:** Kullanıcı dostu hata mesajları.
* **Empty States:** Boş durumlar için bilgilendirici mesajlar (Örn: "Sepetiniz Boş").
* **Feedback:** Kullanıcı aksiyonlarına anında geri bildirim (toast, snackbar, haptic feedback).

### 4. Erişilebilirlik (Accessibility)
* Content descriptions ve labels kullanımı.
* Touch target boyutları (min 44x44dp/pt).
* Screen reader desteği.
* Yüksek kontrast modu ve font scaling desteği.

### 5. Performans
* Lazy loading (liste ve ürün görünümleri için sonsuz kaydırma).
* Image optimization ve caching (Çiçek görsellerinin hızlı yüklenmesi için).
* Smooth animations (60 FPS hedefi, React Native Reanimated kullanımı).
* Memory management.

### 6. Navigasyon
* Tutarlı navigation pattern (Bottom navigation, stack navigation).
* Deep linking desteği.
* Back button handling (Android donanımsal geri tuşu yönetimi).
* Navigation state yönetimi.

### 7. Form Yönetimi
* Real-time validation (Anlık doğrulama).
* Error mesajlarının alan altında gösterilmesi.
* Keyboard handling (dismiss, next field focus, klavye açıldığında ekranın kayması).
* Form state persistence.

### 8. Platform Özellikleri
* **Android:** Material Design 3 guidelines.
* **iOS:** Human Interface Guidelines.
* Platform-specific UI patterns kullanımı ve native feel sağlanması.