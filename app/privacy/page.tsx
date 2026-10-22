export default function Privacy() {
  return (
    <main className="legal-page">
      <a href="/">← Back to My Quran</a>
      <h1>Privacy policy</h1>
      <p>
        My Quran is an independent Quran reading website. It stores your reading
        preferences, bookmarks, and last-read verse in LocalStorage on your
        device. It does not create a Quran Foundation user account or request
        your Quran Foundation personal data.
      </p>
      <h2>Your device and your choices</h2>
      <p>
        Saved information stays in this browser and is not synchronized between
        devices. You can remove individual bookmarks in the reader. To delete
        all saved information, clear this website’s site data using your browser
        settings. If browser storage is unavailable, the reader keeps
        preferences only for the current visit.
      </p>
      <h2>Content requests</h2>
      <p>
        Reading requests, searches, and verse references are sent to this
        website’s server and to Quran Foundation/Quran.com to provide text,
        translations, timings, and tafsir. Fonts, recitation, and word audio
        load from Quran Foundation’s content servers. These providers and the
        hosting service may process connection information such as IP addresses
        and request metadata for delivery and security. The app does not add
        advertising trackers or send your bookmarks to these providers.
      </p>
      <h2>Retention</h2>
      <p>
        Your saved browser data remains until you delete it. Quran content
        responses are cached temporarily: up to one hour in the application
        server and five minutes in the reader’s request cache. This app does not
        create an offline Quran database or store recitations for offline
        playback.
      </p>
      <h2>Hosting and access</h2>
      <p>
        This deployment is private to its owner. The hosting platform may
        require sign-in and process account information to control access,
        according to its own privacy policy. No Quran Foundation user-account
        OAuth scopes are requested.
      </p>
      <h2>Website administration</h2>
      <p>
        The site administrator uses Supabase email and password sign-in to manage homepage text,
        contact information, teacher profiles, photos, videos and testimonials.
        Saved website content, administrator accounts and uploaded images are stored
        in Supabase. Authentication tokens use secure, HttpOnly cookies on HTTPS. Replacing an image does not immediately delete the
        previous upload. Reading bookmarks and preferences remain on your
        device.
      </p>
      <h2>External links and media</h2>
      <p>
        Registration links open WhatsApp with a prepared message; nothing is
        sent until you choose to send it. Directions open Google Maps. Teaching
        videos connect to YouTube or Vimeo only after you choose to watch.
        Images added by the administrator may load from the HTTPS image host
        they select. Those services apply their own privacy policies.
      </p>
      <h2>Questions and corrections</h2>
      <p>
        Contact the site owner through the conversation or channel where this
        private reader was shared. For Quran Foundation’s data policies, visit{" "}
        <a href="https://quran.foundation" target="_blank" rel="noreferrer">
          Quran Foundation
        </a>
        .
      </p>
    </main>
  );
}
