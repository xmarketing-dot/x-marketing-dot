export interface IDistrictSeed {
  ad: string;
  slug: string;
}

export interface ILocationSeed {
  il: string;
  ilSlug: string;
  ilceler: IDistrictSeed[];
}

export const turkeyProvinces: ILocationSeed[] = [
  {
    "il": "Adana",
    "ilSlug": "adana",
    "ilceler": [
      {
        "ad": "Adana Genel",
        "slug": "genel"
      },
      {
        "ad": "Seyhan",
        "slug": "seyhan"
      },
      {
        "ad": "Yüreğir",
        "slug": "yuregir"
      },
      {
        "ad": "Çukurova",
        "slug": "cukurova"
      },
      {
        "ad": "Sarıçam",
        "slug": "saricam"
      },
      {
        "ad": "Ceyhan",
        "slug": "ceyhan"
      },
      {
        "ad": "Kozan",
        "slug": "kozan"
      }
    ]
  },
  {
    "il": "Adıyaman",
    "ilSlug": "adiyaman",
    "ilceler": [
      {
        "ad": "Adıyaman Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kahta",
        "slug": "kahta"
      },
      {
        "ad": "Gölbaşı",
        "slug": "golbasi"
      },
      {
        "ad": "Besni",
        "slug": "besni"
      }
    ]
  },
  {
    "il": "Afyonkarahisar",
    "ilSlug": "afyonkarahisar",
    "ilceler": [
      {
        "ad": "Afyonkarahisar Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Sandıklı",
        "slug": "sandikli"
      },
      {
        "ad": "Dinar",
        "slug": "dinar"
      },
      {
        "ad": "Bolvadin",
        "slug": "bolvadin"
      }
    ]
  },
  {
    "il": "Ağrı",
    "ilSlug": "agri",
    "ilceler": [
      {
        "ad": "Ağrı Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Doğubayazıt",
        "slug": "dogubayazit"
      },
      {
        "ad": "Patnos",
        "slug": "patnos"
      },
      {
        "ad": "Eleşkirt",
        "slug": "eleskirt"
      }
    ]
  },
  {
    "il": "Amasya",
    "ilSlug": "amasya",
    "ilceler": [
      {
        "ad": "Amasya Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Merzifon",
        "slug": "merzifon"
      },
      {
        "ad": "Suluova",
        "slug": "suluova"
      },
      {
        "ad": "Taşova",
        "slug": "tasova"
      }
    ]
  },
  {
    "il": "Ankara",
    "ilSlug": "ankara",
    "ilceler": [
      {
        "ad": "Ankara Genel",
        "slug": "genel"
      },
      {
        "ad": "Çankaya",
        "slug": "cankaya"
      },
      {
        "ad": "Keçiören",
        "slug": "kecioren"
      },
      {
        "ad": "Yenimahalle",
        "slug": "yenimahalle"
      },
      {
        "ad": "Mamak",
        "slug": "mamak"
      },
      {
        "ad": "Etimesgut",
        "slug": "etimesgut"
      },
      {
        "ad": "Sincan",
        "slug": "sincan"
      },
      {
        "ad": "Gölbaşı",
        "slug": "golbasi"
      },
      {
        "ad": "Pursaklar",
        "slug": "pursaklar"
      },
      {
        "ad": "Polatlı",
        "slug": "polatli"
      },
      {
        "ad": "Çubuk",
        "slug": "cubuk"
      }
    ]
  },
  {
    "il": "Antalya",
    "ilSlug": "antalya",
    "ilceler": [
      {
        "ad": "Antalya Genel",
        "slug": "genel"
      },
      {
        "ad": "Muratpaşa",
        "slug": "muratpasa"
      },
      {
        "ad": "Kepez",
        "slug": "kepez"
      },
      {
        "ad": "Konyaaltı",
        "slug": "konyaalti"
      },
      {
        "ad": "Alanya",
        "slug": "alanya"
      },
      {
        "ad": "Manavgat",
        "slug": "manavgat"
      },
      {
        "ad": "Serik",
        "slug": "serik"
      },
      {
        "ad": "Kaş",
        "slug": "kas"
      },
      {
        "ad": "Kemer",
        "slug": "kemer"
      },
      {
        "ad": "Kumluca",
        "slug": "kumluca"
      },
      {
        "ad": "Gazipaşa",
        "slug": "gazipasa"
      }
    ]
  },
  {
    "il": "Artvin",
    "ilSlug": "artvin",
    "ilceler": [
      {
        "ad": "Artvin Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Hopa",
        "slug": "hopa"
      },
      {
        "ad": "Borçka",
        "slug": "borcka"
      },
      {
        "ad": "Arhavi",
        "slug": "arhavi"
      }
    ]
  },
  {
    "il": "Aydın",
    "ilSlug": "aydin",
    "ilceler": [
      {
        "ad": "Aydın Genel",
        "slug": "genel"
      },
      {
        "ad": "Efeler",
        "slug": "efeler"
      },
      {
        "ad": "Nazilli",
        "slug": "nazilli"
      },
      {
        "ad": "Söke",
        "slug": "soke"
      },
      {
        "ad": "Kuşadası",
        "slug": "kusadasi"
      },
      {
        "ad": "Didim",
        "slug": "didim"
      },
      {
        "ad": "Çine",
        "slug": "cine"
      }
    ]
  },
  {
    "il": "Balıkesir",
    "ilSlug": "balikesir",
    "ilceler": [
      {
        "ad": "Balıkesir Genel",
        "slug": "genel"
      },
      {
        "ad": "Altıeylül",
        "slug": "altieylul"
      },
      {
        "ad": "Karesi",
        "slug": "karesi"
      },
      {
        "ad": "Edremit",
        "slug": "edremit"
      },
      {
        "ad": "Bandırma",
        "slug": "bandirma"
      },
      {
        "ad": "Ayvalık",
        "slug": "ayvalik"
      },
      {
        "ad": "Burhaniye",
        "slug": "burhaniye"
      },
      {
        "ad": "Gönen",
        "slug": "gonen"
      }
    ]
  },
  {
    "il": "Bilecik",
    "ilSlug": "bilecik",
    "ilceler": [
      {
        "ad": "Bilecik Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Bozüyük",
        "slug": "bozuyuk"
      },
      {
        "ad": "Söğüt",
        "slug": "sogut"
      }
    ]
  },
  {
    "il": "Bingöl",
    "ilSlug": "bingol",
    "ilceler": [
      {
        "ad": "Bingöl Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Genç",
        "slug": "genc"
      },
      {
        "ad": "Solhan",
        "slug": "solhan"
      }
    ]
  },
  {
    "il": "Bitlis",
    "ilSlug": "bitlis",
    "ilceler": [
      {
        "ad": "Bitlis Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Tatvan",
        "slug": "tatvan"
      },
      {
        "ad": "Ahlat",
        "slug": "ahlat"
      },
      {
        "ad": "Güroymak",
        "slug": "guroymak"
      }
    ]
  },
  {
    "il": "Bolu",
    "ilSlug": "bolu",
    "ilceler": [
      {
        "ad": "Bolu Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Gerede",
        "slug": "gerede"
      },
      {
        "ad": "Mudurnu",
        "slug": "mudurnu"
      },
      {
        "ad": "Mengen",
        "slug": "mengen"
      }
    ]
  },
  {
    "il": "Burdur",
    "ilSlug": "burdur",
    "ilceler": [
      {
        "ad": "Burdur Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Bucak",
        "slug": "bucak"
      },
      {
        "ad": "Gölhisar",
        "slug": "golhisar"
      }
    ]
  },
  {
    "il": "Bursa",
    "ilSlug": "bursa",
    "ilceler": [
      {
        "ad": "Bursa Genel",
        "slug": "genel"
      },
      {
        "ad": "Osmangazi",
        "slug": "osmangazi"
      },
      {
        "ad": "Yıldırım",
        "slug": "yildirim"
      },
      {
        "ad": "Nilüfer",
        "slug": "nilufer"
      },
      {
        "ad": "İnegöl",
        "slug": "inegol"
      },
      {
        "ad": "Gemlik",
        "slug": "gemlik"
      },
      {
        "ad": "Mudanya",
        "slug": "mudanya"
      },
      {
        "ad": "Mustafakemalpaşa",
        "slug": "mustafakemalpasa"
      },
      {
        "ad": "Orhangazi",
        "slug": "orhangazi"
      }
    ]
  },
  {
    "il": "Çanakkale",
    "ilSlug": "canakkale",
    "ilceler": [
      {
        "ad": "Çanakkale Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Biga",
        "slug": "biga"
      },
      {
        "ad": "Gelibolu",
        "slug": "gelibolu"
      },
      {
        "ad": "Çan",
        "slug": "can"
      },
      {
        "ad": "Ayvacık",
        "slug": "ayvacik"
      },
      {
        "ad": "Ezine",
        "slug": "ezine"
      }
    ]
  },
  {
    "il": "Çankırı",
    "ilSlug": "cankiri",
    "ilceler": [
      {
        "ad": "Çankırı Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Çerkeş",
        "slug": "cerkes"
      },
      {
        "ad": "Ilgaz",
        "slug": "ilgaz"
      }
    ]
  },
  {
    "il": "Çorum",
    "ilSlug": "corum",
    "ilceler": [
      {
        "ad": "Çorum Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Sungurlu",
        "slug": "sungurlu"
      },
      {
        "ad": "Osmancık",
        "slug": "osmancik"
      },
      {
        "ad": "Alaca",
        "slug": "alaca"
      }
    ]
  },
  {
    "il": "Denizli",
    "ilSlug": "denizli",
    "ilceler": [
      {
        "ad": "Denizli Genel",
        "slug": "genel"
      },
      {
        "ad": "Pamukkale",
        "slug": "pamukkale"
      },
      {
        "ad": "Merkezefendi",
        "slug": "merkezefendi"
      },
      {
        "ad": "Çivril",
        "slug": "civril"
      },
      {
        "ad": "Acıpayam",
        "slug": "acipayam"
      },
      {
        "ad": "Tavas",
        "slug": "tavas"
      }
    ]
  },
  {
    "il": "Diyarbakır",
    "ilSlug": "diyarbakir",
    "ilceler": [
      {
        "ad": "Diyarbakır Genel",
        "slug": "genel"
      },
      {
        "ad": "Bağlar",
        "slug": "baglar"
      },
      {
        "ad": "Kayapınar",
        "slug": "kayapinar"
      },
      {
        "ad": "Yenişehir",
        "slug": "yenisehir"
      },
      {
        "ad": "Sur",
        "slug": "sur"
      },
      {
        "ad": "Ergani",
        "slug": "ergani"
      },
      {
        "ad": "Bismil",
        "slug": "bismil"
      },
      {
        "ad": "Silvan",
        "slug": "silvan"
      }
    ]
  },
  {
    "il": "Edirne",
    "ilSlug": "edirne",
    "ilceler": [
      {
        "ad": "Edirne Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Keşan",
        "slug": "kesan"
      },
      {
        "ad": "Uzunköprü",
        "slug": "uzunkopru"
      },
      {
        "ad": "İpsala",
        "slug": "ipsala"
      }
    ]
  },
  {
    "il": "Elazığ",
    "ilSlug": "elazig",
    "ilceler": [
      {
        "ad": "Elazığ Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kovancılar",
        "slug": "kovancilar"
      },
      {
        "ad": "Karakoçan",
        "slug": "karakocan"
      },
      {
        "ad": "Palu",
        "slug": "palu"
      }
    ]
  },
  {
    "il": "Erzincan",
    "ilSlug": "erzincan",
    "ilceler": [
      {
        "ad": "Erzincan Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Tercan",
        "slug": "tercan"
      },
      {
        "ad": "Üzümlü",
        "slug": "uzumlu"
      }
    ]
  },
  {
    "il": "Erzurum",
    "ilSlug": "erzurum",
    "ilceler": [
      {
        "ad": "Erzurum Genel",
        "slug": "genel"
      },
      {
        "ad": "Yakutiye",
        "slug": "yakutiye"
      },
      {
        "ad": "Palandöken",
        "slug": "palandoken"
      },
      {
        "ad": "Aziziye",
        "slug": "aziziye"
      },
      {
        "ad": "Horasan",
        "slug": "horasan"
      },
      {
        "ad": "Oltu",
        "slug": "oltu"
      },
      {
        "ad": "Pasinler",
        "slug": "pasinler"
      }
    ]
  },
  {
    "il": "Eskişehir",
    "ilSlug": "eskisehir",
    "ilceler": [
      {
        "ad": "Eskişehir Genel",
        "slug": "genel"
      },
      {
        "ad": "Odunpazarı",
        "slug": "odunpazari"
      },
      {
        "ad": "Tepebaşı",
        "slug": "tepebasi"
      },
      {
        "ad": "Sivrihisar",
        "slug": "sivrihisar"
      },
      {
        "ad": "Çifteler",
        "slug": "cifteler"
      }
    ]
  },
  {
    "il": "Gaziantep",
    "ilSlug": "gaziantep",
    "ilceler": [
      {
        "ad": "Gaziantep Genel",
        "slug": "genel"
      },
      {
        "ad": "Şahinbey",
        "slug": "sahinbey"
      },
      {
        "ad": "Şehitkamil",
        "slug": "sehitkamil"
      },
      {
        "ad": "Nizip",
        "slug": "nizip"
      },
      {
        "ad": "İslahiye",
        "slug": "islahiye"
      },
      {
        "ad": "Nurdağı",
        "slug": "nurdagi"
      }
    ]
  },
  {
    "il": "Giresun",
    "ilSlug": "giresun",
    "ilceler": [
      {
        "ad": "Giresun Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Bulancak",
        "slug": "bulancak"
      },
      {
        "ad": "Görele",
        "slug": "gorele"
      },
      {
        "ad": "Tirebolu",
        "slug": "tirebolu"
      },
      {
        "ad": "Espiye",
        "slug": "espiye"
      }
    ]
  },
  {
    "il": "Gümüşhane",
    "ilSlug": "gumushane",
    "ilceler": [
      {
        "ad": "Gümüşhane Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kelkit",
        "slug": "kelkit"
      },
      {
        "ad": "Şiran",
        "slug": "siran"
      }
    ]
  },
  {
    "il": "Hakkari",
    "ilSlug": "hakkari",
    "ilceler": [
      {
        "ad": "Hakkari Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Yüksekova",
        "slug": "yuksekova"
      },
      {
        "ad": "Şemdinli",
        "slug": "semdinli"
      }
    ]
  },
  {
    "il": "Hatay",
    "ilSlug": "hatay",
    "ilceler": [
      {
        "ad": "Hatay Genel",
        "slug": "genel"
      },
      {
        "ad": "Antakya",
        "slug": "antakya"
      },
      {
        "ad": "İskenderun",
        "slug": "iskenderun"
      },
      {
        "ad": "Defne",
        "slug": "defne"
      },
      {
        "ad": "Dörtyol",
        "slug": "dortyol"
      },
      {
        "ad": "Samandağ",
        "slug": "samandag"
      },
      {
        "ad": "Kırıkhan",
        "slug": "kirikhan"
      },
      {
        "ad": "Reyhanlı",
        "slug": "reyhanli"
      },
      {
        "ad": "Arsuz",
        "slug": "arsuz"
      }
    ]
  },
  {
    "il": "Isparta",
    "ilSlug": "isparta",
    "ilceler": [
      {
        "ad": "Isparta Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Yalvaç",
        "slug": "yalvac"
      },
      {
        "ad": "Eğirdir",
        "slug": "egirdir"
      },
      {
        "ad": "Şarkikaraağaç",
        "slug": "sarkikaraagac"
      }
    ]
  },
  {
    "il": "Mersin",
    "ilSlug": "mersin",
    "ilceler": [
      {
        "ad": "Mersin Genel",
        "slug": "genel"
      },
      {
        "ad": "Tarsus",
        "slug": "tarsus"
      },
      {
        "ad": "Toroslar",
        "slug": "toroslar"
      },
      {
        "ad": "Akdeniz",
        "slug": "akdeniz"
      },
      {
        "ad": "Yenişehir",
        "slug": "yenisehir"
      },
      {
        "ad": "Mezitli",
        "slug": "mezitli"
      },
      {
        "ad": "Erdemli",
        "slug": "erdemli"
      },
      {
        "ad": "Silifke",
        "slug": "silifke"
      },
      {
        "ad": "Anamur",
        "slug": "anamur"
      }
    ]
  },
  {
    "il": "İstanbul",
    "ilSlug": "istanbul",
    "ilceler": [
      {
        "ad": "İstanbul Genel",
        "slug": "genel"
      },
      {
        "ad": "Adalar",
        "slug": "adalar"
      },
      {
        "ad": "Arnavutköy",
        "slug": "arnavutkoy"
      },
      {
        "ad": "Ataşehir",
        "slug": "atasehir"
      },
      {
        "ad": "Avcılar",
        "slug": "avcilar"
      },
      {
        "ad": "Bağcılar",
        "slug": "bagcilar"
      },
      {
        "ad": "Bahçelievler",
        "slug": "bahcelievler"
      },
      {
        "ad": "Bakırköy",
        "slug": "bakirkoy"
      },
      {
        "ad": "Başakşehir",
        "slug": "basaksehir"
      },
      {
        "ad": "Bayrampaşa",
        "slug": "bayrampasa"
      },
      {
        "ad": "Beşiktaş",
        "slug": "besiktas"
      },
      {
        "ad": "Beykoz",
        "slug": "beykoz"
      },
      {
        "ad": "Beylikdüzü",
        "slug": "beylikduzu"
      },
      {
        "ad": "Beyoğlu",
        "slug": "beyoglu"
      },
      {
        "ad": "Büyükçekmece",
        "slug": "buyukcekmece"
      },
      {
        "ad": "Çatalca",
        "slug": "catalca"
      },
      {
        "ad": "Çekmeköy",
        "slug": "cekmekoy"
      },
      {
        "ad": "Esenler",
        "slug": "esenler"
      },
      {
        "ad": "Esenyurt",
        "slug": "esenyurt"
      },
      {
        "ad": "Eyüpsultan",
        "slug": "eyupsultan"
      },
      {
        "ad": "Fatih",
        "slug": "fatih"
      },
      {
        "ad": "Gaziosmanpaşa",
        "slug": "gaziosmanpasa"
      },
      {
        "ad": "Güngören",
        "slug": "gungoren"
      },
      {
        "ad": "Kadıköy",
        "slug": "kadikoy"
      },
      {
        "ad": "Kağıthane",
        "slug": "kagithane"
      },
      {
        "ad": "Kartal",
        "slug": "kartal"
      },
      {
        "ad": "Küçükçekmece",
        "slug": "kucukcekmece"
      },
      {
        "ad": "Maltepe",
        "slug": "maltepe"
      },
      {
        "ad": "Pendik",
        "slug": "pendik"
      },
      {
        "ad": "Sancaktepe",
        "slug": "sancaktepe"
      },
      {
        "ad": "Sarıyer",
        "slug": "sariyer"
      },
      {
        "ad": "Silivri",
        "slug": "silivri"
      },
      {
        "ad": "Sultanbeyli",
        "slug": "sultanbeyli"
      },
      {
        "ad": "Sultangazi",
        "slug": "sultangazi"
      },
      {
        "ad": "Şile",
        "slug": "sile"
      },
      {
        "ad": "Şişli",
        "slug": "sisli"
      },
      {
        "ad": "Tuzla",
        "slug": "tuzla"
      },
      {
        "ad": "Ümraniye",
        "slug": "umraniye"
      },
      {
        "ad": "Üsküdar",
        "slug": "uskudar"
      },
      {
        "ad": "Zeytinburnu",
        "slug": "zeytinburnu"
      }
    ]
  },
  {
    "il": "İzmir",
    "ilSlug": "izmir",
    "ilceler": [
      {
        "ad": "İzmir Genel",
        "slug": "genel"
      },
      {
        "ad": "Aliağa",
        "slug": "aliaga"
      },
      {
        "ad": "Balçova",
        "slug": "balcova"
      },
      {
        "ad": "Bayraklı",
        "slug": "bayrakli"
      },
      {
        "ad": "Bornova",
        "slug": "bornova"
      },
      {
        "ad": "Buca",
        "slug": "buca"
      },
      {
        "ad": "Çeşme",
        "slug": "cesme"
      },
      {
        "ad": "Çiğli",
        "slug": "cigli"
      },
      {
        "ad": "Dikili",
        "slug": "dikili"
      },
      {
        "ad": "Foça",
        "slug": "foca"
      },
      {
        "ad": "Gaziemir",
        "slug": "gaziemir"
      },
      {
        "ad": "Karabağlar",
        "slug": "karabaglar"
      },
      {
        "ad": "Karşıyaka",
        "slug": "karsiyaka"
      },
      {
        "ad": "Konak",
        "slug": "konak"
      },
      {
        "ad": "Menemen",
        "slug": "menemen"
      },
      {
        "ad": "Torbalı",
        "slug": "torbali"
      },
      {
        "ad": "Urla",
        "slug": "urla"
      }
    ]
  },
  {
    "il": "Kars",
    "ilSlug": "kars",
    "ilceler": [
      {
        "ad": "Kars Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Sarıkamış",
        "slug": "sarikamis"
      },
      {
        "ad": "Kağızman",
        "slug": "kagizman"
      }
    ]
  },
  {
    "il": "Kastamonu",
    "ilSlug": "kastamonu",
    "ilceler": [
      {
        "ad": "Kastamonu Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Tosya",
        "slug": "tosya"
      },
      {
        "ad": "Taşköprü",
        "slug": "taskopru"
      },
      {
        "ad": "Cide",
        "slug": "cide"
      },
      {
        "ad": "İnebolu",
        "slug": "inebolu"
      }
    ]
  },
  {
    "il": "Kayseri",
    "ilSlug": "kayseri",
    "ilceler": [
      {
        "ad": "Kayseri Genel",
        "slug": "genel"
      },
      {
        "ad": "Melikgazi",
        "slug": "melikgazi"
      },
      {
        "ad": "Kocasinan",
        "slug": "kocasinan"
      },
      {
        "ad": "Talas",
        "slug": "talas"
      },
      {
        "ad": "Develi",
        "slug": "develi"
      },
      {
        "ad": "Yahyalı",
        "slug": "yahyali"
      }
    ]
  },
  {
    "il": "Kırklareli",
    "ilSlug": "kirklareli",
    "ilceler": [
      {
        "ad": "Kırklareli Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Lüleburgaz",
        "slug": "luleburgaz"
      },
      {
        "ad": "Babaeski",
        "slug": "babaeski"
      },
      {
        "ad": "Vize",
        "slug": "vize"
      }
    ]
  },
  {
    "il": "Kırşehir",
    "ilSlug": "kirsehir",
    "ilceler": [
      {
        "ad": "Kırşehir Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kaman",
        "slug": "kaman"
      },
      {
        "ad": "Mucur",
        "slug": "mucur"
      }
    ]
  },
  {
    "il": "Kocaeli",
    "ilSlug": "kocaeli",
    "ilceler": [
      {
        "ad": "Kocaeli Genel",
        "slug": "genel"
      },
      {
        "ad": "İzmit",
        "slug": "izmit"
      },
      {
        "ad": "Gebze",
        "slug": "gebze"
      },
      {
        "ad": "Darıca",
        "slug": "darica"
      },
      {
        "ad": "Körfez",
        "slug": "korfez"
      },
      {
        "ad": "Gölcük",
        "slug": "golcuk"
      },
      {
        "ad": "Derince",
        "slug": "derince"
      },
      {
        "ad": "Çayırova",
        "slug": "cayirova"
      },
      {
        "ad": "Kartepe",
        "slug": "kartepe"
      },
      {
        "ad": "Başiskele",
        "slug": "basiskele"
      },
      {
        "ad": "Kandıra",
        "slug": "kandira"
      }
    ]
  },
  {
    "il": "Konya",
    "ilSlug": "konya",
    "ilceler": [
      {
        "ad": "Konya Genel",
        "slug": "genel"
      },
      {
        "ad": "Selçuklu",
        "slug": "selcuklu"
      },
      {
        "ad": "Meram",
        "slug": "meram"
      },
      {
        "ad": "Karatay",
        "slug": "karatay"
      },
      {
        "ad": "Ereğli",
        "slug": "eregli"
      },
      {
        "ad": "Akşehir",
        "slug": "aksehir"
      },
      {
        "ad": "Beyşehir",
        "slug": "beysehir"
      },
      {
        "ad": "Seydişehir",
        "slug": "seydisehir"
      }
    ]
  },
  {
    "il": "Kütahya",
    "ilSlug": "kutahya",
    "ilceler": [
      {
        "ad": "Kütahya Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Tavşanlı",
        "slug": "tavsanli"
      },
      {
        "ad": "Simav",
        "slug": "simav"
      },
      {
        "ad": "Gediz",
        "slug": "gediz"
      }
    ]
  },
  {
    "il": "Malatya",
    "ilSlug": "malatya",
    "ilceler": [
      {
        "ad": "Malatya Genel",
        "slug": "genel"
      },
      {
        "ad": "Battalgazi",
        "slug": "battalgazi"
      },
      {
        "ad": "Yeşilyurt",
        "slug": "yesilyurt"
      },
      {
        "ad": "Doğanşehir",
        "slug": "dogansehir"
      },
      {
        "ad": "Darende",
        "slug": "darende"
      }
    ]
  },
  {
    "il": "Manisa",
    "ilSlug": "manisa",
    "ilceler": [
      {
        "ad": "Manisa Genel",
        "slug": "genel"
      },
      {
        "ad": "Yunusemre",
        "slug": "yunusemre"
      },
      {
        "ad": "Şehzadeler",
        "slug": "sehzadeler"
      },
      {
        "ad": "Akhisar",
        "slug": "akhisar"
      },
      {
        "ad": "Turgutlu",
        "slug": "turgutlu"
      },
      {
        "ad": "Salihli",
        "slug": "salihli"
      },
      {
        "ad": "Soma",
        "slug": "soma"
      },
      {
        "ad": "Alaşehir",
        "slug": "alasehir"
      }
    ]
  },
  {
    "il": "Kahramanmaraş",
    "ilSlug": "kahramanmaras",
    "ilceler": [
      {
        "ad": "Kahramanmaraş Genel",
        "slug": "genel"
      },
      {
        "ad": "Onikişubat",
        "slug": "onikisubat"
      },
      {
        "ad": "Dulkadiroğlu",
        "slug": "dulkadiroglu"
      },
      {
        "ad": "Elbistan",
        "slug": "elbistan"
      },
      {
        "ad": "Afşin",
        "slug": "afsin"
      },
      {
        "ad": "Pazarcık",
        "slug": "pazarcik"
      }
    ]
  },
  {
    "il": "Mardin",
    "ilSlug": "mardin",
    "ilceler": [
      {
        "ad": "Mardin Genel",
        "slug": "genel"
      },
      {
        "ad": "Artuklu",
        "slug": "artuklu"
      },
      {
        "ad": "Kızıltepe",
        "slug": "kiziltepe"
      },
      {
        "ad": "Nusaybin",
        "slug": "nusaybin"
      },
      {
        "ad": "Midyat",
        "slug": "midyat"
      },
      {
        "ad": "Derik",
        "slug": "derik"
      }
    ]
  },
  {
    "il": "Muğla",
    "ilSlug": "mugla",
    "ilceler": [
      {
        "ad": "Muğla Genel",
        "slug": "genel"
      },
      {
        "ad": "Bodrum",
        "slug": "bodrum"
      },
      {
        "ad": "Fethiye",
        "slug": "fethiye"
      },
      {
        "ad": "Marmaris",
        "slug": "marmaris"
      },
      {
        "ad": "Menteşe",
        "slug": "mentese"
      },
      {
        "ad": "Milas",
        "slug": "milas"
      },
      {
        "ad": "Ortaca",
        "slug": "ortaca"
      },
      {
        "ad": "Dalaman",
        "slug": "dalaman"
      },
      {
        "ad": "Datça",
        "slug": "datca"
      },
      {
        "ad": "Seydikemer",
        "slug": "seydikemer"
      }
    ]
  },
  {
    "il": "Muş",
    "ilSlug": "mus",
    "ilceler": [
      {
        "ad": "Muş Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Bulanık",
        "slug": "bulanik"
      },
      {
        "ad": "Malazgirt",
        "slug": "malazgirt"
      },
      {
        "ad": "Varto",
        "slug": "varto"
      }
    ]
  },
  {
    "il": "Nevşehir",
    "ilSlug": "nevsehir",
    "ilceler": [
      {
        "ad": "Nevşehir Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Ürgüp",
        "slug": "urgup"
      },
      {
        "ad": "Avanos",
        "slug": "avanos"
      },
      {
        "ad": "Derinkuyu",
        "slug": "derinkuyu"
      }
    ]
  },
  {
    "il": "Niğde",
    "ilSlug": "nigde",
    "ilceler": [
      {
        "ad": "Niğde Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Bor",
        "slug": "bor"
      },
      {
        "ad": "Çiftlik",
        "slug": "ciftlik"
      }
    ]
  },
  {
    "il": "Ordu",
    "ilSlug": "ordu",
    "ilceler": [
      {
        "ad": "Ordu Genel",
        "slug": "genel"
      },
      {
        "ad": "Altınordu",
        "slug": "altinordu"
      },
      {
        "ad": "Ünye",
        "slug": "unye"
      },
      {
        "ad": "Fatsa",
        "slug": "fatsa"
      },
      {
        "ad": "Gölköy",
        "slug": "golkoy"
      }
    ]
  },
  {
    "il": "Rize",
    "ilSlug": "rize",
    "ilceler": [
      {
        "ad": "Rize Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Çayeli",
        "slug": "cayeli"
      },
      {
        "ad": "Ardeşen",
        "slug": "ardesen"
      },
      {
        "ad": "Pazar",
        "slug": "pazar"
      },
      {
        "ad": "Çamlıhemşin",
        "slug": "camlihemsin"
      }
    ]
  },
  {
    "il": "Sakarya",
    "ilSlug": "sakarya",
    "ilceler": [
      {
        "ad": "Sakarya Genel",
        "slug": "genel"
      },
      {
        "ad": "Adapazarı",
        "slug": "adapazari"
      },
      {
        "ad": "Serdivan",
        "slug": "serdivan"
      },
      {
        "ad": "Erenler",
        "slug": "erenler"
      },
      {
        "ad": "Hendek",
        "slug": "hendek"
      },
      {
        "ad": "Akyazı",
        "slug": "akyazi"
      },
      {
        "ad": "Karasu",
        "slug": "karasu"
      },
      {
        "ad": "Geyve",
        "slug": "geyve"
      },
      {
        "ad": "Sapanca",
        "slug": "sapanca"
      }
    ]
  },
  {
    "il": "Samsun",
    "ilSlug": "samsun",
    "ilceler": [
      {
        "ad": "Samsun Genel",
        "slug": "genel"
      },
      {
        "ad": "İlkadım",
        "slug": "ilkadim"
      },
      {
        "ad": "Atakum",
        "slug": "atakum"
      },
      {
        "ad": "Canik",
        "slug": "canik"
      },
      {
        "ad": "Bafra",
        "slug": "bafra"
      },
      {
        "ad": "Çarşamba",
        "slug": "carsamba"
      },
      {
        "ad": "Vezirköprü",
        "slug": "vezirkopru"
      },
      {
        "ad": "Terme",
        "slug": "terme"
      }
    ]
  },
  {
    "il": "Siirt",
    "ilSlug": "siirt",
    "ilceler": [
      {
        "ad": "Siirt Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kurtalan",
        "slug": "kurtalan"
      },
      {
        "ad": "Pervari",
        "slug": "pervari"
      }
    ]
  },
  {
    "il": "Sinop",
    "ilSlug": "sinop",
    "ilceler": [
      {
        "ad": "Sinop Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Boyabat",
        "slug": "boyabat"
      },
      {
        "ad": "Gerze",
        "slug": "gerze"
      },
      {
        "ad": "Ayancık",
        "slug": "ayancik"
      }
    ]
  },
  {
    "il": "Sivas",
    "ilSlug": "sivas",
    "ilceler": [
      {
        "ad": "Sivas Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Şarkışla",
        "slug": "sarkisla"
      },
      {
        "ad": "Suşehri",
        "slug": "susehri"
      },
      {
        "ad": "Zara",
        "slug": "zara"
      },
      {
        "ad": "Divriği",
        "slug": "divrigi"
      }
    ]
  },
  {
    "il": "Tekirdağ",
    "ilSlug": "tekirdag",
    "ilceler": [
      {
        "ad": "Tekirdağ Genel",
        "slug": "genel"
      },
      {
        "ad": "Süleymanpaşa",
        "slug": "suleymanpasa"
      },
      {
        "ad": "Çorlu",
        "slug": "corlu"
      },
      {
        "ad": "Çerkezköy",
        "slug": "cerkezkoy"
      },
      {
        "ad": "Kapaklı",
        "slug": "kapakli"
      },
      {
        "ad": "Ergene",
        "slug": "ergene"
      },
      {
        "ad": "Şarköy",
        "slug": "sarkoy"
      },
      {
        "ad": "Marmaraereğlisi",
        "slug": "marmaraereglisi"
      },
      {
        "ad": "Malkara",
        "slug": "malkara"
      },
      {
        "ad": "Hayrabolu",
        "slug": "hayrabolu"
      }
    ]
  },
  {
    "il": "Tokat",
    "ilSlug": "tokat",
    "ilceler": [
      {
        "ad": "Tokat Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Erbaa",
        "slug": "erbaa"
      },
      {
        "ad": "Turhal",
        "slug": "turhal"
      },
      {
        "ad": "Zile",
        "slug": "zile"
      },
      {
        "ad": "Niksar",
        "slug": "niksar"
      }
    ]
  },
  {
    "il": "Trabzon",
    "ilSlug": "trabzon",
    "ilceler": [
      {
        "ad": "Trabzon Genel",
        "slug": "genel"
      },
      {
        "ad": "Ortahisar",
        "slug": "ortahisar"
      },
      {
        "ad": "Akçaabat",
        "slug": "akcaabat"
      },
      {
        "ad": "Araklı",
        "slug": "arakli"
      },
      {
        "ad": "Of",
        "slug": "of"
      },
      {
        "ad": "Sürmene",
        "slug": "surmene"
      },
      {
        "ad": "Yomra",
        "slug": "yomra"
      },
      {
        "ad": "Vakfıkebir",
        "slug": "vakfikebir"
      }
    ]
  },
  {
    "il": "Tunceli",
    "ilSlug": "tunceli",
    "ilceler": [
      {
        "ad": "Tunceli Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Pertek",
        "slug": "pertek"
      },
      {
        "ad": "Ovacık",
        "slug": "ovacik"
      },
      {
        "ad": "Hozat",
        "slug": "hozat"
      }
    ]
  },
  {
    "il": "Şanlıurfa",
    "ilSlug": "sanliurfa",
    "ilceler": [
      {
        "ad": "Şanlıurfa Genel",
        "slug": "genel"
      },
      {
        "ad": "Haliliye",
        "slug": "haliliye"
      },
      {
        "ad": "Eyyübiye",
        "slug": "eyyubiye"
      },
      {
        "ad": "Karaköprü",
        "slug": "karakopru"
      },
      {
        "ad": "Siverek",
        "slug": "siverek"
      },
      {
        "ad": "Viranşehir",
        "slug": "viransehir"
      },
      {
        "ad": "Suruç",
        "slug": "suruc"
      },
      {
        "ad": "Birecik",
        "slug": "birecik"
      },
      {
        "ad": "Ceylanpınar",
        "slug": "ceylanpinar"
      }
    ]
  },
  {
    "il": "Uşak",
    "ilSlug": "usak",
    "ilceler": [
      {
        "ad": "Uşak Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Banaz",
        "slug": "banaz"
      },
      {
        "ad": "Eşme",
        "slug": "esme"
      }
    ]
  },
  {
    "il": "Van",
    "ilSlug": "van",
    "ilceler": [
      {
        "ad": "Van Genel",
        "slug": "genel"
      },
      {
        "ad": "İpekyolu",
        "slug": "ipekyolu"
      },
      {
        "ad": "Tuşba",
        "slug": "tusba"
      },
      {
        "ad": "Edremit",
        "slug": "edremit"
      },
      {
        "ad": "Erciş",
        "slug": "ercis"
      },
      {
        "ad": "Özalp",
        "slug": "ozalp"
      },
      {
        "ad": "Muradiye",
        "slug": "muradiye"
      }
    ]
  },
  {
    "il": "Yozgat",
    "ilSlug": "yozgat",
    "ilceler": [
      {
        "ad": "Yozgat Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Sorgun",
        "slug": "sorgun"
      },
      {
        "ad": "Akdağmadeni",
        "slug": "akdagmadeni"
      },
      {
        "ad": "Yerköy",
        "slug": "yerkoy"
      }
    ]
  },
  {
    "il": "Zonguldak",
    "ilSlug": "zonguldak",
    "ilceler": [
      {
        "ad": "Zonguldak Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Ereğli",
        "slug": "eregli"
      },
      {
        "ad": "Çaycuma",
        "slug": "caycuma"
      },
      {
        "ad": "Devrek",
        "slug": "devrek"
      },
      {
        "ad": "Kozlu",
        "slug": "kozlu"
      }
    ]
  },
  {
    "il": "Aksaray",
    "ilSlug": "aksaray",
    "ilceler": [
      {
        "ad": "Aksaray Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Ortaköy",
        "slug": "ortakoy"
      },
      {
        "ad": "Eskil",
        "slug": "eskil"
      }
    ]
  },
  {
    "il": "Bayburt",
    "ilSlug": "bayburt",
    "ilceler": [
      {
        "ad": "Bayburt Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Aydıntepe",
        "slug": "aydintepe"
      }
    ]
  },
  {
    "il": "Karaman",
    "ilSlug": "karaman",
    "ilceler": [
      {
        "ad": "Karaman Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Ermenek",
        "slug": "ermenek"
      }
    ]
  },
  {
    "il": "Kırıkkale",
    "ilSlug": "kirikkale",
    "ilceler": [
      {
        "ad": "Kırıkkale Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Yahşihan",
        "slug": "yahsihan"
      },
      {
        "ad": "Keskin",
        "slug": "keskin"
      }
    ]
  },
  {
    "il": "Batman",
    "ilSlug": "batman",
    "ilceler": [
      {
        "ad": "Batman Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kozluk",
        "slug": "kozluk"
      },
      {
        "ad": "Sason",
        "slug": "sason"
      },
      {
        "ad": "Beşiri",
        "slug": "besiri"
      }
    ]
  },
  {
    "il": "Şırnak",
    "ilSlug": "sirnak",
    "ilceler": [
      {
        "ad": "Şırnak Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Cizre",
        "slug": "cizre"
      },
      {
        "ad": "Silopi",
        "slug": "silopi"
      },
      {
        "ad": "İdil",
        "slug": "idil"
      }
    ]
  },
  {
    "il": "Bartın",
    "ilSlug": "bartin",
    "ilceler": [
      {
        "ad": "Bartın Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Amasra",
        "slug": "amasra"
      },
      {
        "ad": "Ulus",
        "slug": "ulus"
      }
    ]
  },
  {
    "il": "Ardahan",
    "ilSlug": "ardahan",
    "ilceler": [
      {
        "ad": "Ardahan Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Göle",
        "slug": "gole"
      },
      {
        "ad": "Çıldır",
        "slug": "cildir"
      }
    ]
  },
  {
    "il": "Iğdır",
    "ilSlug": "igdir",
    "ilceler": [
      {
        "ad": "Iğdır Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Tuzluca",
        "slug": "tuzluca"
      },
      {
        "ad": "Aralık",
        "slug": "aralik"
      }
    ]
  },
  {
    "il": "Yalova",
    "ilSlug": "yalova",
    "ilceler": [
      {
        "ad": "Yalova Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Çiftlikköy",
        "slug": "ciftlikkoy"
      },
      {
        "ad": "Çınarcık",
        "slug": "cinarcik"
      },
      {
        "ad": "Altınova",
        "slug": "altinova"
      },
      {
        "ad": "Armutlu",
        "slug": "armutlu"
      }
    ]
  },
  {
    "il": "Karabük",
    "ilSlug": "karabuk",
    "ilceler": [
      {
        "ad": "Karabük Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Safranbolu",
        "slug": "safranbolu"
      },
      {
        "ad": "Yenice",
        "slug": "yenice"
      }
    ]
  },
  {
    "il": "Kilis",
    "ilSlug": "kilis",
    "ilceler": [
      {
        "ad": "Kilis Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Elbeyli",
        "slug": "elbeyli"
      }
    ]
  },
  {
    "il": "Osmaniye",
    "ilSlug": "osmaniye",
    "ilceler": [
      {
        "ad": "Osmaniye Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kadirli",
        "slug": "kadirli"
      },
      {
        "ad": "Düziçi",
        "slug": "duzici"
      },
      {
        "ad": "Bahçe",
        "slug": "bahce"
      }
    ]
  },
  {
    "il": "Düzce",
    "ilSlug": "duzce",
    "ilceler": [
      {
        "ad": "Düzce Genel",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Akçakoca",
        "slug": "akcakoca"
      },
      {
        "ad": "Kaynaşlı",
        "slug": "kaynasli"
      },
      {
        "ad": "Gölyaka",
        "slug": "golyaka"
      }
    ]
  },
  {
    "il": "Kıbrıs",
    "ilSlug": "kibris",
    "ilceler": [
      {
        "ad": "Tüm Kıbrıs (Genel)",
        "slug": "genel"
      },
      {
        "ad": "Kıbrıs Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Girne",
        "slug": "girne"
      },
      {
        "ad": "Lefkoşa",
        "slug": "lefkosa"
      },
      {
        "ad": "Gazimağusa",
        "slug": "gazimagusa"
      },
      {
        "ad": "İskele",
        "slug": "iskele"
      },
      {
        "ad": "Güzelyurt",
        "slug": "guzelyurt"
      },
      {
        "ad": "Lefke",
        "slug": "lefke"
      },
      {
        "ad": "Alsancak",
        "slug": "alsancak"
      },
      {
        "ad": "Lapta",
        "slug": "lapta"
      },
      {
        "ad": "Bafra",
        "slug": "bafra"
      },
      {
        "ad": "Gönyeli",
        "slug": "gonyeli"
      },
      {
        "ad": "Maraş",
        "slug": "maras"
      },
      {
        "ad": "Çatalköy",
        "slug": "catalkoy"
      },
      {
        "ad": "Karaoğlanoğlu",
        "slug": "karaoglanoglu"
      },
      {
        "ad": "Esentepe",
        "slug": "esentepe"
      },
      {
        "ad": "Değirmenlik",
        "slug": "degirmenlik"
      },
      {
        "ad": "Gemikonağı",
        "slug": "gemikonagi"
      },
      {
        "ad": "Karşıyaka",
        "slug": "karsiyaka"
      },
      {
        "ad": "Dipkarpaz",
        "slug": "dipkarpaz"
      },
      {
        "ad": "Yeniboğaziçi",
        "slug": "yenibogazici"
      },
      {
        "ad": "Bellapais",
        "slug": "bellapais"
      }
    ]
  },
  {
    "il": "Girne",
    "ilSlug": "girne",
    "ilceler": [
      {
        "ad": "Girne Genel (Tümü)",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Alsancak",
        "slug": "alsancak"
      },
      {
        "ad": "Lapta",
        "slug": "lapta"
      },
      {
        "ad": "Çatalköy",
        "slug": "catalkoy"
      },
      {
        "ad": "Karaoğlanoğlu",
        "slug": "karaoglanoglu"
      },
      {
        "ad": "Bellapais",
        "slug": "bellapais"
      },
      {
        "ad": "Karşıyaka",
        "slug": "karsiyaka"
      },
      {
        "ad": "Esentepe",
        "slug": "esentepe"
      },
      {
        "ad": "Doğanköy",
        "slug": "dogankoy"
      },
      {
        "ad": "Ozanköy",
        "slug": "ozankoy"
      },
      {
        "ad": "Karakum",
        "slug": "karakum"
      },
      {
        "ad": "Edremit",
        "slug": "edremit"
      }
    ]
  },
  {
    "il": "Lefkoşa",
    "ilSlug": "lefkosa",
    "ilceler": [
      {
        "ad": "Lefkoşa Genel (Tümü)",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Gönyeli",
        "slug": "gonyeli"
      },
      {
        "ad": "Değirmenlik",
        "slug": "degirmenlik"
      },
      {
        "ad": "Alayköy",
        "slug": "alaykoy"
      },
      {
        "ad": "Hamitköy",
        "slug": "hamitkoy"
      },
      {
        "ad": "Haspolat",
        "slug": "haspolat"
      },
      {
        "ad": "Ortaköy",
        "slug": "ortakoy"
      },
      {
        "ad": "Küçük Kaymaklı",
        "slug": "kucuk-kaymakli"
      },
      {
        "ad": "Taşkınköy",
        "slug": "taskinkoy"
      },
      {
        "ad": "Yenikent",
        "slug": "yenikent"
      },
      {
        "ad": "Surlariçi",
        "slug": "surlarici"
      }
    ]
  },
  {
    "il": "Gazimağusa",
    "ilSlug": "gazimagusa",
    "ilceler": [
      {
        "ad": "Gazimağusa Genel (Tümü)",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Maraş",
        "slug": "maras"
      },
      {
        "ad": "Yeniboğaziçi",
        "slug": "yenibogazici"
      },
      {
        "ad": "Geçitkale",
        "slug": "gecitkale"
      },
      {
        "ad": "Tatlısu",
        "slug": "tatlisu"
      },
      {
        "ad": "Akdoğan",
        "slug": "akdogan"
      },
      {
        "ad": "Beyarmudu",
        "slug": "beyarmudu"
      },
      {
        "ad": "Vadili",
        "slug": "vadili"
      },
      {
        "ad": "Serdarlı",
        "slug": "serdarli"
      },
      {
        "ad": "Tuzla",
        "slug": "tuzla"
      }
    ]
  },
  {
    "il": "İskele",
    "ilSlug": "iskele",
    "ilceler": [
      {
        "ad": "İskele Genel (Tümü)",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Bafra",
        "slug": "bafra"
      },
      {
        "ad": "Dipkarpaz",
        "slug": "dipkarpaz"
      },
      {
        "ad": "Yeni Erenköy",
        "slug": "yeni-erenkoy"
      },
      {
        "ad": "Mehmetçik",
        "slug": "mehmetcik"
      },
      {
        "ad": "Kumyalı",
        "slug": "kumyali"
      },
      {
        "ad": "Boğaz",
        "slug": "bogaz"
      },
      {
        "ad": "Ziyamet",
        "slug": "ziyamet"
      },
      {
        "ad": "Büyükkonuk",
        "slug": "buyukkonuk"
      }
    ]
  },
  {
    "il": "Güzelyurt",
    "ilSlug": "guzelyurt",
    "ilceler": [
      {
        "ad": "Güzelyurt Genel (Tümü)",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Kalkanlı",
        "slug": "kalkanli"
      },
      {
        "ad": "Yayla",
        "slug": "yayla"
      },
      {
        "ad": "Bostancı",
        "slug": "bostanci"
      },
      {
        "ad": "Gaziveren",
        "slug": "gaziveren"
      },
      {
        "ad": "Aydınköy",
        "slug": "aydinkoy"
      },
      {
        "ad": "Zümrütköy",
        "slug": "zumrutkoy"
      }
    ]
  },
  {
    "il": "Lefke",
    "ilSlug": "lefke",
    "ilceler": [
      {
        "ad": "Lefke Genel (Tümü)",
        "slug": "genel"
      },
      {
        "ad": "Merkez",
        "slug": "merkez"
      },
      {
        "ad": "Gemikonağı",
        "slug": "gemikonagi"
      },
      {
        "ad": "Yedidalga",
        "slug": "yedidalga"
      },
      {
        "ad": "Bağlıköy",
        "slug": "baglikoy"
      },
      {
        "ad": "Doğancı",
        "slug": "doganci"
      },
      {
        "ad": "Yeşilyurt",
        "slug": "yesilyurt"
      },
      {
        "ad": "Bademliköy",
        "slug": "bademlikoy"
      },
      {
        "ad": "Denizli",
        "slug": "denizli"
      }
    ]
  }
];
