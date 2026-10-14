# Anna's View-Master

A photographic, interactive View-Master with three swappable reels: Homebody Studios, Le Index on Substack, and Instagram. The red lever advances the film, while the selected image opens alongside the viewer.

[Open the live View-Master](https://anna-view-master.vercel.app/) · [Download the complete source and images](https://github.com/annanoellerinke/anna-view-master/archive/refs/heads/main.zip)

## Run it

Install Node.js 22 or newer, download and unzip the complete source linked above, open its folder in your terminal, and run:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. There are no third-party JavaScript dependencies to install.

```sh
npm test
npm run build
```

## Make your own

1. Edit the name, page title, and description in `public/index.html`.
2. Replace the records in `public/data/homebody.json`, `substack.json`, and `instagram.json`. Each item has an `id`, `title`, `image`, and `url`. `image` can be a path such as `/assets/my-photo.jpg` or a public HTTPS URL.
3. Put your own photographs in `public/assets/`. Use images you own or have permission to use.
4. Change the reel names and small printed captions in `public/app.js`.
5. To use your own viewer photograph, replace `public/assets/viewer-source.png` and adjust the clipping outline and viewBox in `public/index.html` to its dimensions. The approved viewer is displayed as a photographic layer; the reel above and behind it is real SVG with live images.
6. Connect your repository to Vercel. Choose **Other** as the framework, `npm run build` as the build command, and `public` as the output directory. Vercel also deploys the `/api/feed` function.

The UI font stack uses Gill Sans where available, with the bundled open-source Jost font as a fallback. The four interface labels use a bold uppercase sans serif treatment. Article titles keep the approved serif styling.

The center paper label reads **ANNA'S / POINT OF / VIEW**. Its photographic patch (`public/assets/annas-point-of-view.jpg`) was edited with the built-in image-generation tool and is clipped to the existing label window, preserving the rest of the original viewer. To personalize it, replace that patch and retain its SVG placement in `public/index.html`.

## Content and automatic updates

The bundled data makes the experience usable immediately and remains the fallback during source outages.

- **Substack:** `/api/feed` fetches the publication's `sort=top` archive and preserves that ordering. The response is cached for one hour and revalidates as visitors arrive. A failed fetch keeps the saved collection. Change `PUBLICATION` in `lib/feeds.mjs` for another publication.
- **Instagram:** the current bundle contains a saved collection of 50 posts, refreshed with the three newest visible posts on October 13, 2026. Ongoing automatic updates require an authorized Instagram professional-account connection. The account's owner must supply `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` as Vercel environment variables. These are read only by the server function; never put them in `public/` or commit them. The reader requests media and captions only, prefers video thumbnails, sorts by publication date, and links each selection directly to its Instagram post or reel using the standard `https://www.instagram.com/p/SHORTCODE/` address. The same link normalizer runs in the browser and feed reader, stripping profile prefixes, Reels routes, and tracking parameters while preserving the selected post. This avoids relying on profile-prefixed URLs during the mobile app handoff; the owner verified that Safari on iPhone opens the correct post on October 14, 2026. Android app handoff has not been device-tested. This does not publish or send anything to Instagram. Credential setup, renewal, and a live API response still need verification before claiming this connection is enabled.
- **Homebody:** 10 owner-provided photographs cover Austin, Montecito, Culver City, and Newport Beach. Every photograph opens the matching studio page. Studio names and room labels follow the supplied filenames.

The refresh can update an untouched reel immediately. Once a visitor has started exploring, incoming content waits until a reel is reloaded, so the selection does not jump unexpectedly.

`npm run refresh` saves the latest available metadata into the bundled JSON files. It preserves local image copies for unchanged items. Commit those JSON files to retain a durable updated fallback. Existing content is preserved if a source is unavailable.

## Controls

- Click the red lever or the right arrow to advance.
- Use the left arrow to return to the previous picture.
- Click a labeled spare reel to switch collections.
- Left/right keyboard arrows also advance and reverse. Touch users can swipe the viewer.
- Click the large image or the destination label to open the original site in a new tab.
- Reduced-motion preferences are respected, controls are keyboard accessible, and selection changes are announced to assistive technology.

The disc has 14 visible film windows. Longer collections reuse only a window hidden behind the casing as it crosses the back of the rotation, allowing 20 and 50-item collections without shrinking the windows.

## Project map

- `public/index.html`, `public/style.css`: composition, photographic viewer, responsive layout.
- `public/app.js`, `public/reel.js`: reel rendering, rotation, selection, and interaction.
- `lib/feeds.mjs`, `api/feed.js`: server-side public-feed fetching; private Instagram credentials stay on the server.
- `scripts/dev.mjs`: local server, including the same feed function.
- `scripts/refresh.mjs`: optional metadata snapshot refresh.
- `tests/feeds.test.mjs`: source normalization and reel-loop boundary checks.

## License

The original application code is MIT licensed. The license does not grant rights to Anna's photos, article covers, names, or third-party brand marks. Replace those when making your own version. Jost's font license is included in `public/assets/Jost-OFL.txt`.
