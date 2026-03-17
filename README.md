# KNGL RP – All Streamers

## 🚀 GitHub Pages'e Yükleme

1. GitHub'da **public** bir repository oluştur
2. Bu 4 dosyayı yükle: `index.html`, `style.css`, `app.js`, `streamers.js`
3. **Settings → Pages → Deploy from branch → main / root → Save**
4. `https://KULLANICI.github.io/REPO_ADI` adresinde açılır

---

## ✏️ Yayıncı Eklemek

Sadece **`streamers.js`** dosyasını aç, `STREAMERS` dizisine yeni obje ekle:

```javascript
{
  id:          "benzersiz-id",
  channelName: "KanalAdı",
  character:   "RP Karakter Adı",
  platform:    "twitch",           // "twitch" | "youtube" | "kick"
  channelId:   "kullanici_adi",    // URL'deki kullanıcı adı kısmı
  profileUrl:  "https://twitch.tv/kullanici_adi",
  avatar:      "",                 // Profil fotoğrafı (boş olabilir)
  role:        "Polis Memuru",
}
```

**`CONTACT_EMAIL`** değişkenine kendi mail adresini yaz — Bildir formu oraya gider.

---

## 📁 Dosyalar

| Dosya | Ne işe yarar |
|-------|-------------|
| `index.html` | Sayfa yapısı |
| `style.css` | Tasarım |
| `app.js` | Mantık & API çağrıları |
| `streamers.js` | **Yayıncı listesi — sadece bunu düzenle** |

---

## 🔴 Twitch API (opsiyonel)

İzleyici sayısı göstermek için `app.js` en altına ekle:
```javascript
const TWITCH_CLIENT_ID = 'buraya_client_id';
const TWITCH_TOKEN     = 'buraya_token';
```
[dev.twitch.tv](https://dev.twitch.tv) üzerinden ücretsiz alınır.
