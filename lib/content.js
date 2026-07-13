// ODTÜ VT içerik verisi — www.odtuvt.org.tr'den birebir çekilmiştir (Temmuz 2026).
// Görseller de aynı kaynaktan indirilip /public/img/odtuvt altına alınmıştır.
// Tek kaynaktan yönetilir; sayfa şablonları buradan beslenir.

const IMG = "/img/odtuvt";

const site = {
  name: "ODTÜ Verimlilik Topluluğu",
  short: "ODTÜ VT",
  founded: 1992,
  slogan: "Become a Leader With Us",
  claim: "1992'den beri kampüsün üretim merkezi.",
  heroLede:
    "Farklı disiplinlerden öğrenciler, yaratıcı projeler, geniş kapsamlı etkinlikler, sosyal sorumluluk, kariyer fırsatları ve çok daha fazlası...",
  description:
    "ODTÜ Verimlilik Topluluğu, 1992 yılından bu yana farklı disiplinlerden öğrencileri bir araya getirerek, iş dünyası ve akademik çevrelerle güçlü bir köprü kurmayı hedeflemektedir.",
  about: [
    "Orta Doğu Teknik Üniversitesi Verimlilik Topluluğu, 1992 yılında kurulmuş, kurulduğu günden beri ODTÜ'de bulunan tüm bölümlerden öğrencileri bünyesine katmıştır. Topluluk olarak amacımız; yarattığımız farklılıklarla lider bir öğrenci topluluğu olmak, öğrenciler ile akademisyenler ve iş dünyasından profesyoneller arasında bilgi ve tecrübe akışını sağlamak, ulaştığı kitlenin sosyal ve kişisel gelişimine katkıda bulunmaktır.",
    "ODTÜ VT, her sene iş dünyasından profesyoneller ve akademik dünyadan uzmanlar ile öğrencileri; gündem oluşturan, yaratıcı ve ilgi çekici konularda buluşturur. Her sene düzenlediği farklı projelerle 80'den fazla etkinlik gerçekleştiren ODTÜ VT, Türkiye ve Avrupa'dan yaklaşık olarak 5000 seçkin öğrenci ve akademisyeni katılımcı olarak ağırlamaktadır. Topluluğumuz gerçekleştirdiği tüm etkinlikleri, katılımcılara ücretsiz olarak sunmaktadır."
  ],
  vision:
    "Verimlilik Topluluğu, geleceğe yönelik adımlarında, “Yarattığı farklılıklarla ulusal ve uluslararası alanda lider öğrenci topluluğu olmak” düşüncesini taşımaktadır. Öğrencilerin sosyal, kişisel ve akademik gelişimlerine katkı sağlayarak, iş dünyası ve akademi arasında kalıcı bağlar kurmayı hedeflemektedir.",
  mission:
    "Farklı alanlarda düzenlediği etkinlikler yoluyla; paydaşlarına değer katarak, ulusal ve uluslararası alanda etkili bir iletişim ortamı sağlamayı, öğrenciler ile akademisyenler ve iş dünyasından profesyoneller arasında bilgi ve tecrübe akışını sağlamayı, ulaştığı kitlenin farklı disiplinlerdeki bilgi birikimini arttırmayı, ODTÜ öğrencilerinin sosyal ve kişisel gelişimine katkıda bulunmayı amaçlamaktadır.",
  address:
    "Üniversiteler Mahallesi, ODTÜ Endüstri Mühendisliği Binası, Verimlilik Topluluğu Odası, Ankara / Türkiye",
  phone: "0 (312) 210 60 12",
  email: "info@odtuvt.org.tr",
  aboutImage: `${IMG}/anasayfa-hakkimizda-resim-BGY7ZZ.png`,
  social: {
    instagram: "https://www.instagram.com/odtu_vt",
    youtube: "https://www.youtube.com/c/ODT%C3%9CVerimlilikToplulu%C4%9Fu",
    linkedin: "https://www.linkedin.com/company/metu-productivity-club/",
    x: "https://x.com/odtu_vt",
    facebook: "https://www.facebook.com/odtuverimliliktoplulugu",
    original: "https://www.odtuvt.org.tr/"
  },
  // Rakamlar sitenin kendi sayaç bölümünden (data-to değerleri)
  stats: [
    { value: "34", label: "yıllık tecrübe" },
    { value: "6", label: "farklı proje" },
    { value: "90+", label: "şirket iş birliği" },
    { value: "300+", label: "aktif üye" },
    { value: "%100", label: "etkinlikler ücretsiz" }
  ]
};

const projects = [
  {
    slug: "ymg",
    name: "Yönetim ve Mühendislik Günleri",
    short: "YMG",
    tagline: "Ankara'nın en geniş katılımcılı öğrenci etkinliği.",
    summary:
      "Öğrencileri, alanında başarılı şirketler ve yetkin konuşmacılarla buluşturan üç günlük seminer etkinliği. Zengin katılımlı fuayesiyle networking imkânı sunar.",
    body: [
      "Yönetim ve Mühendislik Günleri, her yıl Verimlilik Topluluğu tarafından düzenlenen, öğrenciler ile alanında başarılı şirketleri ve yetkin konuşmacıları buluşturarak bilgi aktarımı sağlamayı hedefleyen bir seminer etkinliğidir. Üç gün süren etkinlikte seminerler, paneller ve söyleşiler ile katılımcıların en üst düzeyde faydalanması, lider konuşmacıların da tecrübe aktarımı yoluyla katılımcılara benzersiz bir kişisel gelişim fırsatı sunması amaçlanmaktadır.",
      "Oturumların yanı sıra zengin katılımlı fuayesiyle de şirketlere ve katılımcılara networking imkânı sunar. Yönetim ve Mühendislik Günleri sadece ODTÜ'nün değil, aynı zamanda Ankara'nın da en geniş katılımcılı öğrenci etkinliğidir. Ağırladığı konuşmacılarla ve iş birliği yaptığı şirketlerle her sene bu unvanı hak ederek ulusal çapta katılımcı almaktadır.",
      "Yönetim ve Mühendislik Günleri PLUS, YMG'ye ek olarak gerçekleştirilen, katılımcıların her sene belirli departmanlar bazında kafalarındaki soru işaretlerini gidermeye yönelik teknik bir etkinliktir. Öğrencilerin akademik yaşamda teorik olarak öğrendiği ancak iş dünyasında ne şekilde uygulandığını bilmediği teknik bilgiler, lider şirketler tarafından öğrencilere aktarılır."
    ],
    facts: [
      { label: "Format", value: "3 gün seminer, panel, söyleşi" },
      { label: "Etkinlik yeri", value: "ODTÜ KKM, Çankaya / Ankara" },
      { label: "Katılım", value: "Ücretsiz, yüz yüze" }
    ],
    team: [
      { name: "Fuat Tuna Tümer", role: "YMG'den Sorumlu Yönetim Kurulu Üyesi", photo: `${IMG}/fuat-tuna-tumer-840POP.jpeg` },
      { name: "Cevat Miraç Aydoğan", role: "YMG Proje Lideri", photo: `${IMG}/cevat-mirac-aydogan-ZFPS8Z.jpeg` },
      { name: "Candan Tok", role: "YMG Proje Lideri", photo: `${IMG}/candan-tok-0N7EAA.jpeg` }
    ],
    hero: `${IMG}/yonetim-ve-muhendislik-gunleri-etkinlik-resmi-4BM1B5.jpg`,
    gallery: [
      `${IMG}/yonetim-ve-muhendislik-gunleri-galeri-resmi-167X5B.jpeg`,
      `${IMG}/yonetim-ve-muhendislik-gunleri-galeri-resmi-2YQTW6.jpg`,
      `${IMG}/yonetim-ve-muhendislik-gunleri-galeri-resmi-3MTDWL.jpg`
    ],
    icon: "mic",
    external: "https://www.odtuvt.org.tr/proje-yonetim-ve-muhendislik-gunleri",
    theme: "dark",
    featured: true
  },
  {
    slug: "vakavt",
    name: "VakaVT",
    short: "VakaVT",
    tagline: "Türkiye'nin en prestijli vaka analizi yarışması.",
    summary:
      "2015'ten beri, bölüm veya okul kriteri olmadan 3 kişilik takımlar gerçek şirket vakalarını kısıtlı sürede çözmek için yarışıyor. Tamamen İngilizce.",
    body: [
      "VakaVT, Türkiye'nin en prestijli vaka analizi yarışmasıdır. 2015 yılında ODTÜ Verimlilik Topluluğu bünyesine katılan bu yarışmada, takımların kısıtlı zamanda sorun çözme becerileri ölçülür. Tamamen İngilizce olarak gerçekleştirilen VakaVT, katılımcılarına farklı sektörlerde gerçek vakalar üzerinde çalışarak şirketlerle birebir iletişim kurma ve bilgilerini uygulama fırsatı sunar.",
      "Katılımcılar yalnızca vaka içeriklerini çözmekle kalmaz; aynı zamanda sınırlı zamanda karar verebilme, çözüm geliştirme, takım çalışması ve sunum becerileri gibi yeteneklerini de sergileme imkânı bulurlar.",
      "Öğrenciler bölüm veya okul kriteri olmadan 3 kişilik takımlar hâlinde başvurabilir. Başvuran takımlar üç aşamalı bir ön eleme sürecinden geçirilir ve finale kalan 6 takım belirlenir. Finalistler, Ankara'da düzenlenen 3 günlük etkinliğe davet edilir; 5 farklı departmana ait 5 ayrı vakayı çözerek jüri karşısında sunum yaparlar. Jüri üyeleriyle birebir iletişim ve doğrudan geri bildirim fırsatı sunan süreç, kazanan takımların ödüllerini aldığı görkemli bir gala yemeğiyle son bulur."
    ],
    facts: [
      { label: "Takım", value: "3 kişi, bölüm/okul kriteri yok" },
      { label: "Dil", value: "İngilizce" },
      { label: "Final", value: "6 takım, 5 vaka, 3 gün + gala" }
    ],
    team: [
      { name: "Bengisu Çonoğlu", role: "VakaVT'den Sorumlu Yönetim Kurulu Üyesi", photo: `${IMG}/bengisu-conoglu-IRLU2U.jpeg` },
      { name: "Aybike Balcı", role: "VakaVT Proje Lideri", photo: `${IMG}/aybike-balci-M9PR4E.jpeg` }
    ],
    hero: `${IMG}/vakavt-etkinlik-resmi-HB27P6.jpg`,
    gallery: [
      `${IMG}/vakavt-galeri-resmi-11AMH2.jpeg`,
      `${IMG}/vakavt-galeri-resmi-5MKUJ7.jpeg`,
      `${IMG}/vakavt-galeri-resmi-AJ17WN.jpeg`
    ],
    icon: "target",
    external: "https://www.odtuvt.org.tr/proje-vakavt",
    theme: "light",
    featured: true
  },
  {
    slug: "wequal",
    name: "W'EQUAL",
    short: "W'EQUAL",
    tagline: "Eşit haklar için farkındalık.",
    summary:
      "Toplumsal cinsiyet eşitliği ve insan hakları konularında bilinçli bireyler yetiştirmeyi amaçlayan farkındalık projesi.",
    body: [
      "W'EQUAL, ODTÜ Verimlilik Topluluğu'nun projelerinden biri olarak, her bireyin sosyal yaşamda ve iş hayatında eşit haklara sahip olması gerektiği inancıyla yürütülen bir farkındalık projesidir. Toplumsal cinsiyet eşitliği ve insan hakları konularında bilinçli bireyler yetiştirmeyi amaçlayan W'EQUAL, bu doğrultuda çeşitli söyleşiler, paneller, seminerler ve atölyeler düzenler.",
      "Proje kapsamındaki en kapsamlı etkinliklerden biri olan W'EQUAL Paneli; tüm Türkiye'ye açık, ücretsiz, erişilebilir ve sertifikalı bir etkinliktir. Farklı disiplinlerden gelen konuşmacılar toplumsal cinsiyet eşitliğini kendi uzmanlık alanlarının bakış açısından ele alır; eşitlik konusu hukuk, sağlık, eğitim, spor, medya gibi pek çok alan üzerinden çok yönlü tartışılır.",
      "Bir diğer önemli etkinlik olan Yaşayan Kütüphane, “Her insan bir kitaptır” mottosuyla düzenlenir; gönüllü konuşmacılar yani 'kitaplar', katılımcılarla birebir etkileşim kurarak önyargıların kırılmasına ve empati ortamının oluşmasına katkı sağlar."
    ],
    facts: [
      { label: "Odak", value: "Toplumsal cinsiyet eşitliği, insan hakları" },
      { label: "Etkinlikler", value: "W'EQUAL Paneli, Yaşayan Kütüphane" },
      { label: "Katılım", value: "Tüm Türkiye'ye açık, ücretsiz, sertifikalı" }
    ],
    team: [
      { name: "Berk Duran", role: "W'EQUAL'dan Sorumlu Yönetim Kurulu Üyesi", photo: `${IMG}/berk-duran-RDVHL4.jpeg` },
      { name: "Ege Turan", role: "W'EQUAL Proje Lideri", photo: `${IMG}/ege-turan-2HR8ZP.jpeg` },
      { name: "Esila Bulut", role: "W'EQUAL Proje Lideri", photo: `${IMG}/esila-bulut-NSLI5S.jpeg` }
    ],
    hero: `${IMG}/wequal-etkinlik-resmi-GH30FK.jpg`,
    gallery: [
      `${IMG}/wequal-galeri-resmi-509IK2.jpeg`,
      `${IMG}/wequal-galeri-resmi-6PVBWI.jpg`,
      `${IMG}/wequal-galeri-resmi-81TKA6.jpeg`
    ],
    icon: "scale",
    external: "https://www.odtuvt.org.tr/proje-wequal",
    theme: "light",
    featured: false
  },
  {
    slug: "estiem",
    name: "ESTIEM",
    short: "ESTIEM",
    tagline: "Avrupa'nın endüstri mühendisliği ağı, Ankara'da.",
    summary:
      "Avrupa genelinde 77 üniversitede örgütlü ESTIEM'in Ankara yerel grubunu, 1996'dan beri ilk Türk yerel grubu olarak temsil ediyoruz.",
    body: [
      "ESTIEM (European Students of Industrial Engineering and Management), Avrupa çapında Endüstri Mühendisliği ve İşletme öğrencilerini bir araya getiren uluslararası bir projedir. Avrupa genelinde 77 farklı üniversitede bulunan ESTIEM'in, ODTÜ Verimlilik Topluluğu olarak Ankara yerel grubunu temsil ediyoruz. 1996 yılında ilk Türk yerel grubu olarak ESTIEM ağına katılan üniversitemiz, bugüne kadar birçok başarılı uluslararası etkinliğe ev sahipliği yapmış bulunuyor.",
      "Topluluğumuzda eğitimi ve eğlenceyi aynı sahnede buluşturmak en büyük ilham kaynağımız. Hem akademik hem de kültürel etkinliklerimizle katılımcılara Endüstri Mühendisliği ve Yönetimi (IEM) alanında kendilerini keşfetme ve geliştirme imkânı sunarken, hafızalarda uzun süre yer edecek özel anlar yaratıyoruz."
    ],
    facts: [
      { label: "Ağ", value: "Avrupa'da 77 üniversite" },
      { label: "Rol", value: "Ankara yerel grubu" },
      { label: "Katılım", value: "1996, ilk Türk yerel grubu" }
    ],
    team: [
      { name: "İnanç Deniz Gözgözoğlu", role: "ESTIEM'den Sorumlu Yönetim Kurulu Üyesi", photo: `${IMG}/inanc-deniz-gozgozoglu-UASM5F.jpeg` },
      { name: "Çağlan Olurluk", role: "ESTIEM Ankara METU Yerel Grup Sorumlusu", photo: `${IMG}/caglan-olurluk-5IEKZM.jpeg` }
    ],
    hero: `${IMG}/estiem-etkinlik-resmi-EJ0ITM.jpg`,
    gallery: [
      `${IMG}/estiem-galeri-resmi-59BQCS.jpeg`,
      `${IMG}/estiem-galeri-resmi-7ZTX42.jpeg`,
      `${IMG}/estiem-galeri-resmi-LU240G.jpeg`
    ],
    icon: "globe",
    external: "https://www.odtuvt.org.tr/proje-estiem",
    theme: "light",
    featured: false
  },
  {
    slug: "ogp",
    name: "ODTÜlüler için Gelecek Planları",
    short: "OGP",
    tagline: "Öğrencilerle şirketleri buluşturan köprü.",
    summary:
      "Panel, söyleşi, fabrika ve ofis gezileriyle ODTÜ öğrencilerini şirketlerle tanıştırıp bilinçli kariyer planlamasına yardımcı olur.",
    body: [
      "ODTÜlüler İçin Gelecek Planları, ODTÜ Verimlilik Topluluğu'nun öğrencilerle şirketleri buluşturduğu projesidir. Düzenlediği panel, söyleşi, fabrika ve ofis gezileriyle ODTÜ öğrencilerini şirketlerle tanıştırıp kariyer seçenekleri konusunda bilgilendirir ve daha bilinçli bir kariyer planlaması yapmalarına yardımcı olur.",
      "Bi'de Mezuna Sor! etkinlikleri, partner şirketlerde aktif rol alan ODTÜ mezunlarıyla öğrencileri buluşturan söyleşilerdir. Şirket Sunumu etkinliklerinde öğrencilerin kariyer tercihlerinde değerlendirebileceği şirketler kampüste ağırlanır; bazı etkinliklerde staj ve işe alım fırsatları da sunulur.",
      "Mock Your Future (MY Future) ise en yeni etkinliğimizdir: kapsamlı bir CV ön elemesinden geçen öğrenciler, sektör lideri şirketlerle simülatif mülakatlarda buluşturulur. Mülakat simülasyonlarının yanı sıra vaka analizi yarışmaları düzenlenir ve ödüller sunulur; öğrenciler networking imkânı elde ederken şirketler potansiyel yeteneklerle tanışır."
    ],
    facts: [
      { label: "Etkinlikler", value: "Bi'de Mezuna Sor!, Şirket Sunumu, MY Future" },
      { label: "Format", value: "Panel, söyleşi, fabrika ve ofis gezileri" },
      { label: "Kazanım", value: "Staj ve işe alım fırsatları" }
    ],
    team: [
      { name: "Yiğit Efe Özdemir", role: "OGP'den Sorumlu Yönetim Kurulu Üyesi", photo: `${IMG}/yigit-efe-ozdemir-JTGEXS.jpeg` },
      { name: "Dicle Gül", role: "OGP Proje Lideri", photo: `${IMG}/dicle-gul-Q2LUBD.jpeg` },
      { name: "Gökay Altıntaş", role: "OGP Proje Lideri", photo: `${IMG}/gokay-altintas-DYJQWK.jpeg` }
    ],
    hero: `${IMG}/odtululer-icin-gelecek-planlari-etkinlik-resmi-M7OC23.jpg`,
    gallery: [
      `${IMG}/odtululer-icin-gelecek-planlari-galeri-resmi-01524F.jpeg`,
      `${IMG}/odtululer-icin-gelecek-planlari-galeri-resmi-84S9WE.jpeg`,
      `${IMG}/odtululer-icin-gelecek-planlari-galeri-resmi-8QJOB8.jpeg`
    ],
    icon: "compass",
    external: "https://www.odtuvt.org.tr/proje-odtululer-icin-gelecek-planlari",
    theme: "light",
    featured: true
  },
  {
    slug: "kybele",
    name: "Kybele",
    short: "Kybele",
    tagline: "Kültür, sanat ve düşünce platformu.",
    summary:
      "2004'ten beri yayımlanan Kybele Dergisi ve her yıl düzenlenen Kybele Zirvesi ile üyelere yazarlık ve üretim alanı açar.",
    body: [
      "Kybele, kariyer alanında öne çıkan topluluğumuzun kültür, sanat ve düşünce platformudur. Üyelerimize yazarlık deneyimi kazandıran ve onların ilgi duydukları alanlarda özgürce üretim yapabilecekleri bir ortam sunar. Bu platformun merkezinde yer alan Kybele Dergisi, 2004 yılından bu yana her yıl yayımlanan sayılarıyla okuyucularla buluşur.",
      "Her yıl kültür, sanat ve spor alanlarında düzenlenen Kybele Zirvesi, bu alanlarda tanınmış ve ilham verici isimleri bir araya getirerek katılımcılara farklı bakış açıları kazandırmayı hedefler. Zirvede gerçekleşen söyleşiler, katılımcıların hem kişisel gelişimine hem de kültürel birikimine katkı sunar.",
      "Kybele Projesi, sadece bir yayın ya da etkinlik platformu değil; aynı zamanda özgürce düşünmenin, birlikte üretmenin ve profesyonel bir deneyim kazanmanın da adresidir."
    ],
    facts: [
      { label: "Dergi", value: "2004'ten beri her yıl yayında" },
      { label: "Zirve", value: "Kültür, sanat ve spor alanlarında" },
      { label: "Kazanım", value: "Yazarlık ve organizasyon deneyimi" }
    ],
    team: [
      { name: "Azra Zöngür", role: "Kybele'den Sorumlu Yönetim Kurulu Üyesi", photo: `${IMG}/azra-zongur-M6QH0K.jpeg` },
      { name: "Derin Nesil Çelik", role: "Kybele Proje Lideri", photo: `${IMG}/derin-nesil-celik-GIOX1E.jpeg` }
    ],
    hero: `${IMG}/kybele-etkinlik-resmi-77FQVZ.jpg`,
    gallery: [
      `${IMG}/kybele-galeri-resmi-97LDUB.jpeg`,
      `${IMG}/kybele-galeri-resmi-FVS9NS.jpeg`,
      `${IMG}/kybele-galeri-resmi-YYJRU1.jpeg`
    ],
    icon: "book",
    external: "https://www.odtuvt.org.tr/proje-kybele",
    theme: "light",
    featured: false
  }
];

// Yönetim Kurulu — odtuvt.org.tr/ekibimiz
const board = [
  { name: "Berk Duran", role: "Yönetim Kurulu Başkanı", photo: `${IMG}/berk-duran-RDVHL4.jpeg` },
  { name: "Azra Zöngür", role: "Başkan Yardımcısı", photo: `${IMG}/azra-zongur-M6QH0K.jpeg` },
  { name: "Yiğit Efe Özdemir", role: "Genel Sekreter", photo: `${IMG}/yigit-efe-ozdemir-JTGEXS.jpeg` },
  { name: "Bengisu Çonoğlu", role: "Ulusal İlişkilerden Sorumlu YK Üyesi", photo: `${IMG}/bengisu-conoglu-IRLU2U.jpeg` },
  { name: "İnanç Deniz Gözgözoğlu", role: "Uluslararası İlişkilerden Sorumlu YK Üyesi", photo: `${IMG}/inanc-deniz-gozgozoglu-UASM5F.jpeg` },
  { name: "Fuat Tuna Tümer", role: "Halkla İlişkilerden Sorumlu YK Üyesi", photo: `${IMG}/fuat-tuna-tumer-840POP.jpeg` },
  { name: "Demir Uluocak", role: "Mali İşlerden Sorumlu YK Üyesi", photo: `${IMG}/demir-uluocak-VZ2KRC.jpeg` }
];

// Denetleme ve Danışma Kurulu
const advisors = [
  { name: "Ceren Kaya", role: "Denetleme ve Danışma Kurulu", photo: `${IMG}/ceren-kaya-1U1IDC.jpeg` },
  { name: "Ebru Başak Arıkan", role: "Denetleme ve Danışma Kurulu", photo: `${IMG}/ebru-basak-arikan-NDCSKE.jpeg` },
  { name: "Mehmet Ali Konyalıoğlu", role: "Denetleme ve Danışma Kurulu", photo: `${IMG}/mehmet-ali-konyalioglu-IZU4VS.jpg` }
];

// Komiteler — her biri odtuvt.org.tr'deki kendi sayfasından
const committees = [
  {
    slug: "dizayn",
    name: "Dizayn Komitesi",
    summary:
      "Topluluğun ve projelerin tanıtımında kullanılan görsel ve basılı materyallerin tasarımından sorumludur.",
    body: [
      "Dizayn Komitesi, topluluğumuzun ve projelerimizin tanıtımı için yararlandığımız görsel ve basılı materyallerin tasarımından sorumludur. Dizayn Komitesi koordinatörleri, görev dağılımıyla birlikte tüm projeleri ve topluluğu en iyi şekilde tanıtabilmek için büyük bir özveriyle çalışır.",
      "Çeşitli tasarım ve video düzenleme programlarıyla etkinlik tanıtım afişlerini, logoları, videoları, sosyal medya içeriklerini ve genel tanıtım materyallerini dizayn eder. Ortaya çıkan ürünlerle etkinlikleri daha fazla katılımcıya ulaştırmayı hedefler."
    ],
    icon: "pen",
    team: [
      { name: "İnanç Deniz Gözgözoğlu", role: "Dizayn Komitesinden Sorumlu YK Üyesi", photo: `${IMG}/inanc-deniz-gozgozoglu-UASM5F.jpeg` },
      { name: "Başbuğ Ergenekon Önder", role: "Dizayn Komitesi Koordinatörü", photo: `${IMG}/basbug-ergenekon-onder-XJXFXT.jpeg` },
      { name: "Sudegül Şen", role: "Dizayn Komitesi Koordinatörü", photo: `${IMG}/sudegul-sen-IH65RI.jpeg` },
      { name: "Roni Baran Dağ", role: "Dizayn Komitesi Koordinatörü", photo: `${IMG}/roni-baran-dag-OVA3D6.jpeg` }
    ]
  },
  {
    slug: "iletisim-ve-pazarlama",
    name: "İletişim ve Pazarlama Komitesi",
    summary:
      "Topluluğun sosyal medya ve dijital iletişim çalışmalarını yürütür; tüm hesapları yönetir ve günceller.",
    body: [
      "İletişim ve Pazarlama Komitesi, Verimlilik Topluluğu'nun sosyal medya ve dijital iletişim çalışmalarını yürüten birimidir. Topluluğun Instagram, YouTube, LinkedIn, TikTok, Twitter ve Facebook gibi tüm sosyal medya hesapları bu komite tarafından yönetilir ve düzenli olarak güncellenir.",
      "Komite, etkinlikleri ve projeleri dijital mecralarda etkili bir şekilde duyurmayı ve topluluğu sosyal medyada görünür kılmayı amaçlar; özgün ve dikkat çekici içerikler üretir. Sene içerisinde, içerik üretimine ilgi duyan katılımcılarla bir sosyal medya takımı oluşturur, temel sosyal medya eğitimleri verir ve katılımcıları aktif üretim süreçlerine dahil eder."
    ],
    icon: "megaphone",
    team: [
      { name: "Azra Zöngür", role: "İletişim ve Pazarlamadan Sorumlu YK Üyesi", photo: `${IMG}/azra-zongur-M6QH0K.jpeg` },
      { name: "Alper Bozkaya", role: "İletişim ve Pazarlama Komitesi Koordinatörü", photo: `${IMG}/alper-bozkaya-2Q308X.jpeg` },
      { name: "Yağmur Çakırca", role: "İletişim ve Pazarlama Komitesi Koordinatörü", photo: `${IMG}/yagmur-cakirca-YWUKK1.jpeg` },
      { name: "Mert Kaş", role: "İletişim ve Pazarlama Komitesi Koordinatörü", photo: `${IMG}/mert-kas-003EG8.jpeg` }
    ]
  },
  {
    slug: "inovasyon",
    name: "İnovasyon Komitesi",
    summary:
      "30 yılı aşkın tecrübenin kümülatif bilgi kaynaklarını toplayıp analiz eder; web sitelerini ve 30.000 kişilik e-posta ağını yönetir.",
    body: [
      "İnovasyon Komitesi, 30 yılı aşkın tecrübemizin getirdiği kümülatif bilgi kaynaklarını toplayıp değerlendiren ve analiz eden komitedir. Etkinliklerden sonra online formlardan gelen verileri inceler, aldığı geri dönüşleri analiz eder ve bunları info-grafiğe döker.",
      "Topluluğumuzun sahip olduğu 30.000 kişilik e-posta ağıyla da ilgilenen bu komite, mailing listeleri ile ODTÜ'nün her bölümüne ulaşabilme imkânına sahiptir. Buna ek olarak ODTÜ Verimlilik Topluluğu'na ait tüm web sitelerinin düzenlenmesi ve güncel tutulmasından sorumludur."
    ],
    icon: "spark",
    team: [
      { name: "Yiğit Efe Özdemir", role: "İnovasyon Komitesinden Sorumlu YK Üyesi", photo: `${IMG}/yigit-efe-ozdemir-JTGEXS.jpeg` },
      { name: "Atahan Akharman", role: "İnovasyon Komitesi Koordinatörü", photo: `${IMG}/atahan-akharman-J9RQ58.jpeg` }
    ]
  },
  {
    slug: "organizasyon",
    name: "Organizasyon Komitesi",
    summary:
      "Topluluğun okul içi tanınırlığını artırır, projelerle koordineli çalışır; imza etkinliği LEGO'dur.",
    body: [
      "Organizasyon Komitesi, topluluğun hem okul içindeki tanınırlığını artıran hem de projelerle koordineli çalışan destekleyici bir yapıdır. Projelerin tanıtım süreçlerine katkı sağlar, topluluk içi iletişimi güçlendirir ve okul içindeki görünürlüğü artırır.",
      "Her yılın başında düzenlenen LEGO, Organizasyon Komitesi'nin imza etkinliğidir. LEGO, katılımcılara bir etkinlik çıkarma sürecinin hem zorluklarını hem de yaratıcı keyfini deneyimletirken, yeni gelen öğrencileri topluluğun sıcak ortamıyla tanıştırmayı hedefler.",
      "Organizasyon Komitesi aynı zamanda düzenlediği sosyal etkinliklerle topluluk üyeleri arasında bağ kurar; projelerin görünmeyen ama vazgeçilmez destekçisi olarak VT'nin iç dinamiğini canlı tutar."
    ],
    icon: "users",
    team: [
      { name: "Demir Uluocak", role: "Organizasyon Komitesinden Sorumlu YK Üyesi", photo: `${IMG}/demir-uluocak-VZ2KRC.jpeg` },
      { name: "Metin Efe Şahin", role: "Organizasyon Komitesi Koordinatörü", photo: `${IMG}/metin-efe-sahin-GUZ2IX.jpeg` },
      { name: "Can Özbayramoğlu", role: "Organizasyon Komitesi Koordinatörü", photo: `${IMG}/can-ozbayramoglu-RRZUHQ.jpeg` }
    ]
  }
];

// Partner şirketler — ana sayfadaki logo şeridi
const partners = [
  { name: "Ak Gıda / İçim", logo: `${IMG}/ak-gida-icim-MMKLNX.png` },
  { name: "Akkim", logo: `${IMG}/akkim-A45JGP.png` },
  { name: "Arçelik", logo: `${IMG}/arcelik-GGRD9R.png` },
  { name: "Aygaz", logo: `${IMG}/aygaz-HIFSKC.png` },
  { name: "Bosch", logo: `${IMG}/bosch-ST69OQ.png` },
  { name: "Çimsa", logo: `${IMG}/cimsa-P8DWO8.png` },
  { name: "Danone", logo: `${IMG}/danone-BYIQ9R.png` },
  { name: "Eczacıbaşı", logo: `${IMG}/eczacibasi-W0DPNU.png` },
  { name: "Enerjisa Üretim", logo: `${IMG}/enerjisa-uretim-AEA4NT.png` },
  { name: "Ford Otosan", logo: `${IMG}/ford-otosan-SDALPB.png` },
  { name: "Henkel", logo: `${IMG}/henkel-2U2T0I.png` },
  { name: "Kale Grubu", logo: `${IMG}/kale-grubu-ELGI9G.png` },
  { name: "L'Oréal", logo: `${IMG}/loreal-L2BCC8.png` },
  { name: "P&G", logo: `${IMG}/pampg-8J06NZ.png` },
  { name: "Renault MAİS", logo: `${IMG}/renault-mais-CABJVD.png` },
  { name: "Şişecam", logo: `${IMG}/sisecam-QWW0IP.png` },
  { name: "SOCAR", logo: `${IMG}/sokar-GNVRFE.png` },
  { name: "Tüpraş", logo: `${IMG}/tupras-LOY6PU.png` },
  { name: "Unilever", logo: `${IMG}/unilever-XHIAS8.png` },
  { name: "Viatris", logo: `${IMG}/viatris-USQ8EC.png` },
  { name: "Vodafone", logo: `${IMG}/vodafone-R53Y0J.png` }
];

module.exports = { site, projects, board, advisors, committees, partners };
