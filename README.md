# 4ayka Studio

Инди-студия разработки. Браузерные игры, геймдев-инструменты и бэкенды на Python.

## Сайт

https://krempik.github.io/4ayka-studio

## Что внутри

### Страницы
- **index.html** — главная: герой, игры, приложения, «О студии», контакты
- **blog.html** — блог про геймдев, Canvas и бэкенды (содержит правду о проектах)
- **desktop.html** — **PC Sim**: браузерный симулятор ОС с рабочим столом и терминалом
- **style.css / script.js** — тема и клиентская логика

### Игры студии
- **SLINGOR.IO** — мультиплеер на гравитационных пращах (FastAPI + WebSocket, сервер-авторитативная физика 30 Гц)
- **T-Blocks** — тетрис с боссами и павер-аппами, лидербордом и PWA
- **Dungeon of the Void** — рогалик на 100 этажей, процедурная генерация из сида

### Приложения и инструменты
- **H4ck Messenger** — E2E-мессенджер (RSA-2048 + AES-256-GCM), отдельный репозиторий
- **4ayka-kit** — генератор FastAPI-бэкендов из YAML-спеки

## Разработка

Локальный просмотр: открой `index.html` в браузере или подними статику:

```
python -m http.server 8080
```

Деплой — GitHub Pages через `.github/workflows/deploy.yml`.

## Стек

HTML5 Canvas, Vanilla JS, Python, FastAPI, WebSocket, Web Crypto API.

## Лицензия

MIT