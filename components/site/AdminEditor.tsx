"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Contact,
  ExternalLink,
  Image as ImageIcon,
  Images,
  LayoutTemplate,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MessageSquareQuote,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Undo2,
  Upload,
  Users,
  Video,
} from "lucide-react";
import {
  type ContentDocument,
  type SiteContent,
  contentSchema,
  safeImageUrl,
} from "@/lib/site/content";
import { Brand } from "./Brand";
const sections = [
  {
    id: "branding",
    label: "Brand & hero",
    icon: LayoutTemplate,
    description: "Your logo, introduction and first impression.",
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: Users,
    description: "Introduce the people guiding your students.",
  },
  {
    id: "gallery",
    label: "Photo gallery",
    icon: Images,
    description: "Share your learning environment and materials.",
  },
  {
    id: "videos",
    label: "Teaching videos",
    icon: Video,
    description: "Add YouTube or Vimeo lessons to your homepage.",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
    description: "Share feedback from your students and their families.",
  },
  {
    id: "contact",
    label: "Contact details",
    icon: Contact,
    description: "Help learners find you and enquire about classes.",
  },
] as const;
type Section = (typeof sections)[number]["id"];
type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
  type?: string;
  wide?: boolean;
};
function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
  type = "text",
  wide,
}: FieldProps) {
  return (
    <label className={`ad-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={2500}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={type === "url" ? 2048 : 254}
        />
      )}{" "}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function ImageField({
  label,
  value,
  onChange,
  canSave,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  canSave: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (
      file.size > 5_000_000 ||
      !["image/png", "image/jpeg", "image/webp"].includes(file.type)
    ) {
      setError("Choose a PNG, JPEG or WebP image under 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/media", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as { url: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ad-image-field">
      <span className="ad-field-label">{label}</span>
      <div className="ad-image-row">
        <div className="ad-image-preview">
          {value && safeImageUrl(value) ? (
            <img src={value} alt={`${label} preview`} />
          ) : (
            <ImageIcon size={28} />
          )}
        </div>
        <div>
          <label className={`ad-upload ${!canSave || busy ? "disabled" : ""}`}>
            {busy ? (
              <LoaderCircle className="ad-spin" size={16} />
            ) : (
              <Upload size={16} />
            )}{" "}
            {busy ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={!canSave || busy}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <p>PNG, JPEG or WebP · up to 5 MB</p>
          {value && (
            <button
              type="button"
              className="ad-remove-image"
              onClick={() => onChange("")}
              disabled={!canSave}
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      <Field
        label="Image URL"
        type="text"
        value={value}
        onChange={onChange}
        hint="Upload an image or paste an HTTPS image link."
      />
      {error && (
        <p className="ad-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="ad-panel">
      <div className="ad-panel-heading">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
export function AdminEditor({
  initial,
  canSave,
  displayName,
  loadError,
  signInUrl,
  signOutUrl,
}: {
  initial: ContentDocument;
  canSave: boolean;
  displayName: string | null;
  loadError: boolean;
  signInUrl: string;
  signOutUrl: string;
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState<SiteContent>(initial.content);
  const [section, setSection] = useState<Section>("branding");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.content);
  const current = sections.find((s) => s.id === section)!;
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setNotice("");
  }
  function remove(
    key: "teachers" | "gallery" | "videos" | "testimonials",
    index: number,
  ) {
    if (
      window.confirm(
        "Remove this item? The live website changes only when you save.",
      )
    )
      setDraft((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }));
  }
  function move(
    key: "teachers" | "gallery" | "videos" | "testimonials",
    index: number,
    delta: number,
  ) {
    setDraft((d) => {
      const items = [...d[key]];
      [items[index], items[index + delta]] = [
        items[index + delta],
        items[index],
      ];
      return { ...d, [key]: items };
    });
  }
  const itemTools = (
    key: "teachers" | "gallery" | "videos" | "testimonials",
    index: number,
  ) => (
    <div className="ad-item-tools">
      <button
        type="button"
        aria-label={`Move item ${index + 1} up`}
        disabled={!canSave || index === 0}
        onClick={() => move(key, index, -1)}
      >
        <ArrowUp size={16} />
      </button>
      <button
        type="button"
        aria-label={`Move item ${index + 1} down`}
        disabled={!canSave || index === draft[key].length - 1}
        onClick={() => move(key, index, 1)}
      >
        <ArrowDown size={16} />
      </button>
      <button
        type="button"
        aria-label={`Remove item ${index + 1}`}
        disabled={!canSave}
        onClick={() => remove(key, index)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
  async function save() {
    setError("");
    setNotice("");
    const parsed = contentSchema.safeParse(draft);
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((i) => `${i.path.join(" → ")}: ${i.message}`)
          .join("\n"),
      );
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: parsed.data,
          revision: saved.revision,
        }),
      });
      const document = (await response.json()) as ContentDocument & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(document.error || "Could not save your changes.");
      setSaved(document);
      setDraft(document.content);
      setNotice("Changes saved. Your website is up to date.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  }
  const blank = (label: string) => (
    <div className="ad-empty">
      <Plus size={24} />
      <p>No {label} yet.</p>
      <span>Add one below to show this section on your website.</span>
    </div>
  );
  return (
    <div className="at-admin">
      <a className="skip-link" href="#admin-content">
        Skip to editor
      </a>
      <header className="ad-header">
        <Brand branding={saved.content.branding} compact />
        <span className="ad-admin-label">SITE ADMIN</span>
        <a className="ad-view-site" href="/" target="_blank" rel="noreferrer">
          View website <ExternalLink size={14} />
        </a>
        {displayName && (
          <form action={signOutUrl} method="post"><button type="submit" className="ad-logout" aria-label="Sign out"><LogOut size={18} /></button></form>
        )}
      </header>
      <div className="ad-layout">
        <aside className="ad-sidebar">
          <a className="ad-back" href="/">
            <ArrowLeft size={15} />
            Back to website
          </a>
          <p className="ad-sidebar-label">YOUR WEBSITE</p>
          <nav aria-label="Content sections">
            {sections.map((s) => (
              <button
                type="button"
                key={s.id}
                className={section === s.id ? "selected" : ""}
                onClick={() => {
                  setSection(s.id);
                  setError("");
                }}
                aria-current={section === s.id ? "page" : undefined}
              >
                <s.icon size={18} />
                {s.label}
                <ChevronRight size={14} />
              </button>
            ))}
          </nav>
          <div className="ad-sidebar-note">
            <ShieldCheck size={22} />
            <strong>A space for your content</strong>
            <p>
              Manage your classes and community. Quran text and recitations stay
              connected to their authentic sources.
            </p>
            <a href="/quran">
              Open Quran reader <ArrowUpRight size={14} />
            </a>
          </div>
        </aside>
        <main id="admin-content" className="ad-main">
          <div className="ad-page-heading">
            <div>
              <span className="at-kicker">CONTENT MANAGEMENT</span>
              <h1>{current.label}</h1>
              <p>{current.description}</p>
            </div>
            <span className={`ad-status ${dirty ? "unsaved" : ""}`}>
              <span />
              {dirty ? "Unsaved changes" : "Up to date"}
            </span>
          </div>
          {!displayName && (
            <div className="ad-signin">
              <LockKeyhole size={24} />
              <div>
                <strong>Sign in to manage your website</strong>
                <p>
                  You can review the content below. Editing is available to your
                  authorised administrator.
                </p>
              </div>
              <a className="at-button small" href={signInUrl} target="_top">
                Sign in with email <ArrowUpRight size={15} />
              </a>
            </div>
          )}
          {displayName && !canSave && !loadError && (
            <p className="ad-alert" role="alert">
              This account does not have permission to edit the site.
            </p>
          )}
          {loadError && (
            <div className="ad-alert" role="alert">
              The latest site content could not be loaded. Editing is paused to
              protect your saved changes. <a href="/admin">Reload</a>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <fieldset disabled={!canSave || saving}>
              {section === "branding" && (
                <>
                  <Panel
                    title="Brand identity"
                    subtitle="The logo and name appear on your homepage and in the Quran reader."
                  >
                    <div className="ad-fields">
                      <Field
                        label="Website name"
                        value={draft.branding.siteName}
                        onChange={(siteName) =>
                          update("branding", { ...draft.branding, siteName })
                        }
                      />
                      <Field
                        label="Tagline"
                        value={draft.branding.tagline}
                        onChange={(tagline) =>
                          update("branding", { ...draft.branding, tagline })
                        }
                      />
                    </div>
                    <ImageField
                      label="Your logo"
                      value={draft.branding.logoUrl}
                      onChange={(logoUrl) =>
                        update("branding", { ...draft.branding, logoUrl })
                      }
                      canSave={canSave}
                    />
                  </Panel>
                  <Panel
                    title="Homepage hero"
                    subtitle="Welcome learners with a clear message and a meaningful image."
                  >
                    <div className="ad-fields">
                      <Field
                        label="Eyebrow label"
                        value={draft.hero.eyebrow}
                        onChange={(eyebrow) =>
                          update("hero", { ...draft.hero, eyebrow })
                        }
                        wide
                      />
                      <Field
                        label="Headline"
                        value={draft.hero.headline}
                        onChange={(headline) =>
                          update("hero", { ...draft.hero, headline })
                        }
                        wide
                      />
                      <Field
                        label="Introduction"
                        value={draft.hero.subtext}
                        onChange={(subtext) =>
                          update("hero", { ...draft.hero, subtext })
                        }
                        multiline
                        wide
                      />
                    </div>
                    <ImageField
                      label="Hero image"
                      value={draft.hero.posterUrl}
                      onChange={(posterUrl) =>
                        update("hero", { ...draft.hero, posterUrl })
                      }
                      canSave={canSave}
                    />
                    <Field
                      label="Image description (accessibility)"
                      value={draft.hero.posterAlt}
                      onChange={(posterAlt) =>
                        update("hero", { ...draft.hero, posterAlt })
                      }
                    />
                  </Panel>
                </>
              )}
              {section === "teachers" && (
                <>
                  {draft.teachers.length === 0 && blank("teachers")}
                  {draft.teachers.map((t, i) => (
                    <Panel title={`Teacher ${i + 1}`} key={i}>
                      {itemTools("teachers", i)}
                      <div className="ad-fields">
                        <Field
                          label="Name"
                          value={t.name}
                          onChange={(name) =>
                            update(
                              "teachers",
                              draft.teachers.map((v, j) =>
                                j === i ? { ...v, name } : v,
                              ),
                            )
                          }
                        />
                        <Field
                          label="Role"
                          value={t.role}
                          onChange={(role) =>
                            update(
                              "teachers",
                              draft.teachers.map((v, j) =>
                                j === i ? { ...v, role } : v,
                              ),
                            )
                          }
                        />
                        <Field
                          label="Biography"
                          value={t.bio}
                          multiline
                          wide
                          onChange={(bio) =>
                            update(
                              "teachers",
                              draft.teachers.map((v, j) =>
                                j === i ? { ...v, bio } : v,
                              ),
                            )
                          }
                        />
                        <Field
                          label="Specialties"
                          value={t.tags.join(",")}
                          hint="Separate tags with commas, for example: Makhraj, Tajwid"
                          wide
                          onChange={(tags) =>
                            update(
                              "teachers",
                              draft.teachers.map((v, j) =>
                                j === i ? { ...v, tags: tags.split(",") } : v,
                              ),
                            )
                          }
                        />
                      </div>
                      <ImageField
                        label="Teacher photo"
                        value={t.photoUrl}
                        canSave={canSave}
                        onChange={(photoUrl) =>
                          update(
                            "teachers",
                            draft.teachers.map((v, j) =>
                              j === i ? { ...v, photoUrl } : v,
                            ),
                          )
                        }
                      />
                    </Panel>
                  ))}
                  <button
                    type="button"
                    className="ad-add"
                    disabled={draft.teachers.length >= 12}
                    onClick={() =>
                      update("teachers", [
                        ...draft.teachers,
                        { name: "", role: "", bio: "", tags: [], photoUrl: "" },
                      ])
                    }
                  >
                    <Plus size={17} />
                    Add teacher
                  </button>
                </>
              )}
              {section === "gallery" && (
                <>
                  {draft.gallery.length === 0 && blank("gallery photos")}
                  {draft.gallery.map((g, i) => (
                    <Panel title={`Gallery photo ${i + 1}`} key={i}>
                      {itemTools("gallery", i)}
                      <ImageField
                        label="Photo"
                        value={g.imageUrl}
                        canSave={canSave}
                        onChange={(imageUrl) =>
                          update(
                            "gallery",
                            draft.gallery.map((v, j) =>
                              j === i ? { ...v, imageUrl } : v,
                            ),
                          )
                        }
                      />
                      <Field
                        label="Caption & image description"
                        value={g.caption}
                        onChange={(caption) =>
                          update(
                            "gallery",
                            draft.gallery.map((v, j) =>
                              j === i ? { ...v, caption } : v,
                            ),
                          )
                        }
                      />
                    </Panel>
                  ))}
                  <button
                    type="button"
                    className="ad-add"
                    disabled={draft.gallery.length >= 12}
                    onClick={() =>
                      update("gallery", [
                        ...draft.gallery,
                        { imageUrl: "", caption: "" },
                      ])
                    }
                  >
                    <Plus size={17} />
                    Add photo
                  </button>
                </>
              )}
              {section === "videos" && (
                <>
                  {draft.videos.length === 0 && blank("teaching videos")}
                  {draft.videos.map((v, i) => (
                    <Panel title={`Video ${i + 1}`} key={i}>
                      {itemTools("videos", i)}
                      <div className="ad-fields">
                        <Field
                          label="Video title"
                          value={v.title}
                          onChange={(title) =>
                            update(
                              "videos",
                              draft.videos.map((v, j) =>
                                j === i ? { ...v, title } : v,
                              ),
                            )
                          }
                          wide
                        />
                        <Field
                          label="YouTube or Vimeo URL"
                          type="url"
                          value={v.url}
                          onChange={(url) =>
                            update(
                              "videos",
                              draft.videos.map((v, j) =>
                                j === i ? { ...v, url } : v,
                              ),
                            )
                          }
                          hint="Paste the complete HTTPS link. Only YouTube and Vimeo videos are supported."
                          wide
                        />
                      </div>
                    </Panel>
                  ))}
                  <button
                    type="button"
                    className="ad-add"
                    disabled={draft.videos.length >= 12}
                    onClick={() =>
                      update("videos", [
                        ...draft.videos,
                        { title: "", url: "" },
                      ])
                    }
                  >
                    <Plus size={17} />
                    Add teaching video
                  </button>
                </>
              )}
              {section === "testimonials" && (
                <>
                  {draft.testimonials.length === 0 && blank("testimonials")}
                  {draft.testimonials.map((t, i) => (
                    <Panel title={`Testimonial ${i + 1}`} key={i}>
                      {itemTools("testimonials", i)}
                      <div className="ad-fields">
                        <Field
                          label="Student or parent name"
                          value={t.author}
                          onChange={(author) =>
                            update(
                              "testimonials",
                              draft.testimonials.map((v, j) =>
                                j === i ? { ...v, author } : v,
                              ),
                            )
                          }
                          wide
                        />
                        <Field
                          label="Their feedback"
                          value={t.quote}
                          multiline
                          wide
                          onChange={(quote) =>
                            update(
                              "testimonials",
                              draft.testimonials.map((v, j) =>
                                j === i ? { ...v, quote } : v,
                              ),
                            )
                          }
                        />
                      </div>
                      <ImageField
                        label="Photo (optional)"
                        value={t.imageUrl}
                        canSave={canSave}
                        onChange={(imageUrl) =>
                          update(
                            "testimonials",
                            draft.testimonials.map((v, j) =>
                              j === i ? { ...v, imageUrl } : v,
                            ),
                          )
                        }
                      />
                    </Panel>
                  ))}
                  <button
                    type="button"
                    className="ad-add"
                    disabled={draft.testimonials.length >= 12}
                    onClick={() =>
                      update("testimonials", [
                        ...draft.testimonials,
                        { author: "", quote: "", imageUrl: "" },
                      ])
                    }
                  >
                    <Plus size={17} />
                    Add testimonial
                  </button>
                </>
              )}
              {section === "contact" && (
                <>
                  <Panel
                    title="Get in touch"
                    subtitle="These details update all registration buttons, contact links and the footer."
                  >
                    <div className="ad-fields">
                      <Field
                        label="WhatsApp number"
                        value={draft.contact.whatsapp}
                        hint="Country code and number only, without + or spaces."
                        onChange={(whatsapp) =>
                          update("contact", { ...draft.contact, whatsapp })
                        }
                      />
                      <Field
                        label="Email address"
                        type="email"
                        value={draft.contact.email}
                        onChange={(email) =>
                          update("contact", { ...draft.contact, email })
                        }
                      />
                      <Field
                        label="Phone number (display)"
                        value={draft.contact.phone}
                        onChange={(phone) =>
                          update("contact", { ...draft.contact, phone })
                        }
                      />
                      <Field
                        label="Phone number (call link)"
                        value={draft.contact.phoneTel}
                        onChange={(phoneTel) =>
                          update("contact", { ...draft.contact, phoneTel })
                        }
                      />
                      <Field
                        label="Prefilled WhatsApp message"
                        multiline
                        wide
                        value={draft.contact.whatsappMessage}
                        onChange={(whatsappMessage) =>
                          update("contact", {
                            ...draft.contact,
                            whatsappMessage,
                          })
                        }
                      />
                    </div>
                  </Panel>
                  <Panel title="Learning centre location">
                    <div className="ad-fields">
                      <Field
                        label="Address line 1"
                        value={draft.contact.addressLine1}
                        wide
                        onChange={(addressLine1) =>
                          update("contact", { ...draft.contact, addressLine1 })
                        }
                      />
                      <Field
                        label="Address line 2"
                        value={draft.contact.addressLine2}
                        wide
                        onChange={(addressLine2) =>
                          update("contact", { ...draft.contact, addressLine2 })
                        }
                      />
                    </div>
                  </Panel>
                </>
              )}
            </fieldset>
            {error && (
              <div className="ad-alert" role="alert">
                {error}
              </div>
            )}
            {notice && (
              <div className="ad-success" role="status">
                <Check size={18} />
                {notice}
              </div>
            )}
            <div className="ad-savebar">
              <div>
                <span className="ad-save-label">
                  {dirty ? "Ready when you are" : "Your website, your story"}
                </span>
                <small>
                  {saved.updatedAt
                    ? `Last saved ${new Date(saved.updatedAt).toLocaleString()}`
                    : "Changes appear on your website after saving."}
                </small>
              </div>
              <div>
                <button
                  className="ad-discard"
                  type="button"
                  disabled={!dirty || saving}
                  onClick={() => {
                    if (window.confirm("Discard all unsaved changes?")) {
                      setDraft(saved.content);
                      setError("");
                      setNotice("");
                    }
                  }}
                >
                  <Undo2 size={15} />
                  <span>Discard</span>
                </button>
                <button
                  className="at-button small"
                  type="submit"
                  disabled={!canSave || !dirty || saving}
                >
                  {saving ? (
                    <LoaderCircle size={16} className="ad-spin" />
                  ) : (
                    <Save size={16} />
                  )}{" "}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </form>
          <p className="ad-session">
            {displayName ? `Signed in as ${displayName}` : "Read-only view"} ·{" "}
            {draft.branding.siteName}
          </p>
        </main>
      </div>
    </div>
  );
}
