// ODTÜ VT içerik verisi — odtuvt.org.tr'deki gerçek metinlerden derlenmiştir.
// Tek kaynaktan yönetilir; sayfa şablonları buradan beslenir.

const site = {
  name: "ODTÜ Verimlilik Topluluğu",
  short: "ODTÜ VT",
  founded: 1992,
  claim: "1992'den beri kampüsün üretim merkezi.",
  description:
    "ODTÜ Verimlilik Topluluğu, 1992 yılından bu yana farklı disiplinlerden öğrencileri bir araya getirerek iş dünyası ve akademik çevrelerle güçlü bir köprü kurar. Her yıl 8 proje, 80'den fazla etkinlik — hepsi katılımcılara ücretsiz.",
  address:
    "ODTÜ Endüstri Mühendisliği Binası, Üniversiteler Mah. Dumlupınar Bulvarı No:1, 06800 Çankaya / Ankara",
  phone: "0 (312) 210 60 12",
  social: {
    instagram: "https://www.instagram.com/odtu_vt/",
    youtube: "https://www.youtube.com/channel/UCupcHP7-k8icW1GYenwWwFg",
    original: "https://www.odtuvt.org.tr/"
  },
  stats: [
    { value: "1992", label: "kuruluş yılı" },
    { value: "8", label: "proje" },
    { value: "80+", label: "etkinlik / yıl" },
    { value: "5.000", label: "katılımcı, Türkiye ve Avrupa" },
    { value: "%100", label: "etkinlikler ücretsiz" }
  ]
};

const projects = [
  {
    slug: "ymg",
    name: "Yönetim ve Mühendislik Günleri",
    short: "YMG",
    tagline: "Türkiye'nin en köklü öğrenci zirvelerinden biri.",
    summary:
      "Her yıl düzenlenen YMG, öğrencileri alanında başarılı şirketler ve yetkin konuşmacılarla buluşturan üç günlük seminer, panel ve söyleşi maratonudur.",
    body: [
      "Yönetim ve Mühendislik Günleri, ODTÜ Verimlilik Topluluğu'nun her yıl düzenlediği amiral gemisi etkinliğidir. Üç gün boyunca seminerler, paneller ve söyleşilerle genç mühendis ve yönetici adaylarına deneyimli konuşmacılar üzerinden benzersiz bir kişisel gelişim fırsatı sunar.",
      "YMG'25, 28 Şubat – 1 Mart 2025 tarihlerinde ODTÜ Kültür ve Kongre Merkezi Kemal Kurdaş Salonu'nda, 2 Mart 2025'te ise çevrimiçi olarak gerçekleşti. Tüm oturumlar, topluluğun bütün etkinlikleri gibi katılımcılara ücretsizdir.",
      "YMG+ oturumlarıyla yazılım gibi odak alanlarda derinleşen program, her yıl binlerce öğrenciyi kampüste ağırlar."
    ],
    facts: [
      { label: "Format", value: "3 gün seminer, panel, söyleşi" },
      { label: "Mekân", value: "ODTÜ KKM, Kemal Kurdaş Salonu" },
      { label: "Katılım", value: "Ücretsiz, tüm öğrencilere açık" }
    ],
    icon: "mic",
    external: "https://ymg.odtuvt.org.tr/",
    theme: "dark",
    featured: true
  },
  {
    slug: "vakavt",
    name: "VakaVT",
    short: "VakaVT",
    tagline: "Türkiye'nin en prestijli vaka analizi yarışması.",
    summary:
      "2015'ten beri Türkiye'nin dört bir yanından en iyi öğrenciler, 3 kişilik takımlar hâlinde gerçek şirket vakalarını kısıtlı sürede çözmek için yarışıyor.",
    body: [
      "VakaVT'de Türkiye'deki her üniversiteden en iyi öğrenciler, bölüm ve sınıf kısıtlaması olmadan 3 kişilik takımlar hâlinde yarışır. Tamamı İngilizce yürütülen yarışma, katılımcılara farklı sektörlerden gerçek vakalar üzerinde çalışma ve şirketlerle doğrudan iletişim kurma fırsatı verir.",
      "Katılımcılar yalnızca vaka içeriğiyle değil; kısıtlı sürede karar verme, çözüm üretme, takım çalışması ve sunum teknikleriyle de sınanır. 2015'ten bu yana VakaVT, Türkiye'nin en prestijli vaka analizi yarışması olarak anılıyor."
    ],
    facts: [
      { label: "Takım", value: "3 kişi, bölüm/sınıf kısıtsız" },
      { label: "Dil", value: "İngilizce" },
      { label: "Başlangıç", value: "2015" }
    ],
    icon: "target",
    external: "https://www.odtuvt.org.tr/proje-vakavt",
    theme: "light",
    featured: true
  },
  {
    slug: "generation",
    name: "Generation",
    short: "Generation",
    tagline: "ODTÜ kampüsünün ilk veri bilimi projesi.",
    summary:
      "2020'de kurulan Generation; yapay zekâ, blockchain ve Web 3.0 üzerine etkinlikler düzenleyen kampüsün ilk veri bilimi projesidir.",
    body: [
      "Generation, ODTÜ Verimlilik Topluluğu'nun 2020 yılında hayata geçirdiği, ODTÜ kampüsündeki ilk veri bilimi projesidir.",
      "Yapay zekâ, blockchain, metaverse, NFT, DeFi ve Web 3.0 teknolojileri üzerine etkinlikler düzenleyerek öğrencileri verinin şekillendirdiği geleceğe hazırlar."
    ],
    facts: [
      { label: "Kuruluş", value: "2020" },
      { label: "Odak", value: "Veri bilimi, yapay zekâ, Web 3.0" },
      { label: "İlk", value: "Kampüsün ilk veri bilimi projesi" }
    ],
    icon: "chip",
    external: "https://generation.odtuvt.org.tr/",
    theme: "light",
    featured: true
  },
  {
    slug: "wequal",
    name: "W'EQUAL",
    short: "W'EQUAL",
    tagline: "Eşit haklar için farkındalık.",
    summary:
      "Her bireyin sosyal yaşamda ve iş hayatında eşit haklara sahip olması gerektiği inancıyla yürütülen farkındalık projesi.",
    body: [
      "W'EQUAL, ODTÜ Verimlilik Topluluğu'nun sekiz projesinden biri olarak, her bireyin sosyal yaşamda ve iş hayatında eşit haklara sahip olması gerektiği inancıyla yürütülen bir farkındalık projesidir.",
      "Toplumsal cinsiyet eşitliği ve insan hakları konularında bilinçli bireyler yetiştirmeyi amaçlayan W'EQUAL, bu doğrultuda söyleşiler, paneller, seminerler ve atölyeler düzenler."
    ],
    facts: [
      { label: "Odak", value: "Toplumsal cinsiyet eşitliği, insan hakları" },
      { label: "Format", value: "Söyleşi, panel, seminer, atölye" }
    ],
    icon: "scale",
    external: "https://www.odtuvt.org.tr/proje-wequal",
    theme: "light",
    featured: false
  },
  {
    slug: "cozum-sende",
    name: "Çözüm Sende!",
    short: "Çözüm Sende!",
    tagline: "Sorunu gören, çözümü üreten topluluk.",
    summary:
      "Toplumdaki ve doğadaki sorunlara çözüm üretmeyi ve bunu yapacak bireylere farkındalık kazandırmayı amaçlayan sosyal sorumluluk projesi.",
    body: [
      "Çözüm Sende!, ODTÜ Verimlilik Topluluğu'nun sosyal sorumluluk ve farkındalık sahibi bir topluluk olduğunun göstergesi olarak öncü bir şekilde ortaya çıkmış projesidir.",
      "Temel amaç; toplumdaki ve yaşadığımız doğayla ilgili sorunlara çözüm sağlamak ve bunu yapacak bireylere farkındalık kazandırmaktır."
    ],
    facts: [
      { label: "Alan", value: "Sosyal sorumluluk" },
      { label: "Amaç", value: "Toplum ve doğa sorunlarına çözüm" }
    ],
    icon: "leaf",
    external: "https://odtuvt.org.tr/cozum-sende/",
    theme: "light",
    featured: false
  },
  {
    slug: "estiem",
    name: "ESTIEM",
    short: "ESTIEM",
    tagline: "Avrupa'nın endüstri mühendisliği ağı, Ankara'da.",
    summary:
      "Avrupa genelinde 77 üniversitede örgütlü ESTIEM'in Ankara Yerel Grubu'nu ODTÜ Verimlilik Topluluğu temsil ediyor.",
    body: [
      "ESTIEM (European Students of Industrial Engineering and Management), Avrupa çapında Endüstri Mühendisliği ve İşletme öğrencilerini bir araya getiren uluslararası bir ağdır.",
      "Avrupa genelinde 77 farklı üniversitede bulunan ESTIEM'in Ankara Yerel Grubu'nu ODTÜ Verimlilik Topluluğu olarak temsil ediyor; üyelerimize Avrupa'nın dört bir yanında etkinlik, değişim ve yarışma fırsatları sunuyoruz."
    ],
    facts: [
      { label: "Ağ", value: "Avrupa'da 77 üniversite" },
      { label: "Rol", value: "Ankara Yerel Grubu" }
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
    tagline: "Mezunlardan yol haritaları.",
    summary:
      "Farklı alanlarda kariyer yapmış ODTÜ mezunlarıyla röportajlar yayımlayan dijital içerik projesi.",
    body: [
      "ODTÜlüler için Gelecek Planları (OGP), farklı alanlarda kariyer yapmış ODTÜ mezunlarıyla yapılan röportajları yayımlayarak öğrencilere gerçek kariyer hikâyeleri üzerinden yol gösteren dijital içerik projesidir."
    ],
    facts: [
      { label: "Format", value: "Röportaj serisi" },
      { label: "Platform", value: "ogp.odtuvt.org.tr" }
    ],
    icon: "compass",
    external: "https://ogp.odtuvt.org.tr/",
    theme: "light",
    featured: false
  },
  {
    slug: "kybele",
    name: "Kybele",
    short: "Kybele",
    tagline: "Topluluğun sosyal platformu.",
    summary:
      "Blog yazıları ve içeriklerle topluluğun birikimini kampüse açan sosyal yayın platformu.",
    body: [
      "Kybele, ODTÜ Verimlilik Topluluğu'nun sosyal platformudur. Endüstri mühendisliğinden kişisel gelişime uzanan blog yazıları ve içeriklerle topluluğun birikimini kampüse ve ötesine açar."
    ],
    facts: [
      { label: "Format", value: "Blog / sosyal platform" },
      { label: "Platform", value: "kybele.odtuvt.org.tr" }
    ],
    icon: "book",
    external: "https://kybele.odtuvt.org.tr/",
    theme: "light",
    featured: false
  }
];

const board = [
  {
    role: "Başkan",
    duty: "Topluluğun genel koordinasyonu ve temsilinden sorumludur."
  },
  {
    role: "Başkan Yardımcısı",
    duty: "Proje ve komite koordinasyonunda başkana destek olur."
  },
  {
    role: "Genel Sekreter",
    duty: "Kurul işleyişini, kayıtları ve iç iletişimi yürütür."
  },
  {
    role: "Halkla İlişkilerden Sorumlu YK Üyesi",
    duty: "Topluluğun kampüs içi ve dışı iletişimini yönetir."
  },
  {
    role: "Uluslararası İlişkilerden Sorumlu YK Üyesi",
    duty: "ESTIEM başta olmak üzere uluslararası bağlantıları yürütür."
  },
  {
    role: "Ulusal İlişkilerden Sorumlu YK Üyesi",
    duty: "Türkiye genelindeki üniversite ve kurum ilişkilerini yönetir."
  },
  {
    role: "Mali İşlerden Sorumlu YK Üyesi",
    duty: "Sponsorluk gelirlerini ve bütçeyi yönetir; etkinliklerin ücretsiz kalmasını sağlar."
  }
];

const committees = [
  {
    slug: "bilisim",
    name: "Bilişim Komitesi",
    summary:
      "Topluluğun kümülatif bilgi kaynaklarını ve verilerini toplayıp analiz eden komite.",
    body: [
      "Bilişim Komitesi, ODTÜ Verimlilik Topluluğu'nun kümülatif bilgi kaynaklarını ve verilerini toplayıp değerlendiren, analiz eden komitedir.",
      "Etkinliklerden sonra çevrimiçi formlardan gelen verileri inceler, geri dönüşleri analiz eder ve bunları info-grafiklere dönüştürür. Ayrıca topluluğa ait tüm web sitelerinin düzenlenmesi ve güncel tutulmasından sorumludur."
    ]
  }
];

module.exports = { site, projects, board, committees };
