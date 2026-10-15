# Pap Kőfaragó Üzem – kegyeleti landing

Statikus weboldal: HTML, CSS és minimális vanilla JavaScript. Keretrendszer, build-lépés és szerveroldali kód nincs, a mappa tartalma változtatás nélkül kiszolgálható.

## Fájlok

```
index.html        a landing oldal
koszonjuk.html    köszönő oldal az ajánlatkérés elküldése után (noindex)
pk-landing.css    stílusok, mindkét oldal használja
pk-koszono.css    a köszönő oldal kiegészítő stílusai (a pk-landing.css után töltődik)
pk-landing.js     a landing szkriptje (videó, térkép, kivitel-előválasztás, referencia-kártyák)
assets/           képek és logók (csak a hivatkozott fájlok)
```

Minden útvonal relatív (`assets/…`, `pk-landing.css`, `pk-landing.js`), ezért az oldal domain- vagy aldomain-gyökérben és almappában is működik. A stílusok a `.pk-landing` burkoló alá vannak szervezve; a `body` alapstílusa a `pk-landing.css` elején van.

## Megtekintés helyben

Bármilyen statikus szerverrel, a mappa gyökeréből, például:

```
python -m http.server 8000
```

Utána: `http://localhost:8000/` és `http://localhost:8000/koszonjuk.html`. A `file://` megnyitás nem ajánlott, mert a beágyazott űrlap és a külső tartalmak csak http(s) alatt működnek megbízhatóan.

## Ajánlatkérő űrlap (GHL)

- Helye: `index.html`, a „Kérjen ajánlatot” szakaszban, a `.pk-ghl-form` doboz. Benne a GoHighLevel „Kőfaragás - ajánlatkérés” űrlap beágyazási kódja (iframe a `link.ugyfelszerzes.hu` címről és a `form_embed.js`), változatlanul.
- Az iframe magasságát a `form_embed.js` állítja; a bal oldali zöld panel a rács miatt mindig ugyanolyan magas.
- A kivitelkártyák és a sírkőgondozás gombjai (`data-kivitel`) az iframe címéhez `?company_size=…` paramétert fűznek, és újratöltik az űrlapot. A paraméter neve a doboz `data-kivitel-param` attribútumában van; a GHL-űrlap „Kivitel” mezőjének Query Key-e `company_size`, az opciók: Klasszikus, Egyedi, Műemléki, Karbantartás / Felújítás.
- Az űrlap ellenőrzését, a küldést és a küldés utáni átirányítást a GHL végzi. Az átirányítás célja a köszönő oldal végleges címe; ezt a GHL-űrlap beállításaiban kell megadni, amint a cím ismert.

## Külső szolgáltatások

| Szolgáltatás | Mikor töltődik | Hol |
| --- | --- | --- |
| Google Fonts (Fira Sans, Roboto Slab) | az oldal betöltésekor | mindkét oldal `<head>` része |
| GHL-űrlap (`link.ugyfelszerzes.hu`) | az oldal betöltésekor | `index.html`, ajánlatkérő szakasz |
| VEED (hero-videó) | csak a lejátszás gombra kattintva | `index.html`, `data-video-src` |
| YouTube (`youtube-nocookie.com`) | csak kattintásra, és csak ha `data-video-id` van megadva | `pk-landing.js` (jelenleg nem használt) |
| Google Térkép | csak a „Térkép megjelenítése” gombra kattintva | `index.html`, `data-map-src` |

A Google Térkép- és a Waze-útvonalgomb egyszerű link, betöltéskor nem kér le semmit.

## Élesítéskor

- A `canonical` címke és az esetleges `sitemap.xml` a végleges cím ismeretében adható hozzá; jelenleg nincs benne.
- A `koszonjuk.html` `noindex` jelölésű, keresőbe nem kerül.
