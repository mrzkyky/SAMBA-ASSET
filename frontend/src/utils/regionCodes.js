/**
 * Database & Helper Kode Wilayah Indonesia (Kemendagri / BPS)
 * Referensi resmi: https://kodewilayah.web.id/
 * 
 * Digunakan untuk standarisasi nomor registrasi aset:
 * Format: AT/ADM/[KodeWilayah]/[Tahun]/[Sequence]
 * Contoh: AT/ADM/3329/2026/0001 (Kabupaten Brebes)
 */

// Daftar Kabupaten & Kota di Indonesia (514 Wilayah)
export const REGION_DATA = [
  // --- JAWA TENGAH (33) ---
  { code: '3329', name: 'Kabupaten Brebes', province: 'Jawa Tengah', aliases: ['brebes', 'jatibarang', 'bumiayu', 'larangan', 'ketanggungan', 'tanjung brebes', 'bulakamba', 'banjarharjo', 'paguyangan', 'sirampog', 'salem', 'bantarkawung', 'tonjong', 'kersana', 'songgom', 'wanasari', 'losari brebes', 'gandasuli'] },
  { code: '3376', name: 'Kota Tegal', province: 'Jawa Tengah', aliases: ['kota tegal', 'tegal barat', 'tegal timur', 'tegal selatan', 'margadana'] },
  { code: '3328', name: 'Kabupaten Tegal', province: 'Jawa Tengah', aliases: ['kabupaten tegal', 'kab tegal', 'kab. tegal', 'slawi', 'adiwerna', 'dukuhturi', 'talang', 'pangkah', 'tarub', 'kramat tegal', 'suradadi', 'warureja', 'kedungbanteng', 'balapulang', 'pagerbarang', 'lebaksiu', 'jatinegara tegal', 'margasari', 'bumijawa', 'bojong tegal'] },
  { code: '3327', name: 'Kabupaten Pemalang', province: 'Jawa Tengah', aliases: ['pemalang', 'comal', 'petarukan', 'randudongkal', 'ulujami', 'moga', 'bantarbolang', 'belik', 'bodeh', 'ampelgading pemalang', 'watukumpul', 'warungpring'] },
  { code: '3375', name: 'Kota Pekalongan', province: 'Jawa Tengah', aliases: ['kota pekalongan', 'pekalongan barat', 'pekalongan timur', 'pekalongan utara', 'pekalongan selatan'] },
  { code: '3326', name: 'Kabupaten Pekalongan', province: 'Jawa Tengah', aliases: ['kabupaten pekalongan', 'kab pekalongan', 'kajen', 'kedungwuni', 'wiradesa', 'bojong pekalongan', 'sragi', 'doro', 'karanganyar pekalongan'] },
  { code: '3325', name: 'Kabupaten Batang', province: 'Jawa Tengah', aliases: ['batang', 'limpung', 'subah', 'gringsing', 'banyuputih', 'tulis', 'warungasem', 'blado', 'reban', 'bawang batang'] },
  { code: '3302', name: 'Kabupaten Banyumas', province: 'Jawa Tengah', aliases: ['banyumas', 'purwokerto', 'ajibarang', 'wangon', 'sumpiuh', 'sokaraja', 'rawalo', 'jatilawang', 'kembaran'] },
  { code: '3301', name: 'Kabupaten Cilacap', province: 'Jawa Tengah', aliases: ['cilacap', 'majenang', 'sidareja', 'kroya', 'kesugihan', 'adipala', 'jeruklegi', 'wanareja', 'dayeuhluhur', 'gandrungmangu'] },
  { code: '3303', name: 'Kabupaten Purbalingga', province: 'Jawa Tengah', aliases: ['purbalingga', 'bobotsari', 'bukateja', 'kalimanah', 'padamara', 'rembang purbalingga'] },
  { code: '3304', name: 'Kabupaten Banjarnegara', province: 'Jawa Tengah', aliases: ['banjarnegara', 'klampok', 'purwareja', 'batur', 'dieng banjarnegara'] },
  { code: '3305', name: 'Kabupaten Kebumen', province: 'Jawa Tengah', aliases: ['kebumen', 'gombong', 'karanganyar kebumen', 'kutowinangun', 'prembun', 'ayah'] },
  { code: '3306', name: 'Kabupaten Purworejo', province: 'Jawa Tengah', aliases: ['purworejo', 'kutoarjo', 'bener', 'loano', 'bagelen'] },
  { code: '3307', name: 'Kabupaten Wonosobo', province: 'Jawa Tengah', aliases: ['wonosobo', 'kertek', 'garung', 'kejajar', 'mojotengah'] },
  { code: '3308', name: 'Kabupaten Magelang', province: 'Jawa Tengah', aliases: ['kabupaten magelang', 'muntilan', 'borobudur', 'salaman', 'secang', 'mertert'] },
  { code: '3371', name: 'Kota Magelang', province: 'Jawa Tengah', aliases: ['kota magelang'] },
  { code: '3374', name: 'Kota Semarang', province: 'Jawa Tengah', aliases: ['kota semarang', 'semarang kota', 'simpang lima', 'banyumanik', 'tembalang', 'pedurungan', 'gajahmungkur', 'candisari'] },
  { code: '3322', name: 'Kabupaten Semarang', province: 'Jawa Tengah', aliases: ['kabupaten semarang', 'ungaran', 'ambarawa', 'bawen', 'bergas', 'tuntang'] },
  { code: '3373', name: 'Kota Salatiga', province: 'Jawa Tengah', aliases: ['kota salatiga', 'salatiga'] },
  { code: '3324', name: 'Kabupaten Kendal', province: 'Jawa Tengah', aliases: ['kendal', 'weleri', 'kaliwungu', 'sukorejo kendal', 'boja', 'cepiring', 'patebon'] },
  { code: '3323', name: 'Kabupaten Temanggung', province: 'Jawa Tengah', aliases: ['temanggung', 'parakan', 'ngadirejo', 'kandangan'] },
  { code: '3321', name: 'Kabupaten Demak', province: 'Jawa Tengah', aliases: ['demak', 'sayung', 'mranggen', 'karangawen', 'gajah demak'] },
  { code: '3319', name: 'Kabupaten Kudus', province: 'Jawa Tengah', aliases: ['kudus', 'jati kudus', 'gebog', 'dawe', 'kaliwungu kudus'] },
  { code: '3320', name: 'Kabupaten Jepara', province: 'Jawa Tengah', aliases: ['jepara', 'tahunan', 'bangsri', 'pecangaan', 'karimunjawa'] },
  { code: '3318', name: 'Kabupaten Pati', province: 'Jawa Tengah', aliases: ['pati', 'juwana', 'tayu', 'kayen', 'sukolilo'] },
  { code: '3317', name: 'Kabupaten Rembang', province: 'Jawa Tengah', aliases: ['rembang', 'lasem', 'sarang', 'kragan', 'sulang'] },
  { code: '3316', name: 'Kabupaten Blora', province: 'Jawa Tengah', aliases: ['blora', 'cepu', 'kunduran', 'ngawen blora', 'randublatung'] },
  { code: '3315', name: 'Kabupaten Grobogan', province: 'Jawa Tengah', aliases: ['grobogan', 'purwodadi', 'grobogan', 'wirosari', 'godong'] },
  { code: '3309', name: 'Kabupaten Boyolali', province: 'Jawa Tengah', aliases: ['boyolali', 'ampel', 'mojosongo', 'banyudono'] },
  { code: '3310', name: 'Kabupaten Klaten', province: 'Jawa Tengah', aliases: ['klaten', 'delanggu', 'pedan', 'prambanan klaten'] },
  { code: '3372', name: 'Kota Surakarta', province: 'Jawa Tengah', aliases: ['kota surakarta', 'surakarta', 'solo', 'banjarsari solo', 'jebres', 'pasar kliwon', 'laweyan'] },
  { code: '3311', name: 'Kabupaten Sukoharjo', province: 'Jawa Tengah', aliases: ['sukoharjo', 'kartasura', 'grogol solo baru', 'baki'] },
  { code: '3312', name: 'Kabupaten Wonogiri', province: 'Jawa Tengah', aliases: ['wonogiri', 'baturetno', 'pracimantoro', 'jatisrono'] },
  { code: '3313', name: 'Kabupaten Karanganyar', province: 'Jawa Tengah', aliases: ['karanganyar', 'colomadu', 'gondangrejo', 'tawangmangu'] },
  { code: '3314', name: 'Kabupaten Sragen', province: 'Jawa Tengah', aliases: ['sragen', 'gemolong', 'masaran', 'sambungmacan'] },

  // --- JAWA BARAT (32) ---
  { code: '3209', name: 'Kabupaten Cirebon', province: 'Jawa Barat', aliases: ['kabupaten cirebon', 'sumber cirebon', 'weru', 'kedawung cirebon', 'plumbon', 'palimanan', 'arjawinangun', 'losari cirebon', 'ciledug cirebon', 'astanalajapura', 'klangenan'] },
  { code: '3274', name: 'Kota Cirebon', province: 'Jawa Barat', aliases: ['kota cirebon', 'kejaksan', 'kesambi', 'lembahwungkuk', 'pekalipan', 'harjamukti'] },
  { code: '3212', name: 'Kabupaten Indramayu', province: 'Jawa Barat', aliases: ['indramayu', 'jatibarang indramayu', 'hargeulis', 'losarang', 'karangampel', 'patrol'] },
  { code: '3208', name: 'Kabupaten Kuningan', province: 'Jawa Barat', aliases: ['kuningan', 'cilimus', 'jalaksana', 'kadugede', 'ciawigebang'] },
  { code: '3210', name: 'Kabupaten Majalengka', province: 'Jawa Barat', aliases: ['majalengka', 'kertajati', 'kadipaten', 'jatiwangi', 'sumberjaya'] },
  { code: '3273', name: 'Kota Bandung', province: 'Jawa Barat', aliases: ['kota bandung', 'bandung kota', 'dago', 'buahbatu', 'sukajadi', 'antapani', 'cibiru'] },
  { code: '3204', name: 'Kabupaten Bandung', province: 'Jawa Barat', aliases: ['kabupaten bandung', 'soreang', 'baleendah', 'dayeuhkolot', 'banjaran', 'majalaya', 'cileunyi', 'rancaekek'] },
  { code: '3217', name: 'Kabupaten Bandung Barat', province: 'Jawa Barat', aliases: ['bandung barat', 'ngamprah', 'padalarang', 'lembang', 'cimareme', 'batujajar'] },
  { code: '3277', name: 'Kota Cimahi', province: 'Jawa Barat', aliases: ['kota cimahi', 'cimahi'] },
  { code: '3211', name: 'Kabupaten Sumedang', province: 'Jawa Barat', aliases: ['sumedang', 'jatinangor', 'tanjungsari', 'paseh sumedang', 'tombe'] },
  { code: '3213', name: 'Kabupaten Subang', province: 'Jawa Barat', aliases: ['subang', 'kalijati', 'patokbeusi', 'pamanukan', 'ciater'] },
  { code: '3214', name: 'Kabupaten Purwakarta', province: 'Jawa Barat', aliases: ['purwakarta', 'jatiluhur', 'campaka purwakarta', 'plered'] },
  { code: '3215', name: 'Kabupaten Karawang', province: 'Jawa Barat', aliases: ['karawang', 'klari', 'cikampek', 'rengasdengklok', 'telukjambe'] },
  { code: '3275', name: 'Kota Bekasi', province: 'Jawa Barat', aliases: ['kota bekasi', 'bekasi barat', 'bekasi timur', 'bekasi selatan', 'pondok gede'] },
  { code: '3216', name: 'Kabupaten Bekasi', province: 'Jawa Barat', aliases: ['kabupaten bekasi', 'cikarang', 'tambun', 'cibitung', 'sukatani'] },
  { code: '3271', name: 'Kota Bogor', province: 'Jawa Barat', aliases: ['kota bogor'] },
  { code: '3201', name: 'Kabupaten Bogor', province: 'Jawa Barat', aliases: ['kabupaten bogor', 'cibinong', 'cileungsi', 'gunung putri', 'parung', 'citeureup'] },
  { code: '3276', name: 'Kota Depok', province: 'Jawa Barat', aliases: ['kota depok', 'depok', 'sawangan', 'cinere', 'cimanggis', 'margonda'] },
  { code: '3272', name: 'Kota Sukabumi', province: 'Jawa Barat', aliases: ['kota sukabumi'] },
  { code: '3202', name: 'Kabupaten Sukabumi', province: 'Jawa Barat', aliases: ['kabupaten sukabumi', 'palabuhanratu', 'cibadak', 'cicurug'] },
  { code: '3203', name: 'Kabupaten Cianjur', province: 'Jawa Barat', aliases: ['cianjur', 'cipanas', 'pacet cianjur', 'ciranjang'] },
  { code: '3205', name: 'Kabupaten Garut', province: 'Jawa Barat', aliases: ['garut', 'tarogong', 'kadungora', 'leles', 'cibatu garut'] },
  { code: '3278', name: 'Kota Tasikmalaya', province: 'Jawa Barat', aliases: ['kota tasikmalaya'] },
  { code: '3206', name: 'Kabupaten Tasikmalaya', province: 'Jawa Barat', aliases: ['kabupaten tasikmalaya', 'singaparna'] },
  { code: '3207', name: 'Kabupaten Ciamis', province: 'Jawa Barat', aliases: ['ciamis', 'kawali', 'panumbangan'] },
  { code: '3279', name: 'Kota Banjar', province: 'Jawa Barat', aliases: ['kota banjar', 'banjar patroman'] },
  { code: '3218', name: 'Kabupaten Pangandaran', province: 'Jawa Barat', aliases: ['pangandaran', 'parigi'] },

  // --- DKI JAKARTA (31) ---
  { code: '3171', name: 'Kota Administrasi Jakarta Pusat', province: 'DKI Jakarta', aliases: ['jakarta pusat', 'jakpus', 'gambir', 'tanah abang', 'menteng', 'kemayoran', 'senen', 'cempaka putih'] },
  { code: '3172', name: 'Kota Administrasi Jakarta Utara', province: 'DKI Jakarta', aliases: ['jakarta utara', 'jakut', 'tanjung priok', 'kelapa gading', 'pluit', 'penjaringan', 'pademangan'] },
  { code: '3173', name: 'Kota Administrasi Jakarta Barat', province: 'DKI Jakarta', aliases: ['jakarta barat', 'jakbar', 'kebon jeruk', 'puri kembangan', 'cengkareng', 'grogol', 'tamansari', 'kalideres'] },
  { code: '3174', name: 'Kota Administrasi Jakarta Selatan', province: 'DKI Jakarta', aliases: ['jakarta selatan', 'jaksel', 'kebayoran baru', 'kebayoran lama', 'cilandak', 'tebet', 'pancoran', 'pasar minggu', 'mampang'] },
  { code: '3175', name: 'Kota Administrasi Jakarta Timur', province: 'DKI Jakarta', aliases: ['jakarta timur', 'jaktim', 'matraman', 'pulogadung', 'jatinegara', 'kramat jati', 'duren sawit', 'cakung', 'ciracas'] },
  { code: '3101', name: 'Kabupaten Kepulauan Seribu', province: 'DKI Jakarta', aliases: ['kepulauan seribu'] },

  // --- BANTEN (36) ---
  { code: '3671', name: 'Kota Tangerang', province: 'Banten', aliases: ['kota tangerang'] },
  { code: '3674', name: 'Kota Tangerang Selatan', province: 'Banten', aliases: ['tangerang selatan', 'tangsel', 'bsd', 'bintaro', 'serpong', 'ciputat', 'pamulang'] },
  { code: '3603', name: 'Kabupaten Tangerang', province: 'Banten', aliases: ['kabupaten tangerang', 'tigaraksa', 'balaraja', 'cikupa', 'pasar kemis'] },
  { code: '3673', name: 'Kota Serang', province: 'Banten', aliases: ['kota serang'] },
  { code: '3604', name: 'Kabupaten Serang', province: 'Banten', aliases: ['kabupaten serang', 'ciruas', 'kragilan'] },
  { code: '3672', name: 'Kota Cilegon', province: 'Banten', aliases: ['kota cilegon', 'cilegon', 'merak'] },
  { code: '3602', name: 'Kabupaten Lebak', province: 'Banten', aliases: ['lebak', 'rangkasbitung', 'malingping'] },
  { code: '3601', name: 'Kabupaten Pandeglang', province: 'Banten', aliases: ['pandeglang', 'labuan'] },

  // --- DI YOGYAKARTA (34) ---
  { code: '3471', name: 'Kota Yogyakarta', province: 'DI Yogyakarta', aliases: ['kota yogyakarta', 'jogja', 'yogyakarta', 'malioboro', 'gondokusuman', 'umbulharjo'] },
  { code: '3404', name: 'Kabupaten Sleman', province: 'DI Yogyakarta', aliases: ['sleman', 'depok sleman', 'mlati', 'godean', 'ngaglik'] },
  { code: '3402', name: 'Kabupaten Bantul', province: 'DI Yogyakarta', aliases: ['bantul', 'sewon', 'kasihan', 'banguntapan'] },
  { code: '3401', name: 'Kabupaten Kulon Progo', province: 'DI Yogyakarta', aliases: ['kulon progo', 'wates', 'yia'] },
  { code: '3403', name: 'Kabupaten Gunungkidul', province: 'DI Yogyakarta', aliases: ['gunungkidul', 'wonosari'] },

  // --- JAWA TIMUR (35) ---
  { code: '3578', name: 'Kota Surabaya', province: 'Jawa Timur', aliases: ['surabaya', 'kota surabaya', 'gubeng', 'wonokromo', 'rungkut', 'tegal sari surabaya'] },
  { code: '3515', name: 'Kabupaten Sidoarjo', province: 'Jawa Timur', aliases: ['sidoarjo', 'waru sidoarjo', 'gedangan', 'krian'] },
  { code: '3525', name: 'Kabupaten Gresik', province: 'Jawa Timur', aliases: ['gresik', 'kebomas', 'driyorejo'] },
  { code: '3573', name: 'Kota Malang', province: 'Jawa Timur', aliases: ['kota malang', 'klojen', 'lowokwaru', 'blimbing'] },
  { code: '3507', name: 'Kabupaten Malang', province: 'Jawa Timur', aliases: ['kabupaten malang', 'kepanjen', 'singosari', 'lawang'] },
  { code: '3579', name: 'Kota Batu', province: 'Jawa Timur', aliases: ['kota batu', 'batu malang'] },
  { code: '3571', name: 'Kota Kediri', province: 'Jawa Timur', aliases: ['kota kediri'] },
  { code: '3506', name: 'Kabupaten Kediri', province: 'Jawa Timur', aliases: ['kabupaten kediri', 'pare kediri'] },
  { code: '3516', name: 'Kabupaten Mojokerto', province: 'Jawa Timur', aliases: ['kabupaten mojokerto'] },
  { code: '3576', name: 'Kota Mojokerto', province: 'Jawa Timur', aliases: ['kota mojokerto'] },
  { code: '3510', name: 'Kabupaten Banyuwangi', province: 'Jawa Timur', aliases: ['banyuwangi', 'ketapang banyuwangi'] },
  { code: '3509', name: 'Kabupaten Jember', province: 'Jawa Timur', aliases: ['jember'] },
  { code: '3577', name: 'Kota Madiun', province: 'Jawa Timur', aliases: ['kota madiun'] },
  { code: '3519', name: 'Kabupaten Madiun', province: 'Jawa Timur', aliases: ['kabupaten madiun', 'caruban'] },

  // --- SUMATERA & KOTA BESAR LAINNYA ---
  { code: '1271', name: 'Kota Medan', province: 'Sumatera Utara', aliases: ['medan', 'kota medan'] },
  { code: '1207', name: 'Kabupaten Deli Serdang', province: 'Sumatera Utara', aliases: ['deli serdang', 'lubuk pakam'] },
  { code: '1671', name: 'Kota Palembang', province: 'Sumatera Selatan', aliases: ['palembang', 'kota palembang'] },
  { code: '1871', name: 'Kota Bandar Lampung', province: 'Lampung', aliases: ['bandar lampung', 'lampung'] },
  { code: '1471', name: 'Kota Pekanbaru', province: 'Riau', aliases: ['pekanbaru', 'riau'] },
  { code: '2171', name: 'Kota Batam', province: 'Kepulauan Riau', aliases: ['batam', 'kota batam'] },
  { code: '1371', name: 'Kota Padang', province: 'Sumatera Barat', aliases: ['padang', 'kota padang'] },
  // --- BALI (51) ---
  { code: '5171', name: 'Kota Denpasar', province: 'Bali', aliases: ['kota denpasar', 'denpasar', 'sanur', 'panjer', 'renon'] },
  { code: '5103', name: 'Kabupaten Badung', province: 'Bali', aliases: ['badung', 'kuta', 'seminyak', 'canggu', 'nusa dua', 'jimbaran', 'mengwi'] },
  { code: '5102', name: 'Kabupaten Tabanan', province: 'Bali', aliases: ['tabanan', 'kediri tabanan', 'baturiti'] },
  { code: '5104', name: 'Kabupaten Gianyar', province: 'Bali', aliases: ['gianyar', 'ubud', 'sukawati'] },
  { code: '5108', name: 'Kabupaten Buleleng', province: 'Bali', aliases: ['buleleng', 'singaraja'] },

  // --- KALIMANTAN SELATAN (63) ---
  {
    code: '6302',
    name: 'Kabupaten Kotabaru',
    province: 'Kalimantan Selatan',
    aliases: [
      'kotabaru', 'kota baru', 'kabupaten kotabaru', 'kab kotabaru', 'kotabaru regency',
      'pulau sebuku', 'sungai durian', 'pulau laut', 'pulau laut utara', 'pulau laut selatan',
      'pulau laut barat', 'pulau laut timur', 'pulau laut tengah', 'pulau laut kepulauan',
      'pulau laut sigam', 'pulau laut tanjung selayar', 'hampang', 'kelumpang', 'kelumpang hilir',
      'kelumpang hulu', 'kelumpang tengah', 'kelumpang utara', 'kelumpang barat', 'kelumpang selatan',
      'pamukan', 'pamukan barat', 'pamukan utara', 'pamukan selatan', 'sampanahan',
      'serongga', 'dirgahayu', 'sebatung', 'semayap', 'sungai bali', 'manunggul lama',
      'sebanti', 'alle alle', 'stagen', 'sungai taib', 'gunung sari kotabaru', 'kotabaru tengah',
      'kotabaru hilir', 'kotabaru hulu', 'baharu'
    ]
  },
  {
    code: '6371',
    name: 'Kota Banjarmasin',
    province: 'Kalimantan Selatan',
    aliases: [
      'kota banjarmasin', 'banjarmasin', 'banjarmasin barat', 'banjarmasin timur',
      'banjarmasin tengah', 'banjarmasin utara', 'banjarmasin selatan', 'sungai miai',
      'kayutangi', 'kuranji banjarmasin', 'teluk dalam banjarmasin'
    ]
  },
  {
    code: '6372',
    name: 'Kota Banjarbaru',
    province: 'Kalimantan Selatan',
    aliases: ['kota banjarbaru', 'banjarbaru', 'landasan ulin', 'liang anggang', 'cempaka banjarbaru', 'guntung payung', 'loktabat']
  },
  {
    code: '6301',
    name: 'Kabupaten Tanah Laut',
    province: 'Kalimantan Selatan',
    aliases: ['tanah laut', 'tala', 'pelaihari', 'bati bati', 'kintap', 'jorong', 'takisung', 'kurau', 'batu ampar tala']
  },
  {
    code: '6303',
    name: 'Kabupaten Banjar',
    province: 'Kalimantan Selatan',
    aliases: ['kabupaten banjar', 'kab banjar', 'martapura', 'keraton martapura', 'karang intan', 'astambul', 'simpang empat banjar', 'gambut', 'kertak hanyar', 'aluh aluh', 'sungai tabuk']
  },
  {
    code: '6304',
    name: 'Kabupaten Barito Kuala',
    province: 'Kalimantan Selatan',
    aliases: ['barito kuala', 'batola', 'marabahan', 'alalak', 'mandastana', 'anjir muara', 'anjir pasar', 'rantaubadauh', 'belawang']
  },
  {
    code: '6305',
    name: 'Kabupaten Tapin',
    province: 'Kalimantan Selatan',
    aliases: ['kabupaten tapin', 'tapin', 'rantau', 'binuang', 'lokpaikat', 'bakarangan']
  },
  {
    code: '6306',
    name: 'Kabupaten Hulu Sungai Selatan',
    province: 'Kalimantan Selatan',
    aliases: ['hulu sungai selatan', 'hss', 'kandangan', 'nagara', 'angkinang', 'simpur', 'daha', 'daha utara', 'daha selatan']
  },
  {
    code: '6307',
    name: 'Kabupaten Hulu Sungai Tengah',
    province: 'Kalimantan Selatan',
    aliases: ['hulu sungai tengah', 'hst', 'barabai', 'batang alai', 'haruyan', 'batu benawa', 'labuan amas']
  },
  {
    code: '6308',
    name: 'Kabupaten Hulu Sungai Utara',
    province: 'Kalimantan Selatan',
    aliases: ['hulu sungai utara', 'hsu', 'amuntai', 'danau panggang', 'banjang', 'babirik']
  },
  {
    code: '6309',
    name: 'Kabupaten Tabalong',
    province: 'Kalimantan Selatan',
    aliases: ['kabupaten tabalong', 'tabalong', 'tanjung tabalong', 'murung pudak', 'kelua', 'haruai']
  },
  {
    code: '6310',
    name: 'Kabupaten Tanah Bumbu',
    province: 'Kalimantan Selatan',
    aliases: ['tanah bumbu', 'tanbu', 'batulicin', 'batu licin', 'simpang empat tanbu', 'satui', 'kusan hilir', 'pagatan', 'sungai loban', 'mantewe']
  },
  {
    code: '6311',
    name: 'Kabupaten Balangan',
    province: 'Kalimantan Selatan',
    aliases: ['kabupaten balangan', 'balangan', 'paringin', 'lampihong', 'awayan', 'halong']
  },

  // --- KALIMANTAN TIMUR & LAINNYA (64, 62, 61, 65) ---
  { code: '6471', name: 'Kota Balikpapan', province: 'Kalimantan Timur', aliases: ['balikpapan', 'kota balikpapan'] },
  { code: '6472', name: 'Kota Samarinda', province: 'Kalimantan Timur', aliases: ['samarinda', 'kota samarinda'] },
  { code: '6402', name: 'Kabupaten Kutai Kartanegara', province: 'Kalimantan Timur', aliases: ['kutai kartanegara', 'kukar', 'tenggarong'] },
  { code: '6474', name: 'Kota Bontang', province: 'Kalimantan Timur', aliases: ['bontang', 'kota bontang'] },
  { code: '6403', name: 'Kabupaten Berau', province: 'Kalimantan Timur', aliases: ['berau', 'tanjung redeb'] },
  { code: '6409', name: 'Kabupaten Penajam Paser Utara', province: 'Kalimantan Timur', aliases: ['penajam paser utara', 'ppu', 'penajam', 'sepaku', 'ikn'] },
  { code: '6271', name: 'Kota Palangka Raya', province: 'Kalimantan Tengah', aliases: ['palangka raya', 'palangkaraya', 'kota palangka raya'] },
  { code: '6201', name: 'Kabupaten Kotawaringin Barat', province: 'Kalimantan Tengah', aliases: ['kotawaringin barat', 'kobar', 'pangkalan bun'] },
  { code: '6202', name: 'Kabupaten Kotawaringin Timur', province: 'Kalimantan Tengah', aliases: ['kotawaringin timur', 'kotim', 'sampit'] },
  { code: '6203', name: 'Kabupaten Kapuas', province: 'Kalimantan Tengah', aliases: ['kapuas', 'kuala kapuas'] },
  { code: '6171', name: 'Kota Pontianak', province: 'Kalimantan Barat', aliases: ['pontianak', 'kota pontianak'] },
  { code: '6172', name: 'Kota Singkawang', province: 'Kalimantan Barat', aliases: ['singkawang', 'kota singkawang'] },
  { code: '6104', name: 'Kabupaten Ketapang', province: 'Kalimantan Barat', aliases: ['ketapang'] },
  { code: '6571', name: 'Kota Tarakan', province: 'Kalimantan Utara', aliases: ['tarakan', 'kota tarakan'] },
  { code: '6501', name: 'Kabupaten Bulungan', province: 'Kalimantan Utara', aliases: ['bulungan', 'tanjung selor'] },

  // --- SULAWESI & LAINNYA (73, dll) ---
  { code: '7371', name: 'Kota Makassar', province: 'Sulawesi Selatan', aliases: ['makassar', 'kota makassar', 'ujung pandang'] },
  { code: '7372', name: 'Kota Parepare', province: 'Sulawesi Selatan', aliases: ['parepare', 'kota parepare'] },
  { code: '7373', name: 'Kota Palopo', province: 'Sulawesi Selatan', aliases: ['palopo', 'kota palopo'] },
  { code: '7171', name: 'Kota Manado', province: 'Sulawesi Utara', aliases: ['manado', 'kota manado'] },
];

/**
 * Normalisasi teks untuk pencarian fuzzy / tokenized search
 */
function cleanText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mencocokkan teks (alamat / nama site) terhadap daftar wilayah
 * Mengembalikan objek wilayah jika ditemukan, atau null jika tidak
 */
export function matchRegionFromText(text) {
  if (!text) return null;
  const cleaned = cleanText(text);
  if (!cleaned) return null;

  // 1. Cek kecocokan prioritas tinggi (Exact match pada alias atau nama resmi)
  for (const item of REGION_DATA) {
    // Cek alias
    if (item.aliases && item.aliases.length > 0) {
      for (const alias of item.aliases) {
        // Gunakan regex boundary untuk kata lengkap agar tidak salah tangkap (contoh: "tangerang" vs "tangerang selatan")
        const regex = new RegExp(`\\b${cleanText(alias)}\\b`, 'i');
        if (regex.test(cleaned)) {
          return item;
        }
      }
    }
  }

  // 2. Cek nama kabupaten / kota dasar (contoh: "brebes", "tegal", "pemalang", "kotabaru")
  for (const item of REGION_DATA) {
    const rawName = item.name.toLowerCase().replace('kabupaten ', '').replace('kota administrasi ', '').replace('kota ', '');
    const regex = new RegExp(`\\b${cleanText(rawName)}\\b`, 'i');
    if (regex.test(cleaned)) {
      return item;
    }
  }

  return null;
}

/**
 * Resolver Cerdas Kode Wilayah:
 * Memeriksa bertingkat:
 * 1. site.address (Alamat lengkap)
 * 2. site.site_name (Nama site)
 * 3. site.partner_name (Nama mitra)
 * 4. branch.name (Nama cabang & provinsi)
 * 5. Fallback Default berdasarkan Branch atau Default Nasional (Brebes 3329)
 * 
 * @param {Object} site Objek site (site_name, address, partner_name)
 * @param {Object} branch Objek branch (name, province, code)
 * @returns {Object} { code: string, name: string, province: string, source: string }
 */
export function resolveRegionCode(site, branch) {
  // 1. Cek dari Alamat Site
  if (site && site.address) {
    const fromAddress = matchRegionFromText(site.address);
    if (fromAddress) {
      return {
        ...fromAddress,
        source: 'Alamat Site',
      };
    }
  }

  // 2. Cek dari Nama Site
  if (site && site.site_name) {
    const fromSiteName = matchRegionFromText(site.site_name);
    if (fromSiteName) {
      return {
        ...fromSiteName,
        source: 'Nama Site',
      };
    }
  }

  // 3. Cek dari Nama Mitra
  if (site && site.partner_name) {
    const fromPartner = matchRegionFromText(site.partner_name);
    if (fromPartner) {
      return {
        ...fromPartner,
        source: 'Nama Mitra',
      };
    }
  }

  // 4. Cek dari Nama Cabang (Branch) & Mapping Provinsi Cabang
  const branchObj = site?.branch || branch;
  const branchName = branchObj?.name || '';
  const branchCode = branchObj?.code || '';
  const branchProvince = branchObj?.province || '';

  if (branchName) {
    const fromBranch = matchRegionFromText(branchName);
    if (fromBranch) {
      return {
        ...fromBranch,
        source: 'Nama Cabang',
      };
    }
  }

  // 4b. Cek dari Singkatan / Kata Kunci Wilayah Cabang (Kalsel, Kaltim, Jabar, Jatim, DKI, dll)
  const combinedBranchText = cleanText(`${branchName} ${branchCode} ${branchProvince}`);
  
  if (combinedBranchText.includes('kalsel') || combinedBranchText.includes('kalimantan selatan')) {
    // Jika ada indikasi kotabaru pada site atau address
    const siteText = cleanText(`${site?.site_name || ''} ${site?.partner_name || ''} ${site?.address || ''}`);
    if (siteText.includes('kotabaru') || siteText.includes('kota baru') || siteText.includes('pulau laut') || siteText.includes('sebuku')) {
      return {
        code: '6302',
        name: 'Kabupaten Kotabaru',
        province: 'Kalimantan Selatan',
        source: 'Cabang Kalsel (Kotabaru)',
      };
    }
    return {
      code: '6371',
      name: 'Kota Banjarmasin',
      province: 'Kalimantan Selatan',
      source: 'Cabang Kalsel (Pusat)',
    };
  }

  if (combinedBranchText.includes('kaltim') || combinedBranchText.includes('kalimantan timur')) {
    return {
      code: '6471',
      name: 'Kota Balikpapan',
      province: 'Kalimantan Timur',
      source: 'Cabang Kaltim',
    };
  }

  if (combinedBranchText.includes('kalteng') || combinedBranchText.includes('kalimantan tengah')) {
    return {
      code: '6271',
      name: 'Kota Palangka Raya',
      province: 'Kalimantan Tengah',
      source: 'Cabang Kalteng',
    };
  }

  if (combinedBranchText.includes('kalbar') || combinedBranchText.includes('kalimantan barat')) {
    return {
      code: '6171',
      name: 'Kota Pontianak',
      province: 'Kalimantan Barat',
      source: 'Cabang Kalbar',
    };
  }

  if (combinedBranchText.includes('jabar') || combinedBranchText.includes('jawa barat') || combinedBranchText.includes('bandung')) {
    return {
      code: '3273',
      name: 'Kota Bandung',
      province: 'Jawa Barat',
      source: 'Cabang Jawa Barat',
    };
  }

  if (combinedBranchText.includes('jatim') || combinedBranchText.includes('jawa timur') || combinedBranchText.includes('surabaya')) {
    return {
      code: '3578',
      name: 'Kota Surabaya',
      province: 'Jawa Timur',
      source: 'Cabang Jawa Timur',
    };
  }

  if (combinedBranchText.includes('dki') || combinedBranchText.includes('jakarta')) {
    return {
      code: '3171',
      name: 'Kota Administrasi Jakarta Pusat',
      province: 'DKI Jakarta',
      source: 'Cabang DKI Jakarta',
    };
  }

  if (combinedBranchText.includes('sumut') || combinedBranchText.includes('medan')) {
    return {
      code: '1271',
      name: 'Kota Medan',
      province: 'Sumatera Utara',
      source: 'Cabang Sumatera Utara',
    };
  }

  // 5. Fallback default aman ke Kabupaten Brebes (3329)
  return {
    code: '3329',
    name: 'Kabupaten Brebes',
    province: 'Jawa Tengah',
    source: 'Default Brebes',
  };
}

/**
 * Format resmi Nomor Aset:
 * AT/ADM/[KodeWilayah]/[Tahun]/[Sequence]
 */
export function generateAssetRegistrationNo({ prefix = 'AT/ADM', site, branch, year, sequence = '0001' }) {
  const region = resolveRegionCode(site, branch);
  const currentYear = year || new Date().getFullYear();
  const cleanSeq = String(sequence).padStart(4, '0');
  return {
    fullNumber: `${prefix}/${region.code}/${currentYear}/${cleanSeq}`,
    region,
  };
}
