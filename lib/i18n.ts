/**
 * Bilingual EN/AR dictionary + helpers.
 *
 * Default locale is English (LTR). Users can flip to Arabic (RTL) via the
 * header toggle — choice persists in localStorage and is applied to
 * <html dir/lang> on mount + change.
 */

export type Locale = "en" | "ar";

export const LOCALES: readonly Locale[] = ["en", "ar"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const STORAGE_KEY = "pa_locale";

export const dirOf = (locale: Locale): "ltr" | "rtl" =>
  locale === "ar" ? "rtl" : "ltr";

export const otherLocale = (locale: Locale): Locale =>
  locale === "ar" ? "en" : "ar";

/* ────────────────────────────────────────────────────────────────
   Dictionary
   ──────────────────────────────────────────────────────────────── */

type Leaf = string;
type Tree = { [key: string]: Leaf | Tree };

export const dict: Record<Locale, Tree> = {
  en: {
    common: {
      brand: "Property-Agent",
      tagline: "AI-powered WhatsApp lead engine for brokers",
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      submit: "Submit",
      continue: "Continue",
      loading: "Loading…",
      retry: "Try again",
      copy: "Copy",
      copied: "Copied",
      learnMore: "Learn more",
      egypt: "Cairo",
    },
    nav: {
      home: "Home",
      pricing: "Pricing",
      login: "Sign in",
      signup: "Sign up",
      signOut: "Sign out",
      getStarted: "Get started",
      dashboard: "Dashboard",
    },
    languageToggle: {
      label: "Language",
      switchTo: "العربية",
      currentEn: "EN",
      currentAr: "AR",
    },
    hero: {
      eyebrow: "AI broker · WhatsApp-native",
      titlePart1: "Your bot replies to clients,",
      titleAccent: "delivers ready leads,",
      titlePart2: "while you're on the road.",
      body:
        "Connect your inventory in 30 seconds. The bot speaks Egyptian Arabic like a seasoned Cairo broker. You only get pinged when a client is ready to talk.",
      ctaPrimary: "Start free — 30 sec",
      ctaSecondary: "Have an account? Sign in",
      stat1Label: "Setup time",
      stat1Value: "< 30 sec",
      stat2Label: "Reply language",
      stat2Value: "EG Arabic",
      stat3Label: "Notify on",
      stat3Value: "Email · WhatsApp",
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps between you and your first lead.",
      step1Title: "Sign up & upload inventory",
      step1Body:
        "Fill the signup form, upload your properties (CSV), and pick a notification channel — email or WhatsApp.",
      step1Note: "We send you a broker key and a ready-to-share WhatsApp link.",
      step2Title: "Share your WhatsApp link",
      step2Body:
        "It includes your broker code. Drop it in your ads, Stories, business cards — every client who taps it lands with you directly.",
      step2Note: "No WhatsApp setup needed on your side.",
      step3Title: "Receive ready clients",
      step3Body:
        "The bot understands the client, recommends from your catalog, and when they're ready it pings you with their number and last message.",
      step3Note:
        "Dashboard with all leads, status filters, and quick actions.",
      quote:
        "“The difference between a good broker and a great one is reply speed. The bot replies in seconds and only hands you the ready ones.”",
      ctaStart: "Start signup →",
    },
    footer: {
      city: "Property-Agent · Cairo",
      version: "v1",
    },
    auth: {
      loginEyebrow: "Sign in",
      loginTitlePart: "Back to your",
      loginTitleAccent: "broker desk",
      loginBody:
        "Use the email + password you set during signup. We'll drop you back on your dashboard in seconds.",
      noAccountQuestion: "Don't have an account yet?",
      noAccountCta: "Sign up as a broker",
      credsTitle: "Email & password",
      credsEyebrow: "Your details",
      emailLabel: "Email",
      passwordLabel: "Password",
      loginSubmit: "Sign in",
      signinSuccess: "Welcome back",
      apiKeyEyebrow: "Alternative",
      apiKeyTitle: "Sign in with API key",
      apiKeyBody:
        "For legacy accounts that don't have a password yet. Use the same key shown after signup.",
      apiKeySubmit: "Sign in with key",
      apiKeySwitch: "Use an API key instead →",
      apiKeyInvalid: "Key is invalid or no longer valid",
      genericError: "Something went wrong, try again",
      wrongCreds: "Invalid email or password",

      signupEyebrow: "Create your broker account",
      signupTitlePart: "Build your",
      signupTitleAccent: "client engine",
      signupTitleEnd: "in under a minute",
      signupBody:
        "Email, password, business name, phone, channel. We send your broker key and a ready WhatsApp link the moment you submit.",
      businessName: "Business name",
      brokerEmail: "Email",
      brokerPhone: "Phone (with country code)",
      passwordPlaceholder: "8 characters or more",
      confirmPassword: "Confirm password",
      channel: "Notification channel",
      channelEmail: "Email",
      channelWhatsApp: "WhatsApp",
      channelBoth: "Both",
      submitSignup: "Create my account",
      passwordsMustMatch: "Passwords don't match",
      passwordTooShort: "At least 8 characters",
      emailTaken: "This email already has an account",
      signupSuccess: "Welcome aboard",

      successTitle: "You're in — your broker dashboard is ready",
      successBody:
        "Your magic link is below. Share it everywhere and clients land straight in your bot.",
      whatsappCta: "Open in WhatsApp",
      goToDashboard: "Go to dashboard",
    },
    dashboard: {
      eyebrow: "Broker desk",
      title: "Your office on",
      titleAccent: "WhatsApp",
      tabStats: "Overview",
      tabLeads: "Leads",
      tabInventory: "Inventory",
      tabSettings: "Settings",
      loadFailed: "Couldn't load data",
      stats: {
        today: "Today",
        last7: "Last 7 days",
        last30: "Last 30 days",
        notifySuccess: "Notify success",
        todayEmpty: "No leads today yet",
        noNotificationsYet: "No notifications yet",
        recentTitle: "Recent leads",
        recentEnLabel: "Recent activity",
        emptyTitle: "No leads yet",
        emptyHint: "When a customer asks to be contacted, they'll appear here.",
        unknownCustomer: "Customer",
      },
      leads: {
        title: "Leads",
        none: "No leads",
        filterLabel: "Filter by status",
        filterAll: "All",
        emptyFilteredTitle: "No leads with this status",
        emptyFilteredHint: "Change the filter, or share your WhatsApp link.",
        emptyTitle: "No leads have arrived yet",
        emptyHint: "The first customer who taps your WhatsApp link and asks to be contacted will appear here.",
        loadFailed: "Couldn't load leads",
        statusUpdated: "Status updated",
        statusUpdateFailed: "Couldn't update status",
        col: {
          id: "#",
          customer: "Customer",
          mobile: "Mobile",
          lastMessage: "Last message",
          listings: "Listings",
          status: "Status",
          when: "When",
        },
        action: {
          contacted: "Contacted",
          close: "Close",
          closedLabel: "Closed",
        },
        page: "Page",
        of: "of",
        prev: "← Previous",
        next: "Next →",
      },
      inventory: {
        eyebrow: "Inventory upload",
        title: "Add your properties to the AI",
        body:
          "Upload a CSV file with your properties. Each row joins your office's catalog and starts surfacing to customers on WhatsApp instantly.",
        dropPrompt: "Drop the file here",
        fileReady: "File ready",
        orPick: "Or click to pick",
        sizeMaxHint: "CSV · max 20 MB",
        mustBeCsv: "File must be CSV",
        maxSize: "Max size is 20 MB",
        downloadOk: "Template downloaded",
        downloadFailed: "Couldn't download the template",
        uploadFailed: "Upload failed",
        uploadCta: "Upload",
        switchFile: "← Pick a different file",
        resultEyebrow: "Upload result",
        col: {
          total: "Total",
          succeeded: "Succeeded",
          skipped: "Skipped",
          failed: "Failed",
        },
        errorsHeader: "errors",
        templateEyebrow: "CSV template",
        templateBody:
          "Download an empty file with all required columns, fill it with your properties, then upload.",
        downloadTemplate: "↓ Download template",
        columnsEyebrow: "Required columns",
        columnsTip: "The template also has many optional columns you can use.",
      },
      settings: {
        profileEyebrow: "Profile",
        profileTitle: "Office details",
        businessName: "Office name",
        notifEmail: "Notification email",
        brokerPhone: "Broker WhatsApp number",
        channel: "Notification channel",
        save: "Save changes",
        loadFailed: "Couldn't load settings",
        saveFailed: "Couldn't save settings",
        saved: "Settings saved",
        magicLinkEyebrow: "Your WhatsApp link",
        magicLinkBody:
          "Share it in your ads. Every customer who taps it lands at your office directly.",
        copyLink: "Copy link",
        copyOk: "Link copied",
        copyFailed: "Couldn't copy",
        openWhatsapp: "Open in WhatsApp ↗",
        accountInfo: "Account info",
        plan: "Plan",
        status: "Status",
        active: "Active",
        suspended: "Suspended",
        brokerId: "Broker ID",
      },
      status: {
        new: "New",
        notified: "Notified",
        contacted: "Contacted",
        closed: "Closed",
      },
    },
  },
  ar: {
    common: {
      brand: "Property-Agent",
      tagline: "وكيلك العقاري الذكي على واتساب",
      back: "الرجوع",
      cancel: "إلغاء",
      save: "حفظ",
      submit: "إرسال",
      continue: "التالي",
      loading: "جارٍ التحميل…",
      retry: "حاول تاني",
      copy: "نسخ",
      copied: "تم النسخ",
      learnMore: "اعرف أكتر",
      egypt: "القاهرة",
    },
    nav: {
      home: "الرئيسية",
      pricing: "الأسعار",
      login: "سجّل الدخول",
      signup: "سجّل وسيط",
      signOut: "تسجيل الخروج",
      getStarted: "ابدأ مجاناً",
      dashboard: "اللوحة",
    },
    languageToggle: {
      label: "اللغة",
      switchTo: "English",
      currentEn: "EN",
      currentAr: "AR",
    },
    hero: {
      eyebrow: "وكيلك العقاري الذكي على واتساب",
      titlePart1: "بوت يردّ على عملاءك،",
      titleAccent: "ويسلّمك الفرص",
      titlePart2: "وأنت في السيارة.",
      body:
        "ربط بسيط بمخزونك من العقارات. محادثة عربية طبيعية بمستوى وسيط قاهري متمرّس. تنبيه فوري لك بكلّ عميل جاهز يطلب التواصل.",
      ctaPrimary: "ابدأ مجاناً — 30 ثانية",
      ctaSecondary: "عندك حساب؟ سجل الدخول",
      stat1Label: "مدة الإعداد",
      stat1Value: "< 30 ث",
      stat2Label: "لغة الرد",
      stat2Value: "عربي مصري",
      stat3Label: "قنوات التنبيه",
      stat3Value: "إيميل · واتساب",
    },
    how: {
      eyebrow: "كيف يشتغل",
      title: "ثلاث خطوات تفصلك عن أوّل عميل.",
      step1Title: "سجّل ورفّع المخزون",
      step1Body:
        "املأ نموذج التسجيل، ارفع ملف العقارات (CSV)، واختار قناة التنبيه — إيميل أو واتساب.",
      step1Note: "بنبعتلك مفتاح الوسيط ورابط واتساب جاهز للنشر.",
      step2Title: "انشر رابط واتساب",
      step2Body:
        "رابط فيه كود وسيطك الخاص. حطه في إعلاناتك، الـ Stories، الكروت — كل عميل يفتحه يوصل لك مباشرة.",
      step2Note: "بدون أي إعداد على واتساب من ناحيتك.",
      step3Title: "استلم العملاء الجاهزين",
      step3Body:
        "البوت يفهم العميل، يرشحله من عقاراتك، ولما يكون جاهز يقولك بإيميل أو واتساب فيه رقمه وآخر رسالة منه.",
      step3Note: "لوحة فيها كل العملاء، فلترة حسب الحالة، وأزرار سريعة.",
      quote:
        "«الفرق بين الوسيط الكويس والمتميّز هو السرعة في الرد. البوت بيرد في تانية وبيسلّمك الجاهزين بس.»",
      ctaStart: "ابدأ التسجيل ←",
    },
    footer: {
      city: "Property-Agent · القاهرة",
      version: "v1",
    },
    auth: {
      loginEyebrow: "تسجيل الدخول",
      loginTitlePart: "ارجع",
      loginTitleAccent: "للوحة وسيطك",
      loginBody:
        "ادخل بالإيميل وكلمة المرور اللي اخترتهم وقت التسجيل. هنرجّعك على لوحتك في ثواني.",
      noAccountQuestion: "لسه ما عندكش حساب؟",
      noAccountCta: "سجل وسيط جديد",
      credsTitle: "الإيميل وكلمة المرور",
      credsEyebrow: "بياناتك",
      emailLabel: "الإيميل",
      passwordLabel: "كلمة المرور",
      loginSubmit: "ادخل",
      signinSuccess: "أهلاً بيك من جديد",
      apiKeyEyebrow: "طريقة بديلة",
      apiKeyTitle: "دخول بمفتاح API",
      apiKeyBody:
        "للحسابات القديمة اللي ماعندهاش كلمة مرور بعد. استخدم نفس المفتاح اللي ظهر بعد التسجيل.",
      apiKeySubmit: "ادخل بالمفتاح",
      apiKeySwitch: "دخول بمفتاح API بدلاً عن ذلك ←",
      apiKeyInvalid: "المفتاح غير صحيح أو لم يعد ساري",
      genericError: "حصلت مشكلة، حاول تاني",
      wrongCreds: "الإيميل أو كلمة المرور غير صحيحة",

      signupEyebrow: "إنشاء حساب وسيط",
      signupTitlePart: "ابني",
      signupTitleAccent: "محرّك العملاء",
      signupTitleEnd: "في أقل من دقيقة",
      signupBody:
        "إيميل، كلمة مرور، اسم النشاط، تليفون، قناة. أوّل ما تبعت بنبعتلك مفتاح الوسيط ورابط واتساب جاهز.",
      businessName: "اسم النشاط",
      brokerEmail: "الإيميل",
      brokerPhone: "التليفون (بكود الدولة)",
      passwordPlaceholder: "8 حروف أو أكتر",
      confirmPassword: "تأكيد كلمة المرور",
      channel: "قناة التنبيه",
      channelEmail: "إيميل",
      channelWhatsApp: "واتساب",
      channelBoth: "الاتنين",
      submitSignup: "أنشئ حسابي",
      passwordsMustMatch: "كلمتا المرور غير متطابقتين",
      passwordTooShort: "على الأقل 8 حروف",
      emailTaken: "الإيميل ده عنده حساب بالفعل",
      signupSuccess: "أهلاً بيك",

      successTitle: "تمام — لوحتك جاهزة",
      successBody:
        "دا رابطك الذكي. انشره في أي حتة وكل عميل بيدوس عليه بيتحوّل لبوتك مباشرة.",
      whatsappCta: "افتح على واتساب",
      goToDashboard: "افتح اللوحة",
    },
    dashboard: {
      eyebrow: "لوحة الوسيط",
      title: "مكتبك على",
      titleAccent: "واتساب",
      tabStats: "نظرة عامة",
      tabLeads: "العملاء",
      tabInventory: "المخزون",
      tabSettings: "الإعدادات",
      loadFailed: "ما قدرتش أحمّل البيانات",
      stats: {
        today: "آخر 24 ساعة",
        last7: "آخر 7 أيام",
        last30: "آخر 30 يوم",
        notifySuccess: "نسبة التنبيه الناجحة",
        todayEmpty: "لسه مفيش عملاء النهارده",
        noNotificationsYet: "ما حصلش تنبيه بعد",
        recentTitle: "آخر عملاء وصلوك",
        recentEnLabel: "Recent activity",
        emptyTitle: "مفيش عملاء بعد",
        emptyHint: "أول ما عميل يطلب يتواصل معاك، هيظهر هنا.",
        unknownCustomer: "عميل",
      },
      leads: {
        title: "العملاء",
        none: "ما فيش عملاء",
        filterLabel: "فلترة حسب الحالة",
        filterAll: "كل الحالات",
        emptyFilteredTitle: "ما فيش عملاء بالحالة دي",
        emptyFilteredHint: "غيّر الفلتر، أو ابدأ بنشر رابط الواتساب الخاص بيك.",
        emptyTitle: "لسه ما وصلكش عملاء",
        emptyHint:
          "أول عميل يفتح رابط الواتساب الخاص بيك ويطلب يتواصل، هيظهر هنا.",
        loadFailed: "ما قدرتش أحمّل العملاء",
        statusUpdated: "الحالة اتحدّثت",
        statusUpdateFailed: "ما قدرتش أحدّث الحالة",
        col: {
          id: "#",
          customer: "العميل",
          mobile: "الموبايل",
          lastMessage: "آخر رسالة",
          listings: "عقارات",
          status: "الحالة",
          when: "وصل",
        },
        action: {
          contacted: "تواصلت",
          close: "أغلق",
          closedLabel: "مغلق",
        },
        page: "صفحة",
        of: "من",
        prev: "السابق ←",
        next: "→ التالي",
      },
      inventory: {
        eyebrow: "رفع المخزون",
        title: "ضمّ عقاراتك للذكاء",
        body:
          "ارفع ملف CSV فيه عقاراتك. كل صف يدخل في خزينة مكتبك ويبدأ يظهر للعملاء على الواتساب فوراً.",
        dropPrompt: "اسحب الملف هنا",
        fileReady: "ملف جاهز",
        orPick: "أو اضغط للاختيار",
        sizeMaxHint: "CSV · أقصى 20 ميجا",
        mustBeCsv: "الملف لازم يكون CSV",
        maxSize: "الحد الأقصى 20 ميجا",
        downloadOk: "النموذج اتنزّل",
        downloadFailed: "ما قدرتش أنزّل النموذج",
        uploadFailed: "حصلت مشكلة في الرفع",
        uploadCta: "ارفع للذكاء",
        switchFile: "← اختار ملف تاني",
        resultEyebrow: "نتيجة الرفع",
        col: {
          total: "إجمالي",
          succeeded: "نجح",
          skipped: "مكرر/مهمل",
          failed: "فشل",
        },
        errorsHeader: "خطأ",
        templateEyebrow: "نموذج CSV",
        templateBody:
          "نزّل ملف فاضي بكل الأعمدة المطلوبة، املاه بعقاراتك، وارفعه.",
        downloadTemplate: "↓ تحميل النموذج",
        columnsEyebrow: "الأعمدة الأساسية",
        columnsTip: "في النموذج فيه أعمدة اختيارية كتير لو حابب تدّيها للذكاء.",
      },
      settings: {
        profileEyebrow: "الملف الشخصي",
        profileTitle: "بيانات المكتب",
        businessName: "اسم المكتب",
        notifEmail: "إيميل التنبيهات",
        brokerPhone: "رقم واتساب الوسيط",
        channel: "قناة التنبيه",
        save: "حفظ التعديلات",
        loadFailed: "ما قدرتش أحمّل الإعدادات",
        saveFailed: "ما قدرتش أحفظ الإعدادات",
        saved: "الإعدادات اتحفظت",
        magicLinkEyebrow: "رابط الواتساب الخاص بيك",
        magicLinkBody: "انشره في إعلاناتك. كل عميل يفتحه يوصل لمكتبك مباشرة.",
        copyLink: "نسخ الرابط",
        copyOk: "الرابط اتنسخ",
        copyFailed: "ما اتنسخش",
        openWhatsapp: "افتح في واتساب ↗",
        accountInfo: "معلومات الحساب",
        plan: "الباقة",
        status: "الحالة",
        active: "نشط",
        suspended: "موقوف",
        brokerId: "رقم الوسيط",
      },
      status: {
        new: "جديد",
        notified: "اتنبه",
        contacted: "تواصلت",
        closed: "مغلق",
      },
    },
  },
};

/* ────────────────────────────────────────────────────────────────
   Lookup
   ──────────────────────────────────────────────────────────────── */

/** Resolve a dotted path like "auth.loginSubmit" against a locale tree. */
export function lookup(locale: Locale, key: string): string {
  const parts = key.split(".");
  let node: Leaf | Tree | undefined = dict[locale];
  for (const p of parts) {
    if (node && typeof node === "object" && p in node) {
      node = (node as Tree)[p];
    } else {
      node = undefined;
      break;
    }
  }
  if (typeof node === "string") return node;
  // Fallback to English if the AR translation is missing.
  if (locale !== "en") return lookup("en", key);
  return key; // last resort: surface the key so we notice
}
