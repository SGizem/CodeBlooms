# Mobil Frontend Görev Dağılımı (CodeBlooms)

Bu dokümanda, CodeBlooms mobil uygulamasının ekran tasarımları, kullanıcı etkileşimleri ve sayfa yönlendirmeleri ile ilgili görev paylaşımı listelenmektedir.

---

## Grup Üyelerinin Mobil Frontend Görevleri

Uygulamamızın arayüz geliştirme süreci iki ana parçaya bölünmüştür:
1. [Sedef Gizem Orulluoğlu'nun Mobil Frontend Görevleri](./Sedef-Gizem-Orulluoglu/Sedef-Gizem-Orulluoglu-Mobil-Frontend-Gorevleri.md) *(Mobil altyapının kurulması, Giriş/Kayıt ekranları ve Ana Ürün Listeleme sayfası)*
2. [Eda Gögebakan'ın Mobil Frontend Görevleri](./Eda-Gogebakan/Eda-Gogebakan-Mobil-Frontend-Gorevleri.md) *(Sepet yönetimi, detaylı Ürün Sayfası tasarımı ve Sipariş Takip ekranları)*

---

## Genel Mobil Frontend Prensipleri

Projeyi geliştirirken ekranların düzgün çalışması ve göze hitap etmesi için aşağıdaki temel prensipleri uyguladık:

### 1. Görsel Tasarım ve Tema
* **Renk Uyumu:** Projemizin konseptine uygun, göz yormayan ve birbirleriyle tutarlı renkler tercih edildi.
* **Düzen (Layout):** Butonlar, resimler ve yazılar arasında dengeli boşluklar bırakılarak ekranın karmaşık görünmesi engellendi.

### 2. Kullanıcı Deneyimi (UX)
* **Klavye Yönetimi:** Kullanıcı form doldururken (örneğin giriş yaparken) klavye açıldığında, ekranın yukarı kayması sağlandı (KeyboardAvoidingView). Böylece yazılan yer klavyenin altında kalmıyor.
* **Yükleme Durumları:** Sayfa geçişlerinde veya arka planda bir işlem yapılırken ekranda "Yükleniyor (Loading)" animasyonları gösterilerek kullanıcının beklemesi sağlandı.
* **Hata ve Uyarı Mesajları:** Yanlış şifre girildiğinde veya sepet boş olduğunda kullanıcıyı yönlendiren net uyarı yazıları eklendi.

### 3. Ekran Uyumluluğu ve Performans
* Liste şeklindeki veriler (örneğin ana sayfadaki ürünler) ekrana yavaş yavaş ve performansı düşürmeden getirildi (FlatList kullanımı).
* Farklı telefon boyutlarında tasarımların bozulmaması için esnek yapılar kullanıldı.

### 4. Sayfalar Arası Geçiş (Navigasyon)
* Uygulama içindeki ileri-geri gitme işlemleri ve alt menü (Tab bar) geçişleri React Navigation kullanılarak pürüzsüz hale getirildi.