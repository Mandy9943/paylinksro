"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Search,
  Tag,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const blogPosts = [
  {
    id: 1,
    title: "Cum să creezi primul tău link de plată în 60 secunde cu PayLinks",
    slug: "primul-link-de-plata-60-secunde",
    excerpt:
      "Ghid pas cu pas pentru antreprenorii care vor să accepte plăți online rapid și fără complicații tehnice. Perfect pentru freelanceri și consultanți.",
    content: `
    <h2>De ce să alegi PayLinks pentru primul tău link de plată?</h2>
    <p>În era digitală de astăzi, capacitatea de a accepta plăți online rapid și sigur este esențială pentru orice antreprenor român. PayLinks îți oferă soluția perfectă pentru a monetiza serviciile sau produsele tale fără cunoștințe tehnice.</p>
    
    <h3>Pas 1: Înregistrarea contului</h3>
    <p>Accesează paylinks.ro și creează-ți contul folosind doar email-ul și o parolă sigură. Nu sunt necesare documente sau verificări complexe - procesul durează doar 10 secunde.</p>
    
    <h3>Pas 2: Configurarea primului link</h3>
    <p>Din dashboard-ul intuitiv, alegi tipul de produs sau serviciu:</p>
    <ul>
    <li><strong>Servicii:</strong> Perfect pentru consultanță, design, dezvoltare sau marketing</li>
    <li><strong>Produse Digitale:</strong> Ideal pentru ebook-uri, cursuri online sau template-uri</li>
    <li><strong>Donații:</strong> Excelent pentru cauze sociale sau proiecte personale</li>
    </ul>
    
    <h3>Pas 3: Personalizarea și lansarea</h3>
    <p>Adaugi titlul, descrierea și prețul, alegi o culoare din paleta premium și vezi instant cum va arăta pagina de plată. În final, copiezi link-ul generat și îl distribui oriunde: social media, email, WhatsApp.</p>
    
    <h2>Beneficiile PayLinks față de alte soluții</h2>
    <p>Spre deosebire de alte platforme internaționale, PayLinks este optimizat special pentru piața românească, cu suport în limba română și compatibilitate totală cu toate băncile locale.</p>
    `,
    publishedAt: "2025-08-03",
    readTime: 3,
    category: "Tutorial",
    categoryColor: "bg-blue-100 text-blue-800",
    author: "Echipa PayLinks",
    featured: true,
    tags: ["tutorial", "plăți online", "freelancing", "monetizare"],
  },
  {
    id: 2,
    title: "7 strategii de monetizare pentru freelancerii români în 2025",
    slug: "strategii-monetizare-freelanceri-2025",
    excerpt:
      "Descoperă cele mai eficiente metode de a-ți crește veniturile ca freelancer în România, folosind instrumente moderne de plată și marketing.",
    content: `
    <h2>Peisajul freelancing-ului românesc în 2025</h2>
    <p>Piața freelancing-ului din România a crescut cu 40% în ultimul an, oferind oportunități fără precedent pentru profesioniștii independenți. Iată strategiile care fac diferența.</p>
    
    <h3>1. Diversificarea surselor de venit</h3>
    <p>Nu te baza doar pe un client sau un tip de serviciu. Creează multiple fluxuri de venit:</p>
    <ul>
    <li>Servicii de consultanță premium (1-on-1)</li>
    <li>Cursuri online sau workshop-uri</li>
    <li>Template-uri și resurse digitale</li>
    <li>Servicii de mentenanță recurentă</li>
    </ul>
    
    <h3>2. Automatizarea proceselor de plată</h3>
    <p>Folosește PayLinks pentru a automatiza încasările și a reduce timpul administrativ. Link-urile de plată personalizate îți conferă credibilitate și profesionalism.</p>
    
    <h3>3. Poziționarea ca expert în nișă</h3>
    <p>Concentrează-te pe o nișă specifică unde poți deveni referința de top. Expertiza în domenii precum e-commerce, fintech sau SaaS este foarte bine plătită.</p>
    `,
    publishedAt: "2025-08-02",
    readTime: 7,
    category: "Business",
    categoryColor: "bg-green-100 text-green-800",
    author: "Ana Popescu",
    featured: true,
    tags: ["freelancing", "monetizare", "business", "strategii"],
  },
  {
    id: 3,
    title: "Ghidul complet: Cum să vinzi produse digitale în România",
    slug: "ghid-vanzare-produse-digitale-romania",
    excerpt:
      "Tot ce trebuie să știi despre vânzarea de ebook-uri, cursuri online și template-uri pe piața românească. Includes legal, fiscal și marketing.",
    content: `
    <h2>Piața produselor digitale în România - oportunități în creștere</h2>
    <p>Piața produselor digitale din România valorează peste 200 milioane RON și crește cu 25% anual. Iată cum să profiți de această tendință.</p>
    
    <h3>Tipurile de produse digitale cu cel mai mare succes</h3>
    <ul>
    <li><strong>Ebook-uri specialized:</strong> Ghiduri practice în marketing, tehnologie sau dezvoltare personală</li>
    <li><strong>Cursuri online:</strong> Video-tutoriale step-by-step pentru skills căutate</li>
    <li><strong>Template-uri business:</strong> Contracte, prezentări, planuri de marketing</li>
    <li><strong>Software și aplicații:</strong> Instrumente de productivitate sau automatizare</li>
    </ul>
    
    <h3>Aspecte legale și fiscale</h3>
    <p>În România, vânzarea de produse digitale se supune acelorași reguli fiscale ca produsele fizice. Asigură-te că:</p>
    <ul>
    <li>Emiți facturi pentru toate tranzacțiile</li>
    <li>Declari veniturile conform legislației</li>
    <li>Respecti GDPR pentru datele clienților</li>
    </ul>
    `,
    publishedAt: "2025-08-01",
    readTime: 8,
    category: "Marketing",
    categoryColor: "bg-purple-100 text-purple-800",
    author: "Mihai Ionescu",
    featured: false,
    tags: ["produse digitale", "marketing", "legal", "e-commerce"],
  },
  {
    id: 4,
    title: "PayLinks vs competiția: Comparație detaliată pentru 2025",
    slug: "paylinks-vs-competitia-comparatie-2025",
    excerpt:
      "Analiză obiectivă a PayLinks față de Stripe, PayPal și alte soluții de plăți. Care este cea mai bună alegere pentru antreprenorii români?",
    content: `
    <h2>Landscape-ul soluțiilor de plăți în România</h2>
    <p>Alegerea platformei de plăți potrivite poate face diferența între succesul și eșecul unui business online. Iată o comparație detaliată.</p>
    
    <h3>PayLinks - Avantaje competitive</h3>
    <ul>
    <li><strong>Suport în română:</strong> Echipă locală disponibilă 24/7</li>
    <li><strong>Integrare bancară optimă:</strong> Compatibilitate perfectă cu toate băncile românești</li>
    <li><strong>Fără contracte:</strong> Flexibilitate maximă, fără angajamente pe termen lung</li>
    <li><strong>Setup instant:</strong> De la înregistrare la primul link activ în 30 secunde</li>
    </ul>
    
    <h3>Stripe - Pro și contra</h3>
    <p><strong>Avantaje:</strong> Platformă matură, API robust, integrări multiple</p>
    <p><strong>Dezavantaje:</strong> Suport limitat în română, setup complex, documentație în engleză</p>
    
    <h3>PayPal - Analiză detaliată</h3>
    <p><strong>Avantaje:</strong> Brand cunoscut, adopție largă la nivel global</p>
    <p><strong>Dezavantaje:</strong> Comisioane mai mari, restricții pentru anumite industrii, UX învechit</p>
    `,
    publishedAt: "2025-07-31",
    readTime: 6,
    category: "Comparație",
    categoryColor: "bg-orange-100 text-orange-800",
    author: "Echipa PayLinks",
    featured: false,
    tags: ["comparație", "plăți online", "business", "PayLinks"],
  },
  {
    id: 5,
    title: "Cum să optimizezi rata de conversie pentru link-urile de plată",
    slug: "optimizare-rata-conversie-linkuri-plata",
    excerpt:
      "Strategii avansate pentru a crește numărul de plăți completate. Psihologia cumpărătorului și designul paginii de checkout optimizate.",
    content: `
    <h2>Psihologia conversiei în e-commerce</h2>
    <p>Rata de conversie medie pentru link-urile de plată în România este de 3.2%. Iată cum să o dublezi.</p>
    
    <h3>Principiile psihologice ale conversiei</h3>
    <ul>
    <li><strong>Urgență:</strong> Creează senzația de oportunitate limitată</li>
    <li><strong>Dovadă socială:</strong> Afișează testimoniale și numărul de clienți</li>
    <li><strong>Simplicitate:</strong> Minimizează fricțiunea în procesul de plată</li>
    <li><strong>Încredere:</strong> Badge-uri de securitate și garanții clare</li>
    </ul>
    
    <h3>Optimizarea tehnică</h3>
    <p>Viteza de încărcare și design-ul responsive sunt cruciale. PayLinks optimizează automat acești factori.</p>
    `,
    publishedAt: "2025-07-30",
    readTime: 5,
    category: "Optimizare",
    categoryColor: "bg-red-100 text-red-800",
    author: "Diana Rus",
    featured: false,
    tags: ["conversie", "optimizare", "psihologie", "marketing"],
  },
];

const categories = [
  { name: "Toate", count: 5, color: "bg-gray-100 text-gray-800" },
  { name: "Tutorial", count: 1, color: "bg-blue-100 text-blue-800" },
  { name: "Business", count: 1, color: "bg-green-100 text-green-800" },
  { name: "Marketing", count: 1, color: "bg-purple-100 text-purple-800" },
  { name: "Comparație", count: 1, color: "bg-orange-100 text-orange-800" },
  { name: "Optimizare", count: 1, color: "bg-red-100 text-red-800" },
];

const popularTags = [
  "plăți online",
  "freelancing",
  "monetizare",
  "business",
  "tutorial",
  "marketing",
  "optimizare",
  "produse digitale",
  "conversie",
  "PayLinks",
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("Toate");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "Toate" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* SEO Meta Tags would be handled by a helmet/head component */}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
                PayLinks
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Acasă
              </Link>
              <Link href="/blog" className="text-blue-600 font-medium">
                Blog
              </Link>
              <Link
                href="/#features"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Funcționalități
              </Link>
              <Link
                href="/#pricing"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Prețuri
              </Link>
            </nav>

            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Începe Gratuit
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/10 backdrop-blur-md text-white mb-6 px-4 py-2 border border-white/20">
            <BookOpen className="w-4 h-4 mr-2" />
            Resurse PayLinks
          </Badge>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Blog PayLinks</h1>

          <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Ghiduri expert, strategii de monetizare și cele mai bune practici
            pentru antreprenorii români care vor să accepte plăți online
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Caută articole, ghiduri, strategii..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/60"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {selectedCategory === "Toate" && searchQuery === "" && (
              <section className="mb-16">
                <div className="flex items-center space-x-3 mb-8">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    Articole Recomandate
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 shadow-lg"
                    >
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={post.categoryColor}>
                            {post.category}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {post.readTime} min
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                            <span>•</span>
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString(
                                "ro-RO"
                              )}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="group-hover:text-blue-600 transition-colors"
                          >
                            Citește <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Posts */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedCategory === "Toate"
                    ? "Toate Articolele"
                    : `Articole ${selectedCategory}`}
                </h2>
                <div className="text-sm text-gray-500">
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? "articol" : "articole"} găsite
                </div>
              </div>

              <div className="space-y-8">
                {filteredPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md"
                  >
                    <div className="p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <Badge className={post.categoryColor}>
                              {post.category}
                            </Badge>
                            {post.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Recomandat
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>

                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{post.author}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    post.publishedAt
                                  ).toLocaleDateString("ro-RO")}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime} min lectură</span>
                              </div>
                            </div>

                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                              Citește Articolul
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Nu am găsit articole
                  </h3>
                  <p className="text-gray-600">
                    Încearcă să cauți alte cuvinte cheie sau să schimbi
                    categoria.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <Card className="p-6 shadow-lg border-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Categorii
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      selectedCategory === category.name
                        ? "bg-blue-100 text-blue-800 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>{category.name}</span>
                    <Badge
                      className={`text-xs ${
                        selectedCategory === category.name
                          ? "bg-blue-200"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>

            {/* Popular Tags */}
            <Card className="p-6 shadow-lg border-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Etichete Populare
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="bg-gray-100 hover:bg-blue-100 hover:text-blue-800 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Rămâi la curent
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Primește cele mai noi articole și ghiduri despre monetizarea
                online direct în inbox.
              </p>
              <div className="space-y-3">
                <Input placeholder="Email-ul tău" className="bg-white" />
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Abonează-te Gratuit
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fără spam. Poți să te dezabonezi oricând.
              </p>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 shadow-lg border-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Link-uri Rapide
              </h3>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Începe cu PayLinks
                </Link>
                <Link
                  href="/#features"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Funcționalități
                </Link>
                <Link
                  href="/#pricing"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Prețuri
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Gata să începi să monetizezi?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Creează primul tău link de plată în 30 de secunde și începe să
            accepți plăți online profesional
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-12 py-4"
          >
            Începe Gratuit Acum
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-blue-200 mt-4">
            Fără contracte • Fără costuri de setup • Activare instantanee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
                  PayLinks
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Platforma de plăți online construită special pentru
                antreprenorii români. Acceptă plăți în 30 de secunde, fără
                cunoștințe tehnice.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produs</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/#features"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Funcționalități
                </Link>
                <Link
                  href="/#pricing"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Prețuri
                </Link>
                <Link
                  href="/blog"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Companie</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Despre noi
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Cariere
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Termeni și condiții
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Politica de confidențialitate
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Securitate
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 PayLinks.ro. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
