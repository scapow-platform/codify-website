# Codify website

Static site for [Codify](mailto:hello@codify-technology.com) — product & software development, makers of Scapow.

No build step: plain HTML, CSS and JS.

```
index.html     page content
styles.css     styles
script.js      nav, scroll reveals, hero animation
assets/        logo variants and favicons
.nojekyll      tells GitHub Pages to serve files as-is
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. The site goes live at `https://<user>.github.io/<repo>/` within a minute or two.

### Custom domain (optional)

Add a `CNAME` file at the repo root containing your domain (e.g. `codify-technology.com`), set the same domain under **Settings → Pages → Custom domain**, and point your DNS at GitHub Pages.
