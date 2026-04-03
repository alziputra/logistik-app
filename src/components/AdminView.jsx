"use client";

import { useState } from "react";
import { 
  Database, Plus, Box, Hash, Scale, PackageOpen, Building2, CalendarDays, Clock, Search, MapPin, DownloadCloud
} from "lucide-react";

export default function AdminView({ inventory, handleAddInventory, outlets, handleAddOutlet, handleBulkImportOutlets }) {
  // State untuk Tab Aktif: 'barang' atau 'outlet'
  const [activeTab, setActiveTab] = useState("barang");
  
  // State Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOutletQuery, setSearchOutletQuery] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateMonths = () => {
    const form = document.getElementById("formAdmin");
    if (!form || !form.tanggal_mulai || !form.tanggal_selesai) return;

    const start = form.tanggal_mulai.value;
    const end = form.tanggal_selesai.value;

    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      form.masa_sewa_bulan.value = months > 0 ? months : 0;
    }
  };

  const filteredInventory = inventory.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return inv.nama?.toLowerCase().includes(q) || inv.vendor_nama?.toLowerCase().includes(q) || inv.no_spk?.toLowerCase().includes(q);
  });

  const filteredOutlets = (outlets || []).filter((out) => {
    const q = searchOutletQuery.toLowerCase();
    return out.nama?.toLowerCase().includes(q) || out.kode?.toLowerCase().includes(q);
  });

  // ==========================================
  // DATA MENTAH UNTUK BULK IMPORT 1 KLIK
  // ==========================================
  const rawOutletsData = [
    { kode: "12447", nama: "UPC TAMAN RAFLESIA" }, { kode: "12473", nama: "CP BEKASI TIMUR" }, { kode: "12474", nama: "UPC RAWA PANJANG" }, { kode: "12475", nama: "UPC JATI MULYA" }, { kode: "12477", nama: "UPC KALIABANG NANGKA" }, { kode: "12478", nama: "UPC KARANG SATRIA" }, { kode: "12479", nama: "UPC PONDOK HIJAU" }, { kode: "12480", nama: "UPC BUMYAGARA" }, { kode: "12481", nama: "UPC MUSTIKA JAYA" }, { kode: "12482", nama: "UPC PONDOK TIMUR" }, { kode: "12635", nama: "UPC MUTIARA GADING TIMUR" }, { kode: "12341", nama: "CP BEKASI UTAMA" }, { kode: "12342", nama: "UPC WISMA ASRI" }, { kode: "12343", nama: "UPC VILLA ASRI" }, { kode: "12345", nama: "UPC MEKAR SARI" }, { kode: "12346", nama: "UPC DUKUH ZAMRUD" }, { kode: "12347", nama: "UPC MEGA BEKASI" }, { kode: "12349", nama: "UPC VILA INDAH PERMAI" }, { kode: "12351", nama: "UPC KEBALEN" }, { kode: "12439", nama: "UPC GABUS RAYA" }, { kode: "12513", nama: "UPC TELUK PUCUNG" }, { kode: "12616", nama: "UPC PONCOL KARTINI" }, { kode: "12374", nama: "CP BOGOR" }, { kode: "12376", nama: "UPC PAMOYANAN" }, { kode: "12377", nama: "UPC BOGOR TRADE MALL" }, { kode: "12538", nama: "UPC TAJUR" }, { kode: "12539", nama: "UPC CIAWI" }, { kode: "12540", nama: "UPC CARINGIN" }, { kode: "12542", nama: "UPC CISARUA" }, { kode: "12543", nama: "UPC PASAR SUKASARI" }, { kode: "12618", nama: "UPC LIMO" }, { kode: "12620", nama: "UPC MERUYUNG" }, { kode: "12621", nama: "UPC RAYA MUCHTAR" }, { kode: "12685", nama: "CP BOJONGSARI" }, { kode: "12686", nama: "UPC BOJONGSARI BARU" }, { kode: "12688", nama: "UPC BEDAHAN" }, { kode: "12689", nama: "UPC PONDOK PETIR" }, { kode: "12693", nama: "UPC ARCO" }, { kode: "12570", nama: "CP BUARAN" }, { kode: "12571", nama: "UPC PULOJAHE" }, { kode: "12572", nama: "UPC MALAKA" }, { kode: "12573", nama: "UPC DUREN SAWIT" }, { kode: "12576", nama: "UPC DERMAGA" }, { kode: "12577", nama: "UPC BUNGA RAMPAI" }, { kode: "12307", nama: "UPC KAMPUNG RAWA" }, { kode: "12484", nama: "CP CEMPAKA PUTIH" }, { kode: "12485", nama: "UPC RAWASARI" }, { kode: "12487", nama: "UPC MARDANI" }, { kode: "12488", nama: "UPC RUMAH SAKIT ISLAM" }, { kode: "12458", nama: "CP CIBINONG" }, { kode: "12459", nama: "UPC TLAJUNG UDIK" }, { kode: "12460", nama: "UPC SUKAHATI" }, { kode: "12461", nama: "UPC CIKARET" }, { kode: "12462", nama: "UPC CILANGKAP" }, { kode: "12463", nama: "UPC CIRIUNG" }, { kode: "12626", nama: "UPC CITEREUP" }, { kode: "12691", nama: "UPC KEDUNG WARINGIN" }, { kode: "12701", nama: "UPC TAPOS" }, { kode: "12545", nama: "CP CIBUBUR" }, { kode: "12546", nama: "UPC PASAR REBO" }, { kode: "12547", nama: "UPC CIRACAS" }, { kode: "12549", nama: "UPC PASAR CIBUBUR" }, { kode: "12550", nama: "UPC CEGER" }, { kode: "12551", nama: "UPC KELAPA DUA CIBUBUR" }, { kode: "12699", nama: "UPC CIBUBUR JUNCTION" }, { kode: "12705", nama: "UPC KALISARI DALAM" }, { kode: "12706", nama: "UPC GONGSENG" }, { kode: "12465", nama: "CP CIKARANG" }, { kode: "12466", nama: "UPC JABABEKA" }, { kode: "12467", nama: "UPC KALIJAYA" }, { kode: "12468", nama: "UPC SERANG CIKARANG" }, { kode: "12469", nama: "UPC SGC" }, { kode: "12470", nama: "UPC SUKAMANTRI" }, { kode: "12471", nama: "UPC GRAHA CIKARANG" }, { kode: "12472", nama: "UPC SUKARESMI" }, { kode: "12398", nama: "UPC PASAR MUSI" }, { kode: "12403", nama: "UPC GAS ALAM" }, { kode: "12694", nama: "CP CISALAK" }, { kode: "12695", nama: "UPC RADAR AURI" }, { kode: "12697", nama: "UPC CIMANGGIS" }, { kode: "12698", nama: "UPC PEKAPURAN" }, { kode: "12395", nama: "CP DEPOK" }, { kode: "12396", nama: "UPC CITAYAM" }, { kode: "12397", nama: "UPC SUKAMAJU" }, { kode: "12399", nama: "UPC PASAR PUCUNG" }, { kode: "12400", nama: "UPC PASAR AGUNG" }, { kode: "12401", nama: "UPC ITC DEPOK" }, { kode: "12402", nama: "UPC GRIYA DEPOK ASRI" }, { kode: "12524", nama: "UPC PASAR CITAYAM" }, { kode: "12526", nama: "UPC RATU JAYA" }, { kode: "12619", nama: "UPC KOTA KEMBANG" }, { kode: "12696", nama: "UPC KEMAKMURAN" }, { kode: "12676", nama: "CP GALAXI" }, { kode: "12677", nama: "UPC RAJAWALI PERUMNAS I" }, { kode: "12679", nama: "UPC VILA PEKAYON" }, { kode: "12681", nama: "UPC GRAHA" }, { kode: "12683", nama: "UPC PEMDA JATIASIH" }, { kode: "12684", nama: "UPC GALAXY NUSA INDAH" }, { kode: "12379", nama: "UPC CIAPUS" }, { kode: "12495", nama: "UPC PAGELARAN" }, { kode: "12668", nama: "CP GUNUNG BATU" }, { kode: "12669", nama: "UPC CIAMPEA" }, { kode: "12670", nama: "UPC LEUWILIANG" }, { kode: "12671", nama: "UPC CIBATOK" }, { kode: "12673", nama: "UPC CIOMAS BARU" }, { kode: "12674", nama: "UPC DRAMAGA" }, { kode: "12675", nama: "UPC CIBANTENG 1" }, { kode: "12348", nama: "UPC PEJUANG" }, { kode: "12357", nama: "UPC UJUNG MENTENG" }, { kode: "12508", nama: "CP HARAPAN INDAH" }, { kode: "12514", nama: "UPC PURI HARAPAN" }, { kode: "12515", nama: "UPC RAWA SILEM" }, { kode: "12516", nama: "UPC BOULEVARD HIJAU" }, { kode: "13105", nama: "UPC TAMAN HARAPAN" }, { kode: "12652", nama: "UPC CEMPAKA MAS" }, { kode: "12653", nama: "UPC PASAR SERDANG" }, { kode: "12654", nama: "CP ITC CEMPAKA MAS" }, { kode: "12996", nama: "UPC SERDANG BARU" }, { kode: "13031", nama: "UPC HOWITZER" }, { kode: "12311", nama: "CP JATINEGARA" }, { kode: "12315", nama: "UPC PAL MERIAM" }, { kode: "12320", nama: "UPC OTISTA RAYA" }, { kode: "12370", nama: "UPC JENGKI" }, { kode: "12373", nama: "UPC SARTIKA" }, { kode: "12423", nama: "UPC KRAMAT ASEM" }, { kode: "12430", nama: "UPC CENDRAWASIH" }, { kode: "12527", nama: "CP JATIWARINGIN" }, { kode: "12528", nama: "UPC JATIMAKMUR" }, { kode: "12531", nama: "UPC GAMPRIT" }, { kode: "12532", nama: "UPC JATIWARINGIN RAYA" }, { kode: "12557", nama: "UPC JATI CEMPAKA" }, { kode: "12435", nama: "CP KALIMALANG" }, { kode: "12437", nama: "UPC CAMAN RAYA" }, { kode: "12442", nama: "UPC JAKA PERMAI" }, { kode: "12443", nama: "UPC KINCAN RAYA" }, { kode: "12444", nama: "UPC JATIBENING" }, { kode: "12613", nama: "UPC BINTARA JAYA" }, { kode: "12680", nama: "UPC RATNA" }, { kode: "12303", nama: "UPC UTAN KAYU" }, { kode: "12417", nama: "CP KAMPUNG AMBON" }, { kode: "12418", nama: "UPC PASAR KAMPUNG AMBON" }, { kode: "12420", nama: "UPC PRAMUKA" }, { kode: "12505", nama: "UPC TARUNA" }, { kode: "12384", nama: "CP KARAWANG" }, { kode: "12385", nama: "UPC KOSAMBI" }, { kode: "12386", nama: "UPC NAGASARI" }, { kode: "12387", nama: "UPC NIAGA" }, { kode: "12388", nama: "UPC GINTUNG KERTA" }, { kode: "12389", nama: "UPC TELUK JAMBE" }, { kode: "12391", nama: "UPC KONDANG JAYA" }, { kode: "12392", nama: "UPC PASAR BARU" }, { kode: "12393", nama: "UPC PASAR JOHAR" }, { kode: "12394", nama: "UPC PERUMNAS TELUK JAMBE" }, { kode: "12318", nama: "UPC HALIM" }, { kode: "12578", nama: "CP KEBON NANAS" }, { kode: "12581", nama: "UPC MALL BASURA" }, { kode: "12582", nama: "UPC CIPINANG MUARA" }, { kode: "12584", nama: "UPC OTISTA III" }, { kode: "12585", nama: "UPC GRIYA WARTAWAN" }, { kode: "12380", nama: "UPC PASAR BERSIH SENTUL" }, { kode: "12639", nama: "CP KEDUNGHALANG" }, { kode: "12640", nama: "UPC VILLA BOGOR INDAH" }, { kode: "12687", nama: "UPC PESONA CILEBUT" }, { kode: "12690", nama: "UPC SALABENDA" }, { kode: "12586", nama: "CP KELAPA DUA" }, { kode: "12588", nama: "UPC PASAR PAL" }, { kode: "12589", nama: "UPC KOMPLEKS TIMAH" }, { kode: "12590", nama: "UPC HANKAM" }, { kode: "12591", nama: "UPC MEKARSARI" }, { kode: "12592", nama: "UPC LAPAN" }, { kode: "12350", nama: "UPC BOJONG RAWALUMBU" }, { kode: "12631", nama: "CP KEMANG PRATAMA" }, { kode: "12632", nama: "UPC RAWALUMBU" }, { kode: "12633", nama: "UPC BANTAR GEBANG" }, { kode: "12636", nama: "UPC SEPANJANG JAYA" }, { kode: "12333", nama: "UPC KEBON KOSONG" }, { kode: "12407", nama: "CP KEMAYORAN" }, { kode: "12408", nama: "UPC CEMPAKA SARI" }, { kode: "12409", nama: "UPC CEMPAKA BARU" }, { kode: "12410", nama: "UPC BENDUNGAN JAGO" }, { kode: "12552", nama: "UPC LEGENDA WISATA" }, { kode: "12601", nama: "UPC CILEUNGSI" }, { kode: "12602", nama: "UPC CITRA INDAH" }, { kode: "12603", nama: "CP KOTA WISATA" }, { kode: "12607", nama: "UPC METLAND CILEUNGSI" }, { kode: "12634", nama: "UPC CILEUNGSI HIJAU" }, { kode: "12637", nama: "UPC CANADIAN KOTA WISATA" }, { kode: "12682", nama: "UPC BOJONG KULUR" }, { kode: "12363", nama: "CP KRAMAT JATI" }, { kode: "12364", nama: "UPC RAYA TENGAH" }, { kode: "12366", nama: "UPC KAMPUNG TENGAH" }, { kode: "12367", nama: "UPC PASAR KRAMAT JATI" }, { kode: "12368", nama: "UPC MALL CIJANTUNG" }, { kode: "12371", nama: "UPC KAMPUNG DUKUH" }, { kode: "12583", nama: "UPC PGC CILILITAN" }, { kode: "12702", nama: "UPC CONDET" }, { kode: "12707", nama: "UPC BALE KAMBANG" }, { kode: "12464", nama: "UPC CIKEAS" }, { kode: "12553", nama: "UPC CITRA GRAND" }, { kode: "12554", nama: "UPC SETU CIPAYUNG" }, { kode: "12600", nama: "CP KRANGGAN" }, { kode: "12604", nama: "UPC PASAR KRANGGAN" }, { kode: "12605", nama: "UPC UJUNG ASPAL" }, { kode: "12606", nama: "UPC PLAZA CIBUBUR" }, { kode: "12608", nama: "UPC LEUWINANGGUNG" }, { kode: "12440", nama: "UPC PATRIOT KP DUA" }, { kode: "12609", nama: "CP KRANJI" }, { kode: "12611", nama: "UPC BINTARA RAYA" }, { kode: "12612", nama: "UPC JAYAKARTA" }, { kode: "12614", nama: "UPC SUMMARECON" }, { kode: "12517", nama: "CP PANCORAN MAS" }, { kode: "12518", nama: "UPC GANDUL" }, { kode: "12519", nama: "UPC BEJI" }, { kode: "12520", nama: "UPC CINERE" }, { kode: "12523", nama: "UPC MARGO CITY" }, { kode: "12617", nama: "UPC SAWANGAN" }, { kode: "12622", nama: "UPC RAYA PITARA" }, { kode: "12624", nama: "UPC GROGOL SAWANGAN" }, { kode: "12828", nama: "UPC PANGKALAN JATI" }, { kode: "12332", nama: "CP PASAR BARU" }, { kode: "12335", nama: "UPC KARANGANYAR" }, { kode: "12901", nama: "UPC APRON" }, { kode: "12997", nama: "UPC A RAYA" }, { kode: "12490", nama: "CP PASAR MAWAR" }, { kode: "12491", nama: "UPC SAWOJAJAR" }, { kode: "12493", nama: "UPC CEMPALA" }, { kode: "12672", nama: "UPC YASMIN" }, { kode: "12308", nama: "UPC POS CIKINI" }, { kode: "12321", nama: "CP PASAR SENEN" }, { kode: "12322", nama: "UPC KWITANG" }, { kode: "12324", nama: "UPC BUNGUR" }, { kode: "12325", nama: "UPC KRAMAT SENTIONG" }, { kode: "12330", nama: "UPC ATRIUM SENEN" }, { kode: "12331", nama: "UPC GONDANGDIA" }, { kode: "12594", nama: "CP PEKAYON" }, { kode: "12595", nama: "UPC VILA NUSA INDAH" }, { kode: "12597", nama: "UPC JATILUHUR" }, { kode: "12598", nama: "UPC PASAR VILA NUSA INDAH" }, { kode: "12599", nama: "UPC KODAU" }, { kode: "12678", nama: "UPC WIBAWA MUKTI" }, { kode: "12352", nama: "CP PENGGILINGAN" }, { kode: "12353", nama: "UPC PERUMNAS KLENDER" }, { kode: "12354", nama: "UPC PULOGEBANG" }, { kode: "12355", nama: "UPC KOMPLEK PIK" }, { kode: "12359", nama: "UPC RAWA KUNING" }, { kode: "13097", nama: "UPC CAKUNG" }, { kode: "13101", nama: "UPC KAMPUNG BULAK" }, { kode: "12293", nama: "CP PETAMBURAN" }, { kode: "12294", nama: "UPC GANG LONTAR" }, { kode: "12297", nama: "UPC BLOK B TANAH ABANG" }, { kode: "12835", nama: "UPC BIAK" }, { kode: "12365", nama: "UPC TAMINI SQUARE" }, { kode: "12427", nama: "UPC PINANG RANTI" }, { kode: "12431", nama: "CP PLAZA PONDOK GEDE" }, { kode: "12530", nama: "UPC LUBANG BUAYA" }, { kode: "12555", nama: "CP PONDOK BAMBU" }, { kode: "12556", nama: "UPC PASAR INPRES PONDOK BAMBU" }, { kode: "12558", nama: "UPC MALL PD BAMBU SPOT" }, { kode: "12561", nama: "UPC PANGKALAN JATI" }, { kode: "12575", nama: "UPC RADIN INTEN" }, { kode: "12644", nama: "CP PONDOK KELAPA" }, { kode: "12645", nama: "UPC CURUG PONDOK KELAPA" }, { kode: "12646", nama: "UPC PONDOK KOPI" }, { kode: "12647", nama: "UPC HAJI NAMAN" }, { kode: "12651", nama: "UPC PONDOK KELAPA UTARA" }, { kode: "12425", nama: "CP PONDOK MELATI" }, { kode: "12428", nama: "UPC PASAR KECAPI" }, { kode: "12429", nama: "UPC RAYA BOJONG" }, { kode: "12434", nama: "UPC JATIWARNA" }, { kode: "12529", nama: "UPC JATIMAKMUR 2" }, { kode: "12344", nama: "UPC MARRAKASH" }, { kode: "12483", nama: "UPC SEROJA" }, { kode: "12507", nama: "CP PONDOK UNGU" }, { kode: "12509", nama: "UPC HARAPAN BARU" }, { kode: "12511", nama: "UPC KALIABANG PAKU" }, { kode: "12512", nama: "UPC HARAPAN JAYA" }, { kode: "13104", nama: "UPC UNGU PERMAI" }, { kode: "12314", nama: "UPC CIPINANG BARU" }, { kode: "12419", nama: "UPC JATINEGARA" }, { kode: "12498", nama: "CP RAWAMANGUN" }, { kode: "12501", nama: "UPC PASAR RAWAMANGUN" }, { kode: "12502", nama: "UPC LAYUR" }, { kode: "12506", nama: "UPC BALAI PUSTAKA" }, { kode: "12574", nama: "UPC PAHLAWAN REVOLUSI" }, { kode: "12390", nama: "UPC LAMARAN" }, { kode: "12413", nama: "CP RENGAS DENGKLOK" }, { kode: "12414", nama: "UPC TELAGASARI" }, { kode: "12415", nama: "UPC CIBUAYA" }, { kode: "12416", nama: "UPC KEDUNG WARINGIN" }, { kode: "12300", nama: "CP SALEMBA" }, { kode: "12301", nama: "UPC PASAR JANGKRIK II" }, { kode: "12302", nama: "UPC PASAR JOHAR" }, { kode: "12305", nama: "UPC TAMBAK" }, { kode: "12306", nama: "UPC PASAR GENJING" }, { kode: "12309", nama: "UPC MATRAMAN" }, { kode: "12310", nama: "UPC SABANG" }, { kode: "12323", nama: "UPC CIKINI" }, { kode: "12659", nama: "CP SETIA MEKAR" }, { kode: "12660", nama: "UPC VILA MUTIARA GADING" }, { kode: "12661", nama: "UPC DUREN JAYA" }, { kode: "12663", nama: "UPC BUMI SANI" }, { kode: "12665", nama: "UPC TABRANI" }, { kode: "12666", nama: "UPC AGUS SALIM" }, { kode: "12304", nama: "UPC SARINAH" }, { kode: "12533", nama: "CP SUDIRMAN" }, { kode: "12535", nama: "UPC THAMRIN CITY" }, { kode: "12536", nama: "UPC DANAU TOBA" }, { kode: "12445", nama: "CP TAMBUN" }, { kode: "12446", nama: "UPC PASAR MANGUN JAYA" }, { kode: "12449", nama: "UPC PASAR INDUK CIBITUNG" }, { kode: "12450", nama: "UPC GRAMAPURI" }, { kode: "12453", nama: "UPC PASAR KOMPAS" }, { kode: "12454", nama: "UPC PASAR PAMOR" }, { kode: "12455", nama: "UPC JEJALEN" }, { kode: "12456", nama: "UPC PASAR SETU" }, { kode: "12662", nama: "UPC PAPAN MAS" }, { kode: "12664", nama: "UPC TRIDAYA" }, { kode: "12382", nama: "UPC TEGAL LEGA" }, { kode: "12562", nama: "CP WARUNG JAMBU" }, { kode: "12563", nama: "UPC INDRAPRASTA" }, { kode: "12565", nama: "UPC SUDIRMAN BOGOR" }, { kode: "12569", nama: "UPC BANGBARU 1 WARU" }, { kode: "60146", nama: "CPS BOGOR BARU" }, { kode: "60147", nama: "UPS SEMPLAK" }, { kode: "60148", nama: "UPS BOJONG GEDE" }, { kode: "60149", nama: "UPS BANTAR KEMANG" }, { kode: "60150", nama: "UPS BUBULAK" }, { kode: "60151", nama: "UPS PAHLAWAN" }, { kode: "60152", nama: "UPS SUKAHATI INDAH" }, { kode: "60153", nama: "UPS BUKIT CIMANGGU" }, { kode: "60831", nama: "UPS CIBINONG MANSION" }, { kode: "60832", nama: "UPS GRAHA POS" }, { kode: "60120", nama: "CPS DEWI SARTIKA" }, { kode: "60122", nama: "UPS CILILITAN BESAR" }, { kode: "60123", nama: "UPS PASAR INDUK CLUSTER" }, { kode: "60124", nama: "UPS BATU AMPAR" }, { kode: "60125", nama: "UPS CIPAYUNG" }, { kode: "60126", nama: "UPS EMPAT DELAPAN" }, { kode: "60127", nama: "UPS TANAH MERDEKA" }, { kode: "60128", nama: "UPS EMBRIO" }, { kode: "60823", nama: "UPS CIPINANG ELOK" }, { kode: "60160", nama: "CPS ISLAMIC CENTRE" }, { kode: "60161", nama: "UPS KARTINI" }, { kode: "60163", nama: "UPS BANTAR GEBANG" }, { kode: "60164", nama: "UPS GRAND GALAXY" }, { kode: "60167", nama: "UPS ALAMANDA" }, { kode: "60139", nama: "CPS KRAMAT RAYA" }, { kode: "60140", nama: "UPS PSJAYA CEMPAKA PUTIH" }, { kode: "60141", nama: "UPS PASAR DJOHAR BARU" }, { kode: "60142", nama: "UPS MEDITERANIA" }, { kode: "60143", nama: "UPS KALIBARU" }, { kode: "60144", nama: "UPS PERCETAKAN NEGARA" }, { kode: "60145", nama: "UPS KAYU JATI RAWA BENING" }, { kode: "60822", nama: "UPS TAMAN SOLO GAJAH MADA" }, { kode: "60825", nama: "UPS KAYU MANIS" }, { kode: "60826", nama: "UPS PISANGAN LAMA" }, { kode: "60129", nama: "CPS MARGONDA" }, { kode: "60131", nama: "UPS DEPOK TIMUR" }, { kode: "60132", nama: "UPS PURI ANGGREK MAS" }, { kode: "60133", nama: "UPS PONDOK DUTA" }, { kode: "60134", nama: "UPS GRAND DEPOK CITY" }, { kode: "60135", nama: "UPS NUSANTARA" }, { kode: "60136", nama: "UPS SENTOSA" }, { kode: "60138", nama: "UPS DETOS" }, { kode: "60623", nama: "UPS CINERE RAYA" }, { kode: "60834", nama: "UPS HARJAMUKTI" }, { kode: "60931", nama: "UPS LAPANGAN TEMBAK" }, { kode: "60169", nama: "CPS METRO BOULEVARD CIKARANG" }, { kode: "60170", nama: "UPS GRAHA MAS" }, { kode: "60171", nama: "UPS SENTOSA" }, { kode: "60828", nama: "UPS TUPAREV KARAWANG" }, { kode: "60829", nama: "UPS SYARIAH JOHAR" }, { kode: "60830", nama: "UPS GALUH MAS" }, { kode: "60162", nama: "UPS BTC" }, { kode: "60165", nama: "CPS PLAZA THB" }, { kode: "60166", nama: "UPS PERJUANGAN BARU" },
    { kode: "-", nama: "KANTOR AREA BEKASI" }, { kode: "-", nama: "DEPUTY BISNIS AREA BOGOR" }, { kode: "-", nama: "DEPUTY BISNIS AREA JATIWARINGIN" }, { kode: "-", nama: "DEPUTY BISNIS AREA KRAMAT JATI" }, { kode: "-", nama: "DEPUTY BISNIS AREA SENEN" }, { kode: "-", nama: "DEP. BISNIS KANWIL VIII JAKARTA" }, { kode: "-", nama: "DEP. KEUANGAN KANWIL VIII JAKARTA" }, { kode: "-", nama: "DEP. LOGISTIK KANWIL VIII JAKARTA" }, { kode: "-", nama: "DEP. SDM KANWIL VIII JAKARTA 1" }, { kode: "-", nama: "DEP. MANAJEMEN RISIKO KANWIL VIII JAKARTA" }, { kode: "-", nama: "INSPEKTUR WILAYAH JAKARTA VIII" }, { kode: "-", nama: "SEKRETARIS DEPUTY OPERASIONAL" }, { kode: "-", nama: "SEKRETARIS PEMIMPIN WILAYAH" }, { kode: "-", nama: "DEPUTY BISNIS AREA BEKASI" }, { kode: "-", nama: "PEMERIKSA JAKARTA D" }, { kode: "-", nama: "PEMIMPIN WILAYAH KANWIL VIII" }, { kode: "-", nama: "PEMERIKSA JAKARTA A" }, { kode: "-", nama: "KEPALA DEPARTEMEN BISNIS SUPPORT" }, { kode: "-", nama: "KEPALA DEPARTEMEN SDM" }, { kode: "-", nama: "DEPARTEMEN MANAJEMEN RISIKO" }, { kode: "-", nama: "KOPERASI BUDI SETIA" }, { kode: "-", nama: "PT. ERA PERMATA SEJAHTERA" }, { kode: "-", nama: "PT. PESONNA OPTIMA JASA" }, { kode: "-", nama: "DEPUTY OPERASIONAL" }, { kode: "-", nama: "GUDANG KEBON NANAS" }, { kode: "-", nama: "KEPALA DEPARTEMEN LOGISTIK & UMUM" }, { kode: "-", nama: "KEPALA DEPARTEMEN KEUANGAN" }, { kode: "-", nama: "KEPALA DEPARTEMEN MANAJEMEN RISIKO" }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      
      {/* TABS SELECTION */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-2">
        <button
          onClick={() => setActiveTab("barang")}
          className={`flex-1 min-w-[150px] py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "barang" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Box className="w-4 h-4" /> Master Barang
        </button>
        <button
          onClick={() => setActiveTab("outlet")}
          className={`flex-1 min-w-[150px] py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "outlet" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Building2 className="w-4 h-4" /> Master Outlet / Instansi
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW: MASTER BARANG */}
      {/* ========================================================================= */}
      {activeTab === "barang" && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Form Tambah Barang */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">Tambah Master Barang</h3>
              </div>
            </div>
            <form id="formAdmin" onSubmit={handleAddInventory} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang *</label>
                  <input name="nama" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Laptop Lenovo..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Awal</label>
                  <input name="stok" type="number" defaultValue="0" min="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Satuan</label>
                  <select name="satuan" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Pcs">Pcs</option><option value="Unit">Unit</option><option value="Box">Box</option><option value="Set">Set</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Vendor (Jika Ada)</label>
                  <input name="vendor_nama" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PT Era Permata..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. SPK</label>
                  <input name="no_spk" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2363/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. PKS</label>
                  <input name="no_pks" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2364/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tgl Mulai Sewa</label>
                  <input name="tanggal_mulai" type="date" onChange={calculateMonths} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tgl Selesai Sewa</label>
                  <input name="tanggal_selesai" type="date" onChange={calculateMonths} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Masa Sewa (Bulan)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input name="masa_sewa_bulan" type="number" min="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Otomatis..." />
                    <button type="submit" className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                      <Plus className="w-5 h-5" /> Simpan Data
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Tabel Barang */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg text-gray-800">Ketersediaan Stok Barang</h3>
              <div className="flex w-full lg:w-auto gap-3 items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  <input type="text" placeholder="Cari barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">Total: {filteredInventory.length} Item</div>
              </div>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left min-w-[1250px]">
                <thead>
                  <tr className="border-b-2 text-gray-500 text-sm">
                    <th className="pb-4 w-12 text-center">No</th>
                    <th className="pb-4"><Box className="w-4 h-4 inline mr-2"/> Nama Barang</th>
                    <th className="pb-4"><Hash className="w-4 h-4 inline mr-2"/> Stok</th>
                    <th className="pb-4"><Scale className="w-4 h-4 inline mr-2"/> Satuan</th>
                    <th className="pb-4"><Building2 className="w-4 h-4 inline mr-2"/> Vendor & Kontrak</th>
                    <th className="pb-4"><CalendarDays className="w-4 h-4 inline mr-2"/> Tgl Mulai</th>
                    <th className="pb-4"><CalendarDays className="w-4 h-4 inline mr-2"/> Tgl Selesai</th>
                    <th className="pb-4 text-center"><Clock className="w-4 h-4 inline mr-2"/> Durasi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredInventory.map((inv, index) => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                      <td className="py-4 text-center text-sm">{index + 1}</td>
                      <td className="py-4 font-medium">{inv.nama}</td>
                      <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.stok <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{inv.stok}</span></td>
                      <td className="py-4 text-sm">{inv.satuan}</td>
                      <td className="py-4 text-sm">{inv.vendor_nama ? <div><p className="font-medium text-blue-700">{inv.vendor_nama}</p><p className="text-xs text-gray-500">SPK: {inv.no_spk || '-'}</p></div> : '-'}</td>
                      <td className="py-4 text-sm">{formatDate(inv.tanggal_mulai)}</td>
                      <td className="py-4 text-sm">{formatDate(inv.tanggal_selesai)}</td>
                      <td className="py-4 text-center text-sm">{inv.masa_sewa_bulan ? `${inv.masa_sewa_bulan} Bln` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: MASTER OUTLET / INSTANSI */}
      {/* ========================================================================= */}
      {activeTab === "outlet" && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Form Tambah Outlet */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2.5 rounded-xl">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">Tambah Outlet / Instansi</h3>
                </div>
              </div>
              
              {/* TOMBOL RAHASIA UNTUK BULK IMPORT */}
              {(!outlets || outlets.length === 0) && (
                <button
                  type="button"
                  onClick={() => handleBulkImportOutlets(rawOutletsData)}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <DownloadCloud className="w-4 h-4" /> Import Data Bawaan (Otomatis)
                </button>
              )}
            </div>

            <form onSubmit={handleAddOutlet} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Outlet (Opsional)</label>
                <input name="kode" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Misal: 12447" />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Outlet / Instansi *</label>
                <input name="nama" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="UPC TAMAN RAFLESIA..." />
              </div>
              <button type="submit" className="w-full sm:w-auto px-8 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                <Plus className="w-5 h-5" /> Tambah
              </button>
            </form>
          </div>

          {/* Tabel Outlet */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg text-gray-800">Daftar Instansi Terdaftar</h3>
              <div className="flex w-full lg:w-auto gap-3 items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  <input type="text" placeholder="Cari nama atau kode..." value={searchOutletQuery} onChange={(e) => setSearchOutletQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">Total: {filteredOutlets.length}</div>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[600px] p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 text-gray-500 text-sm sticky top-0 bg-white">
                    <th className="pb-4 w-16 text-center">No</th>
                    <th className="pb-4 w-48">Kode Outlet</th>
                    <th className="pb-4">Nama Outlet / Instansi / Kantor</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredOutlets.length === 0 ? (
                    <tr><td colSpan="3" className="py-12 text-center text-gray-400">Belum ada data instansi.</td></tr>
                  ) : (
                    filteredOutlets.map((out, index) => (
                      <tr key={out.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                        <td className="py-3 text-center text-sm text-gray-400">{index + 1}</td>
                        <td className="py-3 font-mono text-sm text-gray-600">{out.kode || "-"}</td>
                        <td className="py-3 font-medium text-gray-800">{out.nama}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}