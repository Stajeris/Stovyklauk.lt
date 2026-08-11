import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  User, 
  Home, 
  Trees, 
  Flame, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Volume2
} from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';

export const RulesDownloadPage: React.FC = () => {
  const { setView } = useCampsites();
  const [activeTab, setActiveTab] = useState<'all' | 'host' | 'client'>('all');

  const handleDownloadTxt = (type: 'host' | 'client' | 'all') => {
    let title = 'Campy.lt_Oficialios_Taisyklės.txt';
    let content = '';

    const headerText = `
===================================================================
                  CAMPY.LT - PLATFORMOS TAISYKLĖS
         Privačių stovyklaviečių ir nakvynių gamtoje tinklas
===================================================================
Data: ${new Date().toLocaleDateString('lt-LT')}
Svetainė: https://campy.lt
El. paštas: pagalba@campy.lt
-------------------------------------------------------------------
`;

    const hostRulesText = `
-------------------------------------------------------------------
I. ŠEIMININKŲ (HOSTS) TAISYKLĖS IR STANDARTAI
-------------------------------------------------------------------
1. SKLYPO IR STOVYKLAVIETĖS PATIKRINIMAS IR APRAŠYMAS
   1.1. Šeimininkas įsipareigoja pateikti tikslią ir teisingą informaciją apie savo sklypą (koordinatės, privažiavimas, vandens šaltiniai, infrastruktūra).
   1.2. Nuotraukos privalo atspindėti reomenduojamo sklypo esamą būklę. Draudžiama pateikti klaidinančią informaciją.

2. KALENDORIŲ SINCHRONIZAVIMAS (iCal)
   2.1. Šeimininkas privalo naudoti Campy.lt iCal sinchronizavimo nuorodą su kitomis platformomis (npz. Airbnb, Booking.com), kad būtų išvengta dvigubų rezervacijų.
   2.2. Jei sklypas užimtas asmeniniams poreikiams, datos privalo būti nedelsiant užblokuotos Campy.lt kalendoriuje.

3. SVEČIŲ PASITIKIMAS IR SAUGUMAS
   3.1. Šeimininkas privalo užtikrinti saugų ir aiškų atvykimą (pateikti atvykimo instrukcijas bei kontaktinį telefoną).
   3.2. Priešgaisrinė saugumas: Jei sklype leidžiama kūrenti laužą, šeimininkas privalo įrengti saugią laužavietę bei pasirūpinti pirminėmis ugnies gesinimo priemonėmis (vandens talpa arba smėlis).

4. MOKESČIAI IR REZERVACIJOS
   4.1. Campy.lt taiko 0% komisinį mokestį šeimininkams pradiniu platformos veiklos laikotarpiu.
   4.2. Šeimininkas neturi teisės reikalauti papildomų neatskleistų mokesčių iš svečių atvykimo vietoje.

5. ATŠAUKIMO POLITIKA
   5.1. Šeimininkas pasirenka vieną iš platformos atšaukimo politikų (Lanksti, Vidutinė, Griežta) ir privalo jos laikytis.
`;

    const clientRulesText = `
-------------------------------------------------------------------
II. SVEČIŲ / POILSIAUTOJU (CLIENTS / GUESTS) TAISYKLĖS
-------------------------------------------------------------------
1. GAMTOSAUGA IR "PALIK TIK PĖDSAKUS" (LEAVE NO TRACE)
   1.1. Svečias privalo išsivežti visas savo šiukšles ir atliekas, nepaliekant nieko sklype, nebent šeimininkas yra įrengęs specialius konteinerius.
   1.2. Draudžiama žaloti medžius, laužyti šakas, teršti vandens telkinius ar trikdyti laukinius gyvūnus.

2. TRIUKŠMO VALANDOS IR RAMYBĖS LAIKAS
   2.1. Ramybės laikas sklype galioja nuo 22:00 iki 08:00 val.
   2.2. Garsi muzika ir triukšmingi vakarėliai yra griežtai draudžiami, siekiant išsaugoti natūralią ramybę ir gerbti vietos kaimynus.

3. LAUŽAVIETĖS IR ELEKTROS/DUJŲ ĮRANGA
   3.1. Laužus kūrenti galima TIK tam skirtose, šeimininko pažymėtose vietose.
   3.2. Ugnies negalima palikti be priežiūros. Prieš einant miegoti ar išvykstant, laužas privalo būti visiškai užgesintas vandeniu.

4. REZERVAS IR SVEČIŲ SKAIČIUS
   4.1. Sklype gali apsistoti TIK rezervacijoje nurodytas žmonių ir transporto priemonių skaičius.
   4.2. Jeigu atvyksta augintiniai (jei tai leistina pagal sklypo taisykles), jie privalo būti nuolatinėje priežiūroje.

5. ATVYKIMO IR IŠVYKIMO LAIKAS
   5.1. Svečias privalo laikytis suderinto atvykimo ir išvykimo laiko.
   5.2. Paliekant sklypą, vieta turi būti sutvarkyta ir palikta tokia, kokia buvo atvykus.
`;

    if (type === 'host') {
      title = 'Campy.lt_Šeimininkų_Taisyklės.txt';
      content = headerText + hostRulesText;
    } else if (type === 'client') {
      title = 'Campy.lt_Svečių_Taisyklės.txt';
      content = headerText + clientRulesText;
    } else {
      title = 'Campy.lt_Oficialus_Taisyklynas.txt';
      content = headerText + hostRulesText + clientRulesText;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 font-sans print:p-0 print:bg-white">
      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-stone-600 hover:text-emerald-800 font-bold text-xs transition cursor-pointer bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Grįžti į Pagrindinį</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleDownloadTxt('host')}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Atsisiųsti Šeimininkams (.txt)</span>
          </button>
          <button
            onClick={() => handleDownloadTxt('client')}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Atsisiųsti Svečiams (.txt)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Spausdinti / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-12 space-y-10 print:shadow-none print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b border-stone-200 pb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Oficialus Campy.lt Dokumentas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Campy.lt Naudojimosi ir Saugumo Taisyklės
          </h1>
          <p className="text-stone-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Šis dokumentas apibrėžia privalomus saugumo, aplinkosaugos ir elgsenos standartus, galiojančius visiems privačių sklypų šeimininkams bei poilsiautojams Lietuvoje.
          </p>
          <div className="text-xs text-stone-400 pt-2 font-mono">
            Atnaujinta: 2026 m. rugpjūčio mėn. | Versija 1.4 | Campy.lt
          </div>
        </div>

        {/* Tab Filters for Interactive Reading */}
        <div className="flex items-center justify-center gap-2 print:hidden">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Visi Reikalavimai
          </button>
          <button
            onClick={() => setActiveTab('host')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'host'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Šeimininkų Taisyklės</span>
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'client'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Svečių Taisyklės</span>
          </button>
        </div>

        {/* SECTION 1: ŠEIMININKŲ TAISYKLĖS */}
        {(activeTab === 'all' || activeTab === 'host') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 font-display">I. Šeimininkų (Host Site) Taisyklės</h2>
                <p className="text-xs text-stone-500">Privalomi reikalavimai sklypų, glampingų ir kemperių aikštelių savininkams</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>1. Sklypo Saugumas ir Duomenys</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Šeimininkas privalo pateikti tikslią informaciją apie sklypo ribas, privažiavimo kelio būklę, geriamo vandens buvimą ir tualeto infrastruktūrą. Nuotraukos turi atspindėti esamą būklę.
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>2. Kalendorių Sinchronizavimas (iCal)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Būtina laiku sinchronizuoti Campy.lt kalendorių su kitomis platformomis (npz. Airbnb ar Booking.com) naudojant iCal nuorodą, kad išvengtumėte dvigubų rezervacijų.
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>3. Priešgaisrinė Saugumas</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Jei sklype leidžiama kūrenti laužą, šeimininkas privalo įrengti saugią laužavietę su akmenų/metalo apvadu ir užtikrinti gesinimo priemones (vandens talpą ar smėlį).
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>4. Skaidrūs Mokesčiai</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Campy.lt taiko 0% komisinį mokestį šeimininkams paleidimo laikotarpiu. Šeimininkas neturi teisės reikalauti jokių neatskleistų papildomų mokesčių iš svečių atvykus.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* SECTION 2: SVEČIŲ TAISYKLĖS */}
        {(activeTab === 'all' || activeTab === 'client') && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 font-display">II. Svečių ir Poilsiautojų (Client Site) Taisyklės</h2>
                <p className="text-xs text-stone-500">Privalomos elgesio taisykles visiems Campy.lt lankytojams ir rezervacijų turėtojams</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Trees className="w-4 h-4 text-emerald-600" />
                  <span>1. "Palik Tik Pėdsakus" (Leave No Trace)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Visi svečiai privalo susirinkti ir išsivežti savo šiukšles. Gamtos teršimas ar plastiko palikimas laukinėse stovyklavietėse gresia paskyros užblokavimu.
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>2. Ramybės Laikas (22:00 - 08:00)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Saugokite gamtos ir kaimynų ramybę. Garsi muzika, triukšmingi vakarėliai ar garso kolonėlės vėlyvu metu privačiuose sklypuose yra draudžiami.
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>3. Atsakingas Laužų Kūrenimas</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Ugnį galima kūrenti tik pažymėtose laužavietėse. Nepalikite degančio laužo be priežiūros ir išvykdami įsitikinkite, kad ugnis visiškai užgesinta.
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Clock className="w-4 h-4 text-stone-700" />
                  <span>4. Atvykimas ir Išvykimas</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Laikykitės suderintų valandų. Išvykdami palikite sklypą ir įrangą tvarkingą, atsiųskite atvykimo / išvykimo patvirtinimą Campy.lt platformoje.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* Download Footer Banner inside Document */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Atsisiųskite arba Spausdinkite Taisyklės</h3>
              <p className="text-xs text-emerald-200">
                Šias taisykles galite išsaugoti tekstiniu formatu (.txt) arba išsispausdinti kaip oficialią Campy.lt sutarties atmintinę.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDownloadTxt('all')}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Atsisiųsti Pilną Taisyklyną (.txt)</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
