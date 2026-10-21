export default function Terms() {
  return (
    <main className="legal-page">
      <a href="/">← Back to My Quran</a>
      <h1>Terms of use</h1>
      <p>
        My Quran provides an independent reading and listening experience. It is
        inspired by Quran.com and is not an official Quran.com or Quran
        Foundation product.
      </p>
      <h2>Sources and attribution</h2>
      <p>
        Quran data provided by Quran.Foundation. Arabic text, QCF V2 glyph data,
        fonts, translations, tafsir, and audio are retrieved from the provider’s
        API and documented content servers. Rights remain with the original
        providers and contributors.
      </p>
      <p>
        Malay translation: Abdullah Muhammad Basmeih. English: Saheeh
        International. Indonesian: Indonesian Islamic Affairs Ministry. Tafsir:
        Ibn Kathir (Abridged), English. The selected reciter is identified in
        the audio player. Word learning audio may use a separate teaching
        recitation.
      </p>
      <h2>Content integrity</h2>
      <p>
        The application displays source Quran text without generating or
        rewriting it. Translation and tafsir are attributed interpretations
        supplied by their authors. Word timings come from the selected
        recording’s metadata; missing timings are not estimated. If a font
        cannot load, the reader uses the official Uthmanic Hafs representation
        and reports a loading failure when necessary.
      </p>
      <h2>Permitted use</h2>
      <p>
        Use this reader for personal reading, listening, and study. Do not use
        the application to bulk extract, redistribute, sell, or create a
        separate data feed from provider content. The provider’s{" "}
        <a
          href="https://api-docs.quran.foundation/legal/developer-terms/"
          target="_blank"
          rel="noreferrer"
        >
          Developer Terms
        </a>{" "}
        govern the integration and content use. API availability and permissions
        may change.
      </p>
      <h2>Availability and corrections</h2>
      <p>
        Internet access is needed for new Quran content, fonts, and audio.
        External services may be temporarily unavailable. Please report display
        or synchronization issues to the site owner through the channel where
        this private reader was shared. Compare questionable passages with the
        original source; the app does not provide religious rulings.
      </p>
      <h2>Privacy</h2>
      <p>
        See the <a href="/privacy">privacy policy</a> for local bookmarks,
        preferences, reading history, and external requests.
      </p>
    </main>
  );
}
