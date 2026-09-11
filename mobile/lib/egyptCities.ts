// Mirrors web/src/lib/egyptCities.ts — keep in sync.
// A comprehensive list of Egyptian cities for the "city" dropdown, grouped by governorate for
// maintainability. "area" stays free text for the specific neighborhood/compound within a city
// (e.g. city "new_cairo", area "Fifth Settlement").
//
// value: stable slug stored in the database (locale-independent, so filtering works across
// languages and doesn't break if a label is edited later).

export interface EgyptCity {
  value: string;
  en: string;
  ar: string;
}

export const EGYPT_CITIES: EgyptCity[] = [
  // Cairo Governorate
  { value: "cairo", en: "Cairo", ar: "القاهرة" },
  { value: "new_cairo", en: "New Cairo", ar: "القاهرة الجديدة" },
  { value: "nasr_city", en: "Nasr City", ar: "مدينة نصر" },
  { value: "heliopolis", en: "Heliopolis", ar: "مصر الجديدة" },
  { value: "maadi", en: "Maadi", ar: "المعادي" },
  { value: "shubra", en: "Shubra", ar: "شبرا" },
  { value: "helwan", en: "Helwan", ar: "حلوان" },
  { value: "badr_city", en: "Badr City", ar: "مدينة بدر" },
  { value: "new_administrative_capital", en: "New Administrative Capital", ar: "العاصمة الإدارية الجديدة" },
  { value: "15th_of_may_city", en: "15th of May City", ar: "مدينة 15 مايو" },
  { value: "el_shorouk", en: "El Shorouk", ar: "الشروق" },
  { value: "el_obour", en: "Obour City", ar: "مدينة العبور" },

  // Giza Governorate
  { value: "giza", en: "Giza", ar: "الجيزة" },
  { value: "6th_of_october", en: "6th of October City", ar: "مدينة 6 أكتوبر" },
  { value: "sheikh_zayed", en: "Sheikh Zayed City", ar: "مدينة الشيخ زايد" },
  { value: "al_ayyat", en: "Al-Ayyat", ar: "العياط" },
  { value: "al_badrashin", en: "Al-Badrashin", ar: "البدرشين" },
  { value: "al_hawamdiya", en: "Al-Hawamdiya", ar: "الحوامدية" },
  { value: "atfih", en: "Atfih", ar: "أطفيح" },
  { value: "awsim", en: "Awsim", ar: "أوسيم" },
  { value: "kerdasa", en: "Kerdasa", ar: "كرداسة" },

  // Alexandria Governorate
  { value: "alexandria", en: "Alexandria", ar: "الإسكندرية" },
  { value: "borg_el_arab", en: "Borg El Arab", ar: "برج العرب" },
  { value: "new_borg_el_arab", en: "New Borg El Arab", ar: "برج العرب الجديدة" },

  // Qalyubia Governorate
  { value: "banha", en: "Banha", ar: "بنها" },
  { value: "qalyub", en: "Qalyub", ar: "قليوب" },
  { value: "shubra_el_kheima", en: "Shubra El Kheima", ar: "شبرا الخيمة" },
  { value: "al_khanka", en: "Al Khanka", ar: "الخانكة" },
  { value: "kafr_shukr", en: "Kafr Shukr", ar: "كفر شكر" },
  { value: "qaha", en: "Qaha", ar: "قها" },
  { value: "tukh", en: "Tukh", ar: "طوخ" },
  { value: "shibin_el_qanater", en: "Shibin El Qanater", ar: "شبين القناطر" },

  // Dakahlia Governorate
  { value: "mansoura", en: "Mansoura", ar: "المنصورة" },
  { value: "talkha", en: "Talkha", ar: "طلخا" },
  { value: "mit_ghamr", en: "Mit Ghamr", ar: "ميت غمر" },
  { value: "dekernes", en: "Dekernes", ar: "دكرنس" },
  { value: "aga", en: "Aga", ar: "أجا" },
  { value: "belqas", en: "Belqas", ar: "بلقاس" },
  { value: "gamasa", en: "Gamasa", ar: "جمصة" },
  { value: "manzala", en: "Manzala", ar: "المنزلة" },
  { value: "sherbin", en: "Sherbin", ar: "شربين" },
  { value: "sinbillawin", en: "Sinbillawin", ar: "السنبلاوين" },
  { value: "temay_el_amdid", en: "Temay El Amdid", ar: "تمي الأمديد" },

  // Red Sea Governorate
  { value: "hurghada", en: "Hurghada", ar: "الغردقة" },
  { value: "safaga", en: "Safaga", ar: "سفاجا" },
  { value: "el_quseir", en: "El Quseir", ar: "القصير" },
  { value: "marsa_alam", en: "Marsa Alam", ar: "مرسى علم" },
  { value: "ras_ghareb", en: "Ras Ghareb", ar: "رأس غارب" },
  { value: "el_gouna", en: "El Gouna", ar: "الجونة" },

  // Beheira Governorate
  { value: "damanhur", en: "Damanhur", ar: "دمنهور" },
  { value: "kafr_el_dawwar", en: "Kafr El Dawwar", ar: "كفر الدوار" },
  { value: "rashid", en: "Rashid (Rosetta)", ar: "رشيد" },
  { value: "edku", en: "Edku", ar: "إدكو" },
  { value: "abu_hummus", en: "Abu Hummus", ar: "أبو حمص" },
  { value: "abu_el_matamir", en: "Abu El Matamir", ar: "أبو المطامير" },
  { value: "delengat", en: "Delengat", ar: "الدلنجات" },
  { value: "itay_el_baroud", en: "Itay El Baroud", ar: "إيتاي البارود" },
  { value: "kom_hamada", en: "Kom Hamada", ar: "كوم حمادة" },
  { value: "mahmoudiyah", en: "Mahmoudiyah", ar: "المحمودية" },
  { value: "wadi_el_natrun", en: "Wadi El Natrun", ar: "وادي النطرون" },

  // Fayoum Governorate
  { value: "fayoum", en: "Fayoum", ar: "الفيوم" },
  { value: "ibsheway", en: "Ibsheway", ar: "إبشواي" },
  { value: "sinnuris", en: "Sinnuris", ar: "سنورس" },
  { value: "tamiya", en: "Tamiya", ar: "طامية" },
  { value: "etsa", en: "Etsa", ar: "إطسا" },
  { value: "yousef_el_seddik", en: "Yousef El Seddik", ar: "يوسف الصديق" },

  // Gharbiya Governorate
  { value: "tanta", en: "Tanta", ar: "طنطا" },
  { value: "el_mahalla_el_kubra", en: "El Mahalla El Kubra", ar: "المحلة الكبرى" },
  { value: "kafr_el_zayat", en: "Kafr El Zayat", ar: "كفر الزيات" },
  { value: "zifta", en: "Zifta", ar: "زفتى" },
  { value: "santa", en: "Santa", ar: "السنطة" },
  { value: "basyoun", en: "Basyoun", ar: "بسيون" },
  { value: "qutur", en: "Qutur", ar: "قطور" },
  { value: "samannoud", en: "Samannoud", ar: "سمنود" },

  // Ismailia Governorate
  { value: "ismailia", en: "Ismailia", ar: "الإسماعيلية" },
  { value: "fayed", en: "Fayed", ar: "فايد" },
  { value: "qantara_sharq", en: "Qantara Sharq", ar: "القنطرة شرق" },
  { value: "tell_el_kebir", en: "Tell El Kebir", ar: "التل الكبير" },
  { value: "abu_suwir", en: "Abu Suwir", ar: "أبو صوير" },

  // Monufia Governorate
  { value: "shibin_el_kom", en: "Shibin El Kom", ar: "شبين الكوم" },
  { value: "menouf", en: "Menouf", ar: "منوف" },
  { value: "ashmoun", en: "Ashmoun", ar: "أشمون" },
  { value: "bagour", en: "Bagour", ar: "الباجور" },
  { value: "berket_el_sab", en: "Berket El Sab", ar: "بركة السبع" },
  { value: "quesna", en: "Quesna", ar: "قويسنا" },
  { value: "sadat_city", en: "Sadat City", ar: "مدينة السادات" },
  { value: "tala", en: "Tala", ar: "تلا" },

  // Minya Governorate
  { value: "minya", en: "Minya", ar: "المنيا" },
  { value: "mallawi", en: "Mallawi", ar: "ملوي" },
  { value: "beni_mazar", en: "Beni Mazar", ar: "بني مزار" },
  { value: "samalut", en: "Samalut", ar: "سمالوط" },
  { value: "maghagha", en: "Maghagha", ar: "مغاغة" },
  { value: "matai", en: "Matai", ar: "مطاي" },
  { value: "abu_qurqas", en: "Abu Qurqas", ar: "أبو قرقاص" },

  // Qena Governorate
  { value: "qena", en: "Qena", ar: "قنا" },
  { value: "nag_hammadi", en: "Nag Hammadi", ar: "نجع حمادي" },
  { value: "qus", en: "Qus", ar: "قوص" },
  { value: "naqada", en: "Naqada", ar: "نقادة" },
  { value: "abu_tesht", en: "Abu Tesht", ar: "أبو تشت" },
  { value: "deshna", en: "Deshna", ar: "دشنا" },
  { value: "farshut", en: "Farshut", ar: "فرشوط" },

  // New Valley Governorate
  { value: "kharga", en: "Kharga", ar: "الخارجة" },
  { value: "dakhla", en: "Dakhla", ar: "الداخلة" },
  { value: "farafra", en: "Farafra", ar: "الفرافرة" },

  // Suez Governorate
  { value: "suez", en: "Suez", ar: "السويس" },
  { value: "ain_sokhna", en: "Ain Sokhna", ar: "العين السخنة" },

  // Aswan Governorate
  { value: "aswan", en: "Aswan", ar: "أسوان" },
  { value: "kom_ombo", en: "Kom Ombo", ar: "كوم أمبو" },
  { value: "edfu", en: "Edfu", ar: "إدفو" },
  { value: "daraw", en: "Daraw", ar: "دراو" },
  { value: "abu_simbel", en: "Abu Simbel", ar: "أبو سمبل" },

  // Assiut Governorate
  { value: "assiut", en: "Assiut", ar: "أسيوط" },
  { value: "dairut", en: "Dairut", ar: "ديروط" },
  { value: "abnub", en: "Abnub", ar: "أبنوب" },
  { value: "abu_tig", en: "Abu Tig", ar: "أبو تيج" },
  { value: "el_badari", en: "El Badari", ar: "البداري" },
  { value: "manfalut", en: "Manfalut", ar: "منفلوط" },
  { value: "sidfa", en: "Sidfa", ar: "صدفا" },

  // Beni Suef Governorate
  { value: "beni_suef", en: "Beni Suef", ar: "بني سويف" },
  { value: "al_wasty", en: "Al Wasty", ar: "الواسطى" },
  { value: "biba", en: "Biba", ar: "ببا" },
  { value: "el_fashn", en: "El Fashn", ar: "الفشن" },
  { value: "naser", en: "Naser", ar: "ناصر" },

  // Port Said Governorate
  { value: "port_said", en: "Port Said", ar: "بورسعيد" },
  { value: "port_fouad", en: "Port Fouad", ar: "بورفؤاد" },

  // Damietta Governorate
  { value: "damietta", en: "Damietta", ar: "دمياط" },
  { value: "new_damietta", en: "New Damietta", ar: "دمياط الجديدة" },
  { value: "faraskur", en: "Faraskur", ar: "فارسكور" },
  { value: "kafr_saad", en: "Kafr Saad", ar: "كفر سعد" },
  { value: "ras_el_bar", en: "Ras El Bar", ar: "رأس البر" },

  // Sharqia Governorate
  { value: "zagazig", en: "Zagazig", ar: "الزقازيق" },
  { value: "10th_of_ramadan", en: "10th of Ramadan City", ar: "مدينة العاشر من رمضان" },
  { value: "belbeis", en: "Belbeis", ar: "بلبيس" },
  { value: "abu_hammad", en: "Abu Hammad", ar: "أبو حماد" },
  { value: "abu_kabir", en: "Abu Kabir", ar: "أبو كبير" },
  { value: "faqous", en: "Faqous", ar: "فاقوس" },
  { value: "hehia", en: "Hehia", ar: "ههيا" },
  { value: "kafr_saqr", en: "Kafr Saqr", ar: "كفر صقر" },
  { value: "minya_el_qamh", en: "Minya El Qamh", ar: "منيا القمح" },
  { value: "san_el_hagar", en: "San El Hagar", ar: "صان الحجر" },

  // South Sinai Governorate
  { value: "sharm_el_sheikh", en: "Sharm El Sheikh", ar: "شرم الشيخ" },
  { value: "dahab", en: "Dahab", ar: "دهب" },
  { value: "nuweiba", en: "Nuweiba", ar: "نويبع" },
  { value: "taba", en: "Taba", ar: "طابا" },
  { value: "el_tor", en: "El Tor", ar: "الطور" },
  { value: "saint_catherine", en: "Saint Catherine", ar: "سانت كاترين" },
  { value: "ras_sedr", en: "Ras Sedr", ar: "رأس سدر" },

  // Kafr El Sheikh Governorate
  { value: "kafr_el_sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { value: "desouk", en: "Desouk", ar: "دسوق" },
  { value: "fuwwah", en: "Fuwwah", ar: "فوة" },
  { value: "baltim", en: "Baltim", ar: "بلطيم" },
  { value: "biyala", en: "Biyala", ar: "بيلا" },
  { value: "metoubes", en: "Metoubes", ar: "مطوبس" },
  { value: "qallin", en: "Qallin", ar: "قلين" },
  { value: "sidi_salem", en: "Sidi Salem", ar: "سيدي سالم" },

  // Matrouh Governorate
  { value: "marsa_matrouh", en: "Marsa Matrouh", ar: "مرسى مطروح" },
  { value: "el_alamein", en: "El Alamein", ar: "العلمين" },
  { value: "el_dabaa", en: "El Dabaa", ar: "الضبعة" },
  { value: "siwa", en: "Siwa", ar: "سيوة" },
  { value: "sidi_barrani", en: "Sidi Barrani", ar: "سيدي براني" },
  { value: "north_coast", en: "North Coast", ar: "الساحل الشمالي" },

  // Luxor Governorate
  { value: "luxor", en: "Luxor", ar: "الأقصر" },
  { value: "armant", en: "Armant", ar: "أرمنت" },
  { value: "esna", en: "Esna", ar: "إسنا" },

  // North Sinai Governorate
  { value: "arish", en: "Arish", ar: "العريش" },
  { value: "bir_al_abd", en: "Bir al-Abd", ar: "بئر العبد" },
  { value: "sheikh_zuweid", en: "Sheikh Zuweid", ar: "الشيخ زويد" },
  { value: "rafah", en: "Rafah", ar: "رفح" },
  { value: "nakhl", en: "Nakhl", ar: "نخل" },

  // Sohag Governorate
  { value: "sohag", en: "Sohag", ar: "سوهاج" },
  { value: "akhmim", en: "Akhmim", ar: "أخميم" },
  { value: "girga", en: "Girga", ar: "جرجا" },
  { value: "tahta", en: "Tahta", ar: "طهطا" },
  { value: "tima", en: "Tima", ar: "طما" },
  { value: "el_balyana", en: "El Balyana", ar: "البلينا" },
  { value: "dar_el_salam", en: "Dar El Salam", ar: "دار السلام" },
];

export const EGYPT_CITY_MAP: Record<string, EgyptCity> = Object.fromEntries(
  EGYPT_CITIES.map((c) => [c.value, c]),
);

// Falls back to the raw stored value for older free-text city data entered before this dropdown
// existed, so nothing breaks for listings created earlier.
export function cityLabel(value: string | null | undefined, locale: "en" | "ar"): string {
  if (!value) return "";
  const city = EGYPT_CITY_MAP[value];
  if (!city) return value;
  return locale === "ar" ? city.ar : city.en;
}
