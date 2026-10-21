import type { SiteContent } from "./content";

export const defaultContent: SiteContent = {
  branding: {
    siteName: "My Quran",
    tagline: "by aT-Tahajji",
    logoUrl: "/brand/logo.png",
  },
  hero: {
    eyebrow: "Physical Quran Reading Class",
    headline: "Learn to read the Quran confidently, step by step.",
    subtext:
      "Join our guided Quran reading class using the aT-Tahajji method, designed for beginners, children, adults and anyone who wants to improve makhraj, tajwid and fluency.",
    posterUrl: "/brand/hero-class.jpg",
    posterAlt: "A teacher and child reading together",
  },
  teachers: [
    {
      photoUrl: "/brand/mentor-1.svg",
      name: "Ustaz Ahmad Rahman",
      role: "Quran Reading Instructor · aT-Tahajji Method",
      bio: "Experienced in guiding beginners through makhraj and tajwid foundations. Patient, structured teaching that helps students read with clarity and confidence.",
      tags: ["Makhraj", "Tajwid", "Beginners"],
    },
    {
      photoUrl: "/brand/mentor-2.svg",
      name: "Ustazah Siti Nurhaliza",
      role: "Quran Reading Instructor · aT-Tahajji Method",
      bio: "Specialises in teaching children and adults at every reading level. Focuses on step-by-step progress with gentle correction and encouragement.",
      tags: ["Kids & Adults", "Fluency", "Guided Practice"],
    },
  ],
  videos: [],
  gallery: [
    { imageUrl: "/brand/gallery-1.jpg", caption: "Guided reading session" },
    {
      imageUrl: "/brand/gallery-2.jpg",
      caption: "aT-Tahajji learning materials",
    },
    { imageUrl: "/brand/gallery-3.jpg", caption: "Makhraj practice" },
    { imageUrl: "/brand/gallery-4.jpg", caption: "Small group learning" },
  ],
  contact: {
    whatsapp: "60108371674",
    phone: "010-837 1674",
    phoneTel: "+60108371674",
    email: "hello@attahajji.com",
    addressLine1: "First Floor, No. 4, Taman Seri Cempaka,",
    addressLine2: "Bandar Darulaman Jaya, 06000 Jitra, Kedah.",
    whatsappMessage:
      "Assalamualaikum, I want to register for aT-Tahajji Quran Reading Class.",
  },
  testimonials: [
    {
      quote:
        "My child can now read short surahs with much better pronunciation. The method is very structured and easy to follow.",
      author: "Parent of Beginner Student",
      imageUrl: "",
    },
    {
      quote:
        "I restarted learning as an adult. The step-by-step approach made it less overwhelming and more encouraging.",
      author: "Adult Learner",
      imageUrl: "",
    },
    {
      quote:
        "The makhraj correction helped me fix mistakes I had for years. I feel much more confident when reading now.",
      author: "Tajwid & Fluency Student",
      imageUrl: "",
    },
  ],
};
