"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  GraduationCap,
  Headphones,
  Heart,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic2,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { type SiteContent, videoEmbed, whatsappUrl } from "@/lib/site/content";
import { Brand } from "./Brand";

const method = [
  {
    icon: BookOpen,
    title: "Recognise every letter",
    text: "Build a strong foundation in Arabic letters, vowel signs and reading patterns.",
  },
  {
    icon: Mic2,
    title: "Find the right makhraj",
    text: "Practise articulation with gentle correction and guidance from your teacher.",
  },
  {
    icon: Headphones,
    title: "Understand tajwid",
    text: "Learn the essential rules and apply them naturally as you read.",
  },
  {
    icon: Sparkles,
    title: "Read with confidence",
    text: "Bring it all together through consistent, guided Quran reading practice.",
  },
];
const classes = [
  {
    tag: "BUILD YOUR FOUNDATION",
    title: "Beginner Class",
    desc: "A welcoming first step, even if you have never read Arabic before.",
    items: [
      "Arabic letters & vowel signs",
      "Step-by-step reading practice",
      "Children & adult beginners",
    ],
  },
  {
    tag: "GROW YOUR CONFIDENCE",
    title: "Tajwid & Fluency",
    desc: "For readers ready to improve their pronunciation, accuracy and flow.",
    items: [
      "Makhraj correction",
      "Practical tajwid foundations",
      "Guided surah recitation",
    ],
  },
  {
    tag: "LEARN AT YOUR PACE",
    title: "Private Coaching",
    desc: "Individual attention and a learning path that meets you where you are.",
    items: [
      "One-to-one teacher guidance",
      "Focus on your learning goals",
      "Personal progress feedback",
    ],
  },
];
const stages = [
  [
    "Asas Tahajji",
    "Arabic letters, signs and the foundations of Quran reading.",
  ],
  [
    "Latihan Tahajji",
    "Guided drills to connect letters and recognise reading patterns.",
  ],
  [
    "Latihan Makhraj Huruf",
    "Practise each letter from its correct articulation point.",
  ],
  [
    "Perbezaan Makhraj Huruf",
    "Distinguish similar sounds and refine your pronunciation.",
  ],
];
function VideoCard({ video }: { video: SiteContent["videos"][number] }) {
  const [play, setPlay] = useState(false);
  return (
    <article className="at-video">
      {play ? (
        <iframe
          src={videoEmbed(video.url)!}
          title={video.title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          onClick={() => setPlay(true)}
          aria-label={`Watch ${video.title}`}
        >
          <Play size={32} />
          <span>Watch lesson</span>
        </button>
      )}
      <h3>{video.title}</h3>
    </article>
  );
}
export function Home({ content: c }: { content: SiteContent }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    // Preserve links shared by the original reader at /#surah:ayah.
    if (/^#\d{1,3}:\d{1,3}$/.test(location.hash))
      location.replace(`/quran${location.hash}`);
  }, []);
  const registration = whatsappUrl(c.contact);
  const address = `${c.contact.addressLine1} ${c.contact.addressLine2}`;
  return (
    <div className="at-site" id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="at-header">
        <div className="at-container at-nav">
          <Brand branding={c.branding} />
          <button
            className="at-menu"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <nav
            className={menu ? "is-open" : ""}
            aria-label="Main navigation"
            onClick={() => setMenu(false)}
          >
            <a href="#method">Our method</a>
            <a href="#classes">Classes</a>
            {c.teachers.length > 0 && <a href="#teachers">Teachers</a>}
            <a href="#faq">FAQ</a>
            <a className="at-nav-reader" href="/quran">
              <BookOpen size={17} /> Read Quran
            </a>
            <a
              className="at-button small"
              href={registration}
              target="_blank"
              rel="noreferrer"
            >
              Join a class <ArrowUpRight size={16} />
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="at-hero">
          <div className="at-container at-hero-grid">
            <div className="at-hero-copy">
              <span className="at-eyebrow">
                <span className="at-dot" />
                {c.hero.eyebrow}
              </span>
              <h1>{c.hero.headline}</h1>
              <p>{c.hero.subtext}</p>
              <div className="at-actions">
                <a
                  className="at-button"
                  href={registration}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={19} />
                  Start your journey <ArrowUpRight size={17} />
                </a>
                <a className="at-button outline" href="#classes">
                  Explore classes <ArrowRight size={17} />
                </a>
              </div>
              <div className="at-trust">
                <span>
                  <ShieldCheck />
                  <b>
                    Beginner friendly<small>No basic required</small>
                  </b>
                </span>
                <span>
                  <GraduationCap />
                  <b>
                    Guided learning<small>One step at a time</small>
                  </b>
                </span>
              </div>
            </div>
            <div className="at-hero-visual">
              {c.hero.posterUrl && (
                <img
                  className="at-hero-photo"
                  src={c.hero.posterUrl}
                  alt={c.hero.posterAlt}
                  fetchPriority="high"
                />
              )}
              <span className="at-photo-label">
                <span className="at-dot" />
                THE aT-TAHAJJI METHOD
              </span>
              <div className="at-photo-card">
                <span className="at-card-icon">
                  <BookOpen size={23} />
                </span>
                <div>
                  <strong>A little practice. A lifelong connection.</strong>
                  <span>Makhraj · Tajwid · Fluency</span>
                </div>
              </div>
              <div className="at-visual-ring" aria-hidden="true" />
            </div>
          </div>
        </section>
        <section
          className="at-container at-reader-invite"
          aria-label="Online Quran reader"
        >
          <div className="at-reader-icon">
            <BookOpen size={30} strokeWidth={1.4} />
          </div>
          <div>
            <span className="at-kicker light">YOUR EVERYDAY COMPANION</span>
            <h2>Keep your connection with the Quran.</h2>
            <p>
              Authentic Mushaf text, Malay translations and recitation that
              follows every word.
            </p>
          </div>
          <a className="at-button cream" href="/quran">
            Open My Quran <ArrowRight size={18} />
          </a>
        </section>
        <section className="at-section" id="method">
          <div className="at-container">
            <div className="at-heading split">
              <div>
                <span className="at-kicker">THE aT-TAHAJJI METHOD</span>
                <h2>
                  A clear path.
                  <br />A confident reader.
                </h2>
              </div>
              <p>
                Build strong foundations through structured lessons, patient
                guidance and meaningful practice.
              </p>
            </div>
            <div className="at-method-grid">
              {method.map((m, i) => (
                <article className="at-method" key={m.title}>
                  <div className="at-method-top">
                    <span>
                      <m.icon size={23} />
                    </span>
                    <small>0{i + 1}</small>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="at-section at-soft" id="classes">
          <div className="at-container">
            <div className="at-heading center">
              <span className="at-kicker">FIND YOUR STARTING POINT</span>
              <h2>A class for every chapter of your journey.</h2>
              <p>
                Whether you are beginning or beginning again, there is a place
                for you here.
              </p>
            </div>
            <div className="at-classes">
              {classes.map((item, i) => (
                <article
                  className={`at-class ${i === 1 ? "featured" : ""}`}
                  key={item.title}
                >
                  {i === 1 && (
                    <span className="at-popular">A natural next step</span>
                  )}
                  <span className="at-kicker">{item.tag}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <ul>
                    {item.items.map((t) => (
                      <li key={t}>
                        <Check size={17} />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <a
                    className={`at-button ${i === 1 ? "cream" : "outline"}`}
                    href={registration}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Enquire about this class <ArrowUpRight size={17} />
                  </a>
                </article>
              ))}
            </div>
            <p className="at-class-note">
              In-person classes in Jitra, Kedah. Contact us for schedules,
              availability and fees.
            </p>
          </div>
        </section>
        {c.teachers.length > 0 && (
          <section className="at-section" id="teachers">
            <div className="at-container">
              <div className="at-heading center">
                <span className="at-kicker">LEARN WITH GUIDANCE</span>
                <h2>Patient teachers. Personal progress.</h2>
                <p>
                  Encouragement and gentle correction, every step of the way.
                </p>
              </div>
              <div className="at-teachers">
                {c.teachers.map((t, i) => (
                  <article className="at-teacher" key={i}>
                    {t.photoUrl && (
                      <div className="at-teacher-photo">
                        <img src={t.photoUrl} alt={t.name} loading="lazy" />
                      </div>
                    )}
                    <div>
                      <h3>{t.name}</h3>
                      <span className="at-teacher-role">{t.role}</span>
                      <p>{t.bio}</p>
                      <div className="at-tags">
                        {t.tags.map((tag, j) => (
                          <span key={j}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="at-section at-syllabus" id="syllabus">
          <div className="at-container at-syllabus-grid">
            <div className="at-heading">
              <span className="at-kicker">FROM FOUNDATION TO FLUENCY</span>
              <h2>
                One step at a time.
                <br />
                With purpose.
              </h2>
              <p>
                A structured learning path that gives each skill the attention
                it deserves.
              </p>
              <div className="at-bonus">
                <CheckCheck size={24} />
                <div>
                  <strong>Put your learning into practice</strong>
                  <p>
                    Short-surah reading, from An-Nas to Ad-Duha, with teacher
                    feedback.
                  </p>
                  <a href="/quran#114:1">
                    Practise in My Quran <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </div>
            <ol className="at-stages">
              {stages.map(([title, text], i) => (
                <li key={title}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <small>BAB {i + 1}</small>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        {c.videos.length > 0 && (
          <section className="at-section" id="videos">
            <div className="at-container">
              <div className="at-heading center">
                <span className="at-kicker">WATCH & LEARN</span>
                <h2>A closer look at our lessons.</h2>
              </div>
              <div className="at-videos">
                {c.videos.map((v, i) => (
                  <VideoCard video={v} key={`${i}-${v.url}`} />
                ))}
              </div>
            </div>
          </section>
        )}
        {c.gallery.length > 0 && (
          <section className="at-section" id="gallery">
            <div className="at-container">
              <div className="at-heading split">
                <div>
                  <span className="at-kicker">A SPACE TO GROW</span>
                  <h2>Learning, together.</h2>
                </div>
                <p>
                  Discover our learning approach, materials and the spirit of
                  guided Quran reading.
                </p>
              </div>
              <div className="at-gallery">
                {c.gallery
                  .filter((g) => g.imageUrl)
                  .map((g, i) => (
                    <figure key={i}>
                      <img
                        src={g.imageUrl}
                        alt={g.caption || "aT-Tahajji learning"}
                        loading="lazy"
                      />
                      <figcaption>{g.caption}</figcaption>
                    </figure>
                  ))}
              </div>
            </div>
          </section>
        )}
        {c.testimonials.length > 0 && (
          <section className="at-section at-soft">
            <div className="at-container">
              <div className="at-heading center">
                <span className="at-kicker">STORIES OF PROGRESS</span>
                <h2>Small steps. Meaningful change.</h2>
              </div>
              <div className="at-quotes">
                {c.testimonials.map((t, i) => (
                  <figure key={i}>
                    <span className="at-quote-mark" aria-hidden="true">
                      “
                    </span>
                    <blockquote>{t.quote}</blockquote>
                    <figcaption>
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt="" loading="lazy" />
                      ) : (
                        <span>
                          <Heart size={17} />
                        </span>
                      )}
                      {t.author}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="at-section" id="faq">
          <div className="at-container at-faq-grid">
            <div className="at-heading">
              <span className="at-kicker">HERE TO HELP</span>
              <h2>
                A few things
                <br />
                you might be wondering.
              </h2>
              <p>Have another question? We would love to hear from you.</p>
              <a
                className="at-text-link"
                href={registration}
                target="_blank"
                rel="noreferrer"
              >
                Let’s talk <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="at-faq">
              {[
                [
                  "Can complete beginners join?",
                  "Yes. Our classes welcome complete beginners and anyone who wants to rebuild their Quran reading foundation.",
                ],
                [
                  "Where are classes held?",
                  `Classes are held in person at ${address} Contact us for schedules and available slots.`,
                ],
                [
                  "How long does it take to improve?",
                  "Everyone learns at their own pace. Your current reading level and regular practice shape your progress. Weekly guided lessons and revision help you improve steadily.",
                ],
                [
                  "Will I receive feedback on my reading?",
                  "Yes. Teachers provide feedback on pronunciation, reading accuracy and the areas that need more practice.",
                ],
                [
                  "Can I practise between classes?",
                  "Yes. Open My Quran to read authentic Quran text, listen to recitation and follow along with word highlighting. Your bookmarks and reading progress are remembered on this device.",
                ],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <ChevronDown size={18} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="at-section at-soft" id="location">
          <div className="at-container at-location">
            <div>
              <span className="at-kicker">COME LEARN WITH US</span>
              <h2>
                Your next step
                <br />
                starts here.
              </h2>
              <p>Visit our learning centre in Jitra, Kedah.</p>
            </div>
            <div className="at-address">
              <MapPin size={25} />
              <div>
                <h3>aT-Tahajji Learning Centre</h3>
                <p>
                  {c.contact.addressLine1}
                  <br />
                  {c.contact.addressLine2}
                </p>
                <a
                  className="at-text-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="at-section">
          <div className="at-container at-cta">
            <div>
              <span className="at-kicker light">BEGIN WITH ONE SMALL STEP</span>
              <h2>
                Make the Quran
                <br />
                part of your everyday.
              </h2>
              <p>Find the right class for you. We’ll guide you from there.</p>
            </div>
            <div>
              <a
                className="at-button cream"
                href={registration}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} />
                Message on WhatsApp <ArrowUpRight size={17} />
              </a>
              <a className="at-contact" href={`tel:${c.contact.phoneTel}`}>
                {c.contact.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="at-footer">
        <div className="at-container at-footer-grid">
          <div>
            <Brand branding={c.branding} />
            <p>
              Learn with guidance.
              <br />
              Read with understanding.
              <br />
              Grow your connection with the Quran.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="/quran">My Quran reader</a>
            <a href="#classes">Our classes</a>
            <a href="#method">aT-Tahajji method</a>
            <a href="#syllabus">Learning path</a>
          </div>
          <div>
            <h3>Get in touch</h3>
            <a href={`mailto:${c.contact.email}`}>
              <Mail size={15} />
              {c.contact.email}
            </a>
            <a href={`tel:${c.contact.phoneTel}`}>{c.contact.phone}</a>
            <p>
              {c.contact.addressLine1}
              <br />
              {c.contact.addressLine2}
            </p>
          </div>
        </div>
        <div className="at-container at-footer-bottom">
          <span>
            © {new Date().getFullYear()} {c.branding.siteName} · aT-Tahajji
          </span>
          <div>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms & sources</a>
            <a href="/admin">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
