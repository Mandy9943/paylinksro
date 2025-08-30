import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții • PayLinks",
  description:
    "Termeni și condiții, Politica de confidențialitate și Anexa privind prelucrarea datelor pentru comercianți PayLinks.",
};

export default function TermsAndPrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <article className="space-y-10">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            TERMENI ȘI CONDIȚII
          </h1>
          <p className="text-sm text-gray-500">
            Data intrării în vigoare: 31.08.2025
          </p>

          <h2 className="text-xl font-semibold">1. Cine suntem</h2>
          <p>
            PayLinks este platforma care permite comercianților și creatorilor
            să încaseze online prin linkuri de plată. Email suport{" "}
            <a
              className="text-blue-600 underline"
              href="mailto:salut@paylinks.ro"
            >
              salut@paylinks.ro
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold">2. Acceptarea termenilor</h2>
          <p>
            Prin crearea contului sau folosirea platformei confirmi că ai citit
            și accepți acești Termeni și Politica de confidențialitate. Dacă
            reprezinți o entitate, declari că ai autoritatea de a o angaja.
          </p>

          <h2 className="text-xl font-semibold">3. Definiții</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Platforma PayLinks înseamnă site-ul{" "}
              <a
                className="text-blue-600 underline"
                href="https://paylinks.ro"
                target="_blank"
                rel="noopener noreferrer"
              >
                paylinks.ro
              </a>{" "}
              și aplicațiile sale.
            </li>
            <li>Utilizator înseamnă orice persoană care își creează cont.</li>
            <li>
              Comerciant înseamnă utilizatorul care creează linkuri de plată și
              încasează.
            </li>
            <li>
              Plătitor înseamnă clientul care achită printr-un link de plată.
            </li>
            <li>
              Link de plată înseamnă adresa unică generată în platformă pentru a
              încasa o sumă pentru bunuri sau servicii.
            </li>
            <li>
              Procesator de plăți înseamnă furnizorul terț care autorizează și
              decontează tranzacțiile.
            </li>
            <li>
              Comisioane înseamnă sumele datorate de comerciant PayLinks pentru
              folosirea serviciului.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">4. Natura serviciului</h2>
          <p>
            PayLinks furnizează instrumente digitale pentru inițierea plăților.
            PayLinks nu este bancă, nu ține fonduri ale clienților, nu acordă
            credite. Plățile sunt procesate de Stripe, Inc. în baza regulilor
            sale. Relația comercială pentru bunuri sau servicii este exclusiv
            între comerciant și plătitor.
          </p>

          <h2 className="text-xl font-semibold">5. Eligibilitate și cont</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Vârsta minimă este optsprezece ani.</li>
            <li>
              Pentru comercianți se pot cere verificări KYC și documente de
              identitate, firmă, beneficiari reali.
            </li>
            <li>
              Ești responsabil de confidențialitatea datelor de autentificare și
              de toate acțiunile din cont.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            6. Crearea linkurilor de plată
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Poți genera linkuri de plată pentru produse, servicii, donații sau
              subscripții dacă sunt legale.
            </li>
            <li>
              Trebuie să afișezi clar prețul, descrierea, politica de livrare și
              politica de retur/rambursare.
            </li>
            <li>
              PayLinks poate limita, suspenda sau refuza linkuri care prezintă
              risc sau încalcă aceste reguli.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">7. Activități interzise</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Vânzări ilicite sau care necesită autorizări pe care nu le deții.
            </li>
            <li>
              Fraude, spălare a banilor, finanțarea terorismului, încălcarea
              drepturilor de autor sau a mărcilor.
            </li>
            <li>
              Colectarea de date ale plătitorilor în afara câmpurilor permise.
            </li>
            <li>
              Interferențe tehnice cu platforma sau încercări de acces
              neautorizat.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">8. Comisioane și plăți</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Comisioanele PayLinks și comisioanele procesatorului se afișează
              în cont înainte de publicarea linkului.
            </li>
            <li>
              Sumele încasate sunt decontate în contul tău bancar de către
              procesator conform propriilor cicluri de plată.
            </li>
            <li>
              Comisioanele se rețin automat din tranzacții sau se facturează
              periodic, după caz.
            </li>
            <li>
              Ești responsabil pentru taxe și impozite aferente încasărilor.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            9. Rambursări, retrageri, chargeback
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Politica de retur și rambursare aparține comerciantului și trebuie
              comunicată clar plătitorului.
            </li>
            <li>
              În caz de chargeback, procesatorul decide conform propriilor
              reguli. Poți fi debitat pentru sume returnate și comisioanele
              aferente.
            </li>
            <li>
              PayLinks poate furniza dovezi tehnice, dar nu garantează
              rezultatul unei dispute.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            10. Instrumente de creștere și conținut
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Poți folosi generatoare de reclame, șabloane, widget-uri și
              analitice oferite de platformă.
            </li>
            <li>
              Ești titularul conținutului tău, dar acorzi PayLinks o licență
              neexclusivă pentru operarea și afișarea lui în platformă.
            </li>
            <li>
              Nu încărca conținut care încalcă legea sau drepturile altora.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            11. Disponibilitate și actualizări
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Platforma poate avea întreruperi planificate sau neplanificate.
            </li>
            <li>
              PayLinks poate modifica sau retrage funcționalități, cu notificare
              rezonabilă atunci când este posibil.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">12. Garanții și răspundere</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Serviciul este furnizat ca atare.</li>
            <li>
              În măsura permisă de lege, răspunderea totală a PayLinks față de
              utilizatori pentru orice pretenții legate de acești Termeni sau de
              platformă este limitată la totalul comisioanelor plătite către
              PayLinks în ultimele trei luni anterioare evenimentului reclamant.
            </li>
            <li>
              Nicio parte nu răspunde pentru pierderi indirecte, de oportunitate
              sau reputaționale.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            13. Conformitate și verificări
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Putem efectua verificări suplimentare la cererea procesatorilor
              sau a autorităților.
            </li>
            <li>
              Putem bloca temporar conturi sau linkuri în suspiciuni de fraudă
              sau încălcări legale.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">14. Încetare</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Poți închide contul oricând, cu achitarea sumelor datorate.</li>
            <li>
              PayLinks poate suspenda sau închide conturi în caz de încălcare a
              termenilor sau risc ridicat.
            </li>
            <li>
              Secțiunile privind răspunderea, proprietatea intelectuală,
              dispute, protecția datelor și confidențialitatea supraviețuiesc
              încetării.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            15. Legea aplicabilă și jurisdicția
          </h2>
          <p>Acești Termeni sunt guvernați de legea română.</p>

          <h2 className="text-xl font-semibold">16. Modificări</h2>
          <p>
            Putem actualiza Termenii. Vom publica varianta actualizată și vom
            indica data intrării în vigoare. Continuarea utilizării înseamnă
            acceptare.
          </p>

          <h2 className="text-xl font-semibold">17. Protecția datelor</h2>
          <p>
            Prelucrarea datelor are loc conform Politicii de confidențialitate.
            Pentru comercianți punem la dispoziție Anexa privind prelucrarea
            datelor, la cerere.
          </p>

          <h2 className="text-xl font-semibold">18. Contact</h2>
          <p>
            Întrebări și notificări la{" "}
            <a
              className="text-blue-600 underline"
              href="mailto:salut@paylinks.ro"
            >
              salut@paylinks.ro
            </a>{" "}
            sau la adresa poștală din secțiunea Cine suntem.
          </p>
        </section>

        <hr className="border-gray-200" />

        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            POLITICA DE CONFIDENȚIALITATE PAYLINKS
          </h1>
          <p className="text-sm text-gray-500">
            Data intrării în vigoare: 31.08.2025
          </p>

          <h2 className="text-xl font-semibold">1. Cine controlează datele</h2>
          <p>
            Dacă folosești PayLinks ca comerciant, în raport cu datele
            plătitorilor putem acționa ca persoană împuternicită pentru anumite
            operațiuni tehnice, iar ca operator independent pentru datele tale
            de cont, facturare, securitate și marketing.
          </p>

          <h2 className="text-xl font-semibold">2. Ce date colectăm</h2>
          <div className="space-y-2">
            <p className="font-medium">• Date de cont ale comercianților</p>
            <p>
              nume, prenume, denumire firmă, CUI, adresă, telefon, email, IBAN,
              reprezentanți, documente KYC.
            </p>
            <p className="font-medium">• Date operaționale</p>
            <p>
              titlu link de plată, descriere, preț, monedă, status tranzacție,
              număr de referință, rapoarte.
            </p>
            <p className="font-medium">• Date ale plătitorilor</p>
            <p>
              nume, email, adresă de livrare sau facturare, sume plătite, status
              plată. Datele de card sunt colectate și stocate de procesatorul de
              plăți, nu de PayLinks.
            </p>
            <p className="font-medium">• Date tehnice</p>
            <p>
              adresă IP, tip dispozitiv, sistem de operare, identificatori de
              sesiune, jurnale de acces.
            </p>
            <p className="font-medium">• Cookies și tehnologii similare</p>
            <p>
              necesare pentru funcționare, analitice și opțional de marketing.
            </p>
          </div>

          <h2 className="text-xl font-semibold">3. Scopuri și temeiuri</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <span className="font-medium">Furnizarea serviciului</span> —
              executarea contractului cu utilizatorul.
            </li>
            <li>
              <span className="font-medium">Verificări și conformitate</span> —
              obligații legale privind prevenirea spălării banilor și cerințe
              ale procesatorilor.
            </li>
            <li>
              <span className="font-medium">Securitate</span> — interes legitim
              pentru prevenirea fraudelor și asigurarea integrității sistemelor.
            </li>
            <li>
              <span className="font-medium">Comunicare și suport</span> —
              executarea contractului și interes legitim.
            </li>
            <li>
              <span className="font-medium">Marketing pentru comercianți</span>{" "}
              — interes legitim sau consimțământ, cu posibilitatea de
              dezabonare.
            </li>
            <li>
              <span className="font-medium">Analiză și îmbunătățire</span> —
              interes legitim pentru dezvoltarea produsului.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">4. Destinatari ai datelor</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Procesatori de plăți și instituții financiare partenere.</li>
            <li>
              Furnizori de găzduire, email, monitorizare, analitice, suport
              clienți, antifraudă.
            </li>
            <li>
              Consultanți și auditori care lucrează sub acorduri de
              confidențialitate.
            </li>
            <li>Autorități publice, atunci când legea impune.</li>
          </ul>

          <h2 className="text-xl font-semibold">
            5. Transferuri internaționale
          </h2>
          <p>
            Putem transfera date în afara Spațiului Economic European către
            furnizori care oferă garanții adecvate, cum ar fi clauze
            contractuale standard ale Comisiei Europene. Detalii la cerere.
          </p>

          <h2 className="text-xl font-semibold">6. Păstrarea datelor</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Datele de cont și documentele KYC se păstrează pe durata
              contractului și perioada cerută de lege după încetare.
            </li>
            <li>
              Datele tranzacționale se păstrează pentru perioade contabile și de
              audit.
            </li>
            <li>
              Datele colectate pe baza consimțământului se păstrează până la
              retragere sau până la atingerea scopului.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">7. Drepturile tale</h2>
          <p>
            Ai dreptul de acces, rectificare, ștergere, restricționare,
            portabilitate, opoziție. Ai dreptul să te adresezi Autorității
            Naționale de Supraveghere a Prelucrării Datelor cu Caracter
            Personal. Pentru exercitarea drepturilor, scrie la{" "}
            <a
              className="text-blue-600 underline"
              href="mailto:salut@paylinks.ro"
            >
              salut@paylinks.ro
            </a>
            . Vom răspunde fără întârzieri nejustificate.
          </p>

          <h2 className="text-xl font-semibold">
            8. Roluri și responsabilități privind plătitorii
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Pentru datele plătitorilor colectate prin paginile tale, tu ești
              operatorul. PayLinks acționează ca persoană împuternicită pentru
              operațiuni tehnice necesare procesării plății.
            </li>
            <li>
              Trebuie să ai o bază legală pentru prelucrare și să îți
              îndeplinești obligațiile de informare către clienții tăi.
            </li>
            <li>
              La cerere, punem la dispoziție o anexă de prelucrare a datelor.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">9. Securitate</h2>
          <p>
            Aplicăm măsuri tehnice și organizatorice adecvate, inclusiv criptare
            în tranzit, control al accesului, jurnalizare și autentificare cu
            doi factori pentru conturile comercianților. Evaluăm periodic
            riscurile și îmbunătățim măsurile.
          </p>

          <h2 className="text-xl font-semibold">10. Cookies</h2>
          <p>
            Folosim cookie-uri necesare pentru autentificare și funcționare,
            precum și cookie-uri analitice și de marketing cu consimțământ. În
            pagina dedicată găsești lista actuală a cookie-urilor și opțiuni de
            gestionare.
          </p>

          <h2 className="text-xl font-semibold">11. Minori</h2>
          <p>
            Serviciul nu este destinat persoanelor sub optsprezece ani pentru
            deschiderea conturilor de comercianți. Dacă aflăm că am colectat
            date fără drept, le vom șterge.
          </p>

          <h2 className="text-xl font-semibold">
            12. Notificarea incidentelor
          </h2>
          <p>
            În caz de incident de securitate care poate afecta drepturile
            persoanelor, vom notifica autoritatea competentă și, când este
            necesar, persoanele vizate.
          </p>

          <h2 className="text-xl font-semibold">
            13. Modificări ale politicii
          </h2>
          <p>
            Vom publica orice actualizare și vom indica data intrării în
            vigoare. Continuarea utilizării platformei după actualizare înseamnă
            că accepți modificările.
          </p>

          <h2 className="text-xl font-semibold">
            14. Contact protecția datelor
          </h2>
          <p>
            Întrebări și solicitări la{" "}
            <a
              className="text-blue-600 underline"
              href="mailto:salut@paylinks.ro"
            >
              salut@paylinks.ro
            </a>
            .
          </p>
        </section>

        <hr className="border-gray-200" />

        <section className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            ANEXĂ PRIVIND PRELUCRAREA DATELOR PENTRU COMERCIANȚI
          </h1>

          <h2 className="text-xl font-semibold">1. Obiectul prelucrării</h2>
          <p>
            PayLinks prelucrează pentru comerciant datele plătitorilor necesare
            afișării paginii de plată, inițierii tranzacției, notificării
            statusului și generării de rapoarte.
          </p>

          <h2 className="text-xl font-semibold">2. Durata</h2>
          <p>
            Pe durata contractului și pe perioadele cerute de lege pentru
            arhivare.
          </p>

          <h2 className="text-xl font-semibold">3. Natura și scopul</h2>
          <p>
            Găzduire, transmitere, stocare limitată de meta-date de plată,
            jurnalizare, analitice agregate.
          </p>

          <h2 className="text-xl font-semibold">
            4. Tipuri de date și persoane vizate
          </h2>
          <p>
            Plătitori ai comerciantului. Date de identificare și contact,
            detalii despre comanda și suma plătită. Datele de card sunt
            gestionate de procesator.
          </p>

          <h2 className="text-xl font-semibold">5. Instrucțiuni</h2>
          <p>
            PayLinks acționează numai pe baza instrucțiunilor documentate ale
            comerciantului, cu excepția cazurilor impuse de lege.
          </p>

          <h2 className="text-xl font-semibold">6. Confidențialitate</h2>
          <p>Personalul PayLinks este obligat la confidențialitate.</p>

          <h2 className="text-xl font-semibold">7. Securitate</h2>
          <p>
            Măsuri tehnice și organizatorice adecvate conform practicilor din
            industrie.
          </p>

          <h2 className="text-xl font-semibold">8. Subîmputerniciți</h2>
          <p>
            PayLinks poate folosi furnizori listați în Politica de
            confidențialitate, asigurând aceleași obligații de protecție a
            datelor. Comercianții pot primi notificări privind schimbări
            semnificative.
          </p>

          <h2 className="text-xl font-semibold">9. Asistență</h2>
          <p>
            PayLinks ajută comerciantul în îndeplinirea obligațiilor privind
            drepturile persoanelor vizate și securitatea.
          </p>

          <h2 className="text-xl font-semibold">10. Ștergere și returnare</h2>
          <p>
            La încetare, PayLinks va șterge sau returna datele conform
            instrucțiunilor și obligațiilor legale.
          </p>

          <h2 className="text-xl font-semibold">11. Audit</h2>
          <p>
            La cerere rezonabilă, PayLinks pune la dispoziție informații pentru
            a demonstra conformitatea și permite audituri cu notificare
            prealabilă, fără a afecta confidențialitatea altor clienți.
          </p>
        </section>
      </article>
    </main>
  );
}
