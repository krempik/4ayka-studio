# 4ayka Studio

Инди-студия разработки. Браузерные игры, геймдев-инструменты и бэкенды на Python.

## Сайт

https://krempik.github.io/4ayka-studio

## Что внутри

### Страницы
- **index.html** — главная: герой, игры, приложения, «О студии», контакты
- **blog/** — блог про геймдев, Canvas и бэкенды (одна страница на пост — `blog/<slug>.html`)
- **games/** — детальные страницы игр: обложка, управление, стек, ссылки на игру и репозиторий
- **desktop.html** — **PC Sim**: браузерный симулятор ОС с рабочим столом и терминалом
- **404.html**, **robots.txt**, **sitemap.xml** — на месте
- **manifest.webmanifest + sw.js** — PWA: сайт ставится на рабочий стол и работает офлайн

### Игры студии
- **SLINGOR.IO** — мультиплеер на гравитационных пращах (FastAPI + WebSocket, сервер-авторитативная физика 30 Гц)
- **T-Blocks** — тетрис с боссами и павер-аппами, лидербордом и PWA
- **Dungeon of the Void** — рогалик на 100 этажей, процедурная генерация из сида

### Приложения и инструменты
- **Frendo** — E2E-мессенджер (RSA-2048 + AES-256-GCM), отдельный репозиторий
- **4ayka-kit** — генератор FastAPI-бэкендов из YAML-спеки

## Генерация статики

`blog/` и `games/` собираются скриптами — правь только источники, не вывод:

```powershell
# Sources: content/posts/<slug>.html, content/games/<slug>.html
# (первая строка файла — JSON-метаданные в <!--meta ... -->)
python tools/build_site.py     # -> blog/, games/, blog.html (редирект), sitemap.xml
python tools/make_images.py    # -> img/ (og-превью, иконки, обложки игр)
```

`site.js` — общий код всех страниц (тема с `prefers-color-scheme` и
синхронизацией между вкладками, навбар, звёздный фон, живые версии из репозиториев,
service worker). `script.js` — только поведение главной (типограф, reveal-анимации,
живая статистика GitHub, контактная форма с fallback при заблокированном поп-апе).

## Разработка

Локальный просмотр:

```
python -m http.server 8080
```

> Открывать `index.html` файлом можно, но PWA/офлайн-режим и `localStorage`
> работают только через http://.

Деплой — GitHub Pages через `.github/workflows/deploy.yml`.

## Стек

HTML5 Canvas, Vanilla JS, Python, FastAPI, WebSocket, Web Crypto API, Pillow (только для генерации картинок).

## Лицензия

MIT