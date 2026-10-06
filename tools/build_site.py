#!/usr/bin/env python3
"""Static page generator for 4ayka Studio.

Sources (single source of truth):
  content/posts/<slug>.html   <!--meta {json} --> + body markup
  content/games/<slug>.html   <!--meta {json} --> + body markup

Outputs:
  blog/index.html, blog/<slug>.html   blog listing + one page per post
  games/<slug>.html                   one page per game
  blog.html                           legacy redirect -> blog/
  sitemap.xml

Run:  python tools/build_site.py
"""
from __future__ import annotations

import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://krempik.github.io/4ayka-studio"
META_RE = re.compile(r"^<!--meta\s*(\{[\s\S]*?\})\s*-->\s*", re.M)

FAVICON = (
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
    "<rect width='100' height='100' rx='22' fill='%230b0e1a'/>"
    "<text x='50' y='74' font-size='62' text-anchor='middle' fill='%2322d3ee' "
    "font-family='monospace' font-weight='bold'>4</text></svg>"
)

NAV_LINKS = [
    ("home", "Главная", "index.html#home"),
    ("games", "Игры", "index.html#games"),
    ("apps", "Приложения", "index.html#apps"),
    ("about", "О студии", "index.html#about"),
    ("blog", "Блог", "blog/"),
    ("desktop", "PC Sim", "desktop.html"),
    ("contact", "Контакты", "index.html#contact"),
]


def read_source(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    m = META_RE.match(text)
    if not m:
        raise SystemExit(f"{path}: missing <!--meta {{...}} --> header")
    meta = json.loads(m.group(1))
    body = text[m.end():].strip()
    if not body:
        raise SystemExit(f"{path}: empty body")
    return meta, body


def rewrite_links(body: str, prefix: str) -> str:
    """Post bodies are written for the site root; move them into a subdir."""
    body = body.replace('href="index.html', f'href="{prefix}index.html')
    body = body.replace('href="blog.html"', f'href="{prefix}blog/"')
    for slug in re.findall(r'data-same="(\w+)"', body):
        body = re.sub(
            rf'<a href="[^"]*" data-same="{slug}">([^<]*)</a>',
            rf'<a href="{prefix}blog/{slug}.html">\1</a>',
            body,
        )
    return body


def nav_html(prefix: str, active: str) -> str:
    items = []
    for key, label, href in NAV_LINKS:
        cls = ' class="active"' if key == active else ""
        items.append(f'<li><a href="{prefix}{href}"{cls}>{label}</a></li>')
    return f"""    <nav class="nav" id="nav">
        <a href="{prefix}index.html" class="logo">4ayka<span>studio</span></a>
        <ul class="nav-links" id="nav-links">
{chr(10).join('            ' + i for i in items)}
        </ul>
        <div class="nav-meta">
            <button class="theme-toggle" id="theme-toggle" title="Сменить тему" aria-label="Сменить тему" aria-pressed="false">&#9789;</button>
            <button class="burger" id="burger" aria-label="Меню" aria-controls="nav-links" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
    </nav>"""


def page(
    *,
    title: str,
    description: str,
    path: str,
    og_type: str,
    main: str,
    prefix: str,
    active: str,
    ld: dict | list | None,
) -> str:
    url = f"{BASE}/{path}" if path else BASE
    esc = html.escape
    ld_html = ""
    if ld is not None:
        ld_html = (
            '    <script type="application/ld+json">'
            + json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
            + "</script>\n"
        )
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)}</title>
    <meta name="description" content="{esc(description)}">
    <meta name="author" content="4ayka Studio">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(description)}">
    <meta property="og:type" content="{og_type}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{BASE}/img/og.png">
    <meta property="og:site_name" content="4ayka Studio">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{esc(title)}">
    <meta name="twitter:description" content="{esc(description)}">
    <meta name="twitter:image" content="{BASE}/img/og.png">
    <link rel="canonical" href="{url}">
    <link rel="stylesheet" href="{prefix}style.css">
    <link rel="icon" href="{FAVICON}">
    <link rel="apple-touch-icon" href="{prefix}img/apple-touch-icon.png">
    <link rel="manifest" href="{prefix}manifest.webmanifest">
    <meta name="theme-color" content="#0b0e1a">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
    <script src="{prefix}site.js"></script>
{ld_html}</head>
<body>
    <a class="skip-link" href="#content">К содержимому</a>
{nav_html(prefix, active)}

    <main id="content">
{main}
    </main>

    <footer class="footer">
        <div class="container">
            <p class="footer-name">4AYKA STUDIO &middot; 2026</p>
            <p class="footer-meta">сделано в одиночку, с любовью к коду</p>
        </div>
    </footer>
</body>
</html>
"""


def render_blog(posts: list[dict]) -> list[Path]:
    written = []
    for p in posts:
        body = rewrite_links(p["body"], "../")
        ld = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": p["title"],
            "description": p["lead"],
            "datePublished": p["date"],
            "inLanguage": "ru",
            "mainEntityOfPage": f"{BASE}/blog/{p['slug']}.html",
            "author": {"@type": "Organization", "name": "4ayka Studio", "url": BASE},
            "publisher": {"@type": "Organization", "name": "4ayka Studio", "url": BASE},
            "image": f"{BASE}/img/og-blog.png",
        }
        idx = posts.index(p)
        newer = posts[idx - 1] if idx > 0 else None
        older = posts[idx + 1] if idx + 1 < len(posts) else None
        nav = ['<nav class="post-nav">']
        if older:
            nav.append(
                f'<a href="{older["slug"]}.html" rel="prev">&larr; {html.escape(older["title"])}</a>'
            )
        else:
            nav.append("<span></span>")
        if newer:
            nav.append(
                f'<a href="{newer["slug"]}.html" rel="next">{html.escape(newer["title"])} &rarr;</a>'
            )
        nav.append("</nav>")
        tags = ", ".join(p["tags"])
        main = f"""        <article class="section page-section">
            <div class="container">
                <a class="back-btn" href="index.html">&larr; ко всем постам</a>
                <article class="post-full">
                    <h1>{html.escape(p["title"])}</h1>
                    <p class="subtitle">{p["date"]} | {tags}</p>
                    {body}
                </article>
                {chr(10).join('                ' + n for n in nav).strip()}
            </div>
        </article>"""
        out = ROOT / "blog" / f"{p['slug']}.html"
        out.write_text(
            page(
                title=f"{p['title']} | 4ayka Studio",
                description=p["lead"],
                path=f"blog/{p['slug']}.html",
                og_type="article",
                main=main,
                prefix="../",
                active="blog",
                ld=ld,
            ),
            encoding="utf-8",
        )
        written.append(out)

    cards = []
    for i, p in enumerate(posts):
        tags = "".join(
            f'<span class="tag{" tag-new" if i == 0 and j == 0 else ""}">{t}</span>'
            for j, t in enumerate(p["tags"])
        )
        cards.append(
            f"""                <a class="post-card" href="{p['slug']}.html">
                    <span class="post-meta">
                        <span class="post-date">{p['date']}</span>
                        {tags}
                    </span>
                    <h2>{html.escape(p['title'])}</h2>
                    <p>{html.escape(p['lead'])}</p>
                </a>"""
        )
    ld = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Блог 4ayka Studio",
        "description": "Про геймдев, браузерные игры, E2E-шифрование и инструменты разработчика.",
        "url": f"{BASE}/blog/",
        "inLanguage": "ru",
        "author": {"@type": "Organization", "name": "4ayka Studio", "url": BASE},
        "blogPost": [
            {
                "@type": "BlogPosting",
                "headline": p["title"],
                "datePublished": p["date"],
                "url": f"{BASE}/blog/{p['slug']}.html",
            }
            for p in posts
        ],
    }
    main = f"""        <section class="section page-section">
            <div class="container">
                <h1 class="blog-title">Блог</h1>
                <p class="blog-sub">// про геймдев, браузерные игры и инструменты разработчика</p>
                <div class="blog-list">
{chr(10).join(cards)}
                </div>
            </div>
        </section>"""
    out = ROOT / "blog" / "index.html"
    out.write_text(
        page(
            title="Блог | 4ayka Studio",
            description="Блог 4ayka Studio — про геймдев, браузерные игры, E2E-шифрование и инструменты разработчика.",
            path="blog/",
            og_type="website",
            main=main,
            prefix="../",
            active="blog",
            ld=ld,
        ),
        encoding="utf-8",
    )
    written.append(out)
    return written


def render_games(games: list[dict]) -> list[Path]:
    written = []
    for g in games:
        body = rewrite_links(g["body"], "../")
        ld = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": g["title"],
            "description": g["lead"],
            "applicationCategory": "GameApplication",
            "operatingSystem": "Any (web browser)",
            "url": g["play"],
            "image": f"{BASE}/img/{g['cover']}",
            "inLanguage": "ru",
            "author": {"@type": "Organization", "name": "4ayka Studio", "url": BASE},
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        }
        tags = "".join(f'<span class="tag">{t}</span>' for t in g["tags"])
        related = ""
        if g.get("related_post"):
            related = (
                f'<p class="page-note">Подробнее в блоге: '
                f'<a href="../blog/{g["related_post"]}.html">{html.escape(g.get("related_title", g["title"]))}</a></p>'
            )
        main = f"""        <section class="section page-section">
            <div class="container">
                <a class="back-btn" href="../index.html#games">&larr; все игры</a>
                <div class="game-head">
                    <img class="game-cover" src="../img/{g['cover']}" alt="{html.escape(g['title'])} — обложка" width="1280" height="720" loading="lazy">
                    <div class="game-head-body">
                        <div class="post-meta">{tags}</div>
                        <h1 class="game-title">{html.escape(g['title'])}</h1>
                        <p class="game-lead">{html.escape(g['lead'])}</p>
                        <div class="game-actions">
                            <a class="btn btn-primary" href="{g['play']}" target="_blank" rel="noopener">Играть</a>
                            <a class="btn btn-ghost" href="{g['repo']}" target="_blank" rel="noopener">Репозиторий</a>
                            <span class="version" id="{g['version_id']}">{g.get('version_hint', '')}</span>
                        </div>
                    </div>
                </div>
                {body}
                {related}
            </div>
        </section>"""
        out = ROOT / "games" / f"{g['slug']}.html"
        out.write_text(
            page(
                title=f"{g['title']} — браузерная игра | 4ayka Studio",
                description=g["lead"],
                path=f"games/{g['slug']}.html",
                og_type="website",
                main=main,
                prefix="../",
                active="games",
                ld=ld,
            ),
            encoding="utf-8",
        )
        written.append(out)
    return written


def render_redirect() -> Path:
    out = ROOT / "blog.html"
    out.write_text(
        """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Блог | 4ayka Studio</title>
    <meta http-equiv="refresh" content="0; url=blog/">
    <link rel="canonical" href="https://krempik.github.io/4ayka-studio/blog/">
    <script>location.replace('blog/');</script>
</head>
<body>
    <p><a href="blog/">Блог 4ayka Studio</a></p>
</body>
</html>
""",
        encoding="utf-8",
    )
    return out


def render_sitemap(posts: list[dict], games: list[dict]) -> Path:
    urls = [
        ("", None),
        ("blog/", None),
        ("desktop.html", None),
    ] + [(f"blog/{p['slug']}.html", p["date"]) for p in posts] + [
        (f"games/{g['slug']}.html", None) for g in games
    ]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, mod in urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{BASE}/{path}</loc>")
        if mod:
            lines.append(f"    <lastmod>{mod}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    out = ROOT / "sitemap.xml"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out


def main() -> None:
    posts = []
    for f in sorted((ROOT / "content" / "posts").glob("*.html")):
        meta, body = read_source(f)
        meta["body"] = body
        posts.append(meta)
    posts.sort(key=lambda p: p["date"], reverse=True)

    games = []
    for f in sorted((ROOT / "content" / "games").glob("*.html")):
        meta, body = read_source(f)
        meta["body"] = body
        games.append(meta)

    (ROOT / "blog").mkdir(exist_ok=True)
    (ROOT / "games").mkdir(exist_ok=True)

    written = render_blog(posts) + render_games(games)
    written += [render_redirect(), render_sitemap(posts, games)]
    print(f"generated {len(written)} files:")
    for w in written:
        print("  ", w.relative_to(ROOT))


if __name__ == "__main__":
    main()
