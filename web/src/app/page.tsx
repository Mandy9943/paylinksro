"use client";
import AuthModal from "@/components/auth-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
  FileText,
  Heart,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg font-bold text-lg"
            >
              PayLinks
            </motion.div>

            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden md:flex items-center space-x-8"
            >
              <motion.a
                whileHover={{ scale: 1.05, color: "#2563eb" }}
                transition={{ type: "spring", stiffness: 300 }}
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Acasă
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, color: "#2563eb" }}
                transition={{ type: "spring", stiffness: 300 }}
                href="/blog"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Blog
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, color: "#2563eb" }}
                transition={{ type: "spring", stiffness: 300 }}
                href="#features"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Funcționalități
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, color: "#2563eb" }}
                transition={{ type: "spring", stiffness: 300 }}
                href="#pricing"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Prețuri
              </motion.a>
            </motion.nav>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Începe Gratuit
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
            className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          ></motion.div>
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="w-full h-full opacity-5"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(20, 1fr)",
                gap: "24px",
                padding: "32px",
              }}
            >
              {[...Array(400)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.003, duration: 0.5 }}
                  className="w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.03}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center text-white max-w-5xl mx-auto pt-[80px] pb-[80px] mt-[-68px] mb-[-68px]">
            {/* Trust Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium mt-[-2px] mb-[-2px]">
                Recomandat de freelanceri și antreprenori români.
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
              className="lg:text-7xl font-bold mb-6 text-[55px]"
            >
              Acceptă Plăți Online Rapid
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed max-w-4xl mx-auto"
            >
              Creează cu ușurință un link de plată și distribuie-l clienților
              tăi.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-2 border-white/20"
                  style={{
                    animation: "subtle-glow 4s ease-in-out infinite",
                  }}
                >
                  Crește-ți veniturile acum!
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="flex items-center justify-center space-x-6 text-sm text-blue-200"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4 text-green-400" />
                <span>SSL & PCI DSS</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Fără contracte</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-green-400" />
                <span>Setup 30 secunde</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section
        id="features"
        className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 gap-4 h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="bg-blue-500 rounded-full w-2 h-2"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 mb-6 px-4 py-2 text-sm">
                Funcționalități Premium
              </Badge>
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Monetizează-ți ideile.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fără cunoștințe tehnice.
              </span>
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Platformă creată special pentru antreprenorii români.
            </motion.p>
          </motion.div>

          {/* Product Types - Premium Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 items-stretch">
            {/* Servicii */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"
                whileHover={{ scale: 1.05 }}
              />
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8 transition-all duration-500 h-full flex flex-col">
                <motion.div
                  initial={{ scale: 0.8, rotateY: 180 }}
                  whileInView={{ scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Users className="text-white h-10 w-10" />
                </motion.div>
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  Servicii
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-gray-600 text-center mb-6 leading-relaxed flex-grow"
                >
                  Consultanță, design, dezvoltare, marketing și alte servicii
                  profesionale de înaltă valoare
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mt-auto"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Perfect pentru:
                  </div>
                  <div className="text-sm text-gray-600">
                    • Freelanceri și consultanți
                    <br />
                    • Agenții de marketing
                    <br />• Dezvoltatori software
                  </div>
                </motion.div>
              </Card>
            </motion.div>

            {/* Produse Digitale */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"
                whileHover={{ scale: 1.05 }}
              />
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8 transition-all duration-500 h-full flex flex-col">
                <motion.div
                  initial={{ scale: 0.8, rotateY: 180 }}
                  whileInView={{ scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="bg-gradient-to-br from-green-500 to-blue-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <FileText className="text-white h-10 w-10" />
                </motion.div>
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                >
                  Produse Digitale
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-gray-600 text-center mb-6 leading-relaxed flex-grow"
                >
                  Ebook-uri, cursuri online, template-uri, software și alte
                  resurse digitale premium
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl mt-auto"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Perfect pentru:
                  </div>
                  <div className="text-sm text-gray-600">
                    • Creatori de conținut
                    <br />
                    • Formatori online
                    <br />• Experți în domeniu
                  </div>
                </motion.div>
              </Card>
            </motion.div>

            {/* Donații */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"
                whileHover={{ scale: 1.05 }}
              />
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8 transition-all duration-500 h-full flex flex-col">
                <motion.div
                  initial={{ scale: 0.8, rotateY: 180 }}
                  whileInView={{ scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="bg-gradient-to-br from-pink-500 to-red-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Heart className="text-white h-10 w-10" />
                </motion.div>
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent"
                >
                  Donații
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-gray-600 text-center mb-6 leading-relaxed flex-grow"
                >
                  Colectează donații pentru cauze sociale, proiecte personale
                  sau evenimente importante
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-xl mt-auto"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Perfect pentru:
                  </div>
                  <div className="text-sm text-gray-600">
                    • ONG-uri și fundații
                    <br />
                    • Proiecte de crowdfunding
                    <br />• Evenimente caritabile
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      {/* How it Works - Premium Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="bg-white/10 backdrop-blur-md text-white mb-6 px-4 py-2 text-sm border border-white/20">
              Process simplu și rapid
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              De la idee la{" "}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                primul RON
              </span>{" "}
              în 30 de secunde
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fără cod, fără complicații tehnice. Doar pasiunea ta și PayLinks
              care se ocupă de tot.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center group-hover:transform group-hover:-translate-y-2 transition-all duration-500">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Alegi & configurezi
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Selectezi tipul (serviciu/produs/donație), adaugi titlu,
                  descriere și prețul. Totul în interfața noastră intuitivă.
                </p>
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                  <div className="text-sm text-blue-300 font-medium">
                    Timp necesar:
                  </div>
                  <div className="text-white font-bold">10 secunde</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center group-hover:transform group-hover:-translate-y-2 transition-all duration-500">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Personalizezi designul
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Alegi culoarea perfectă din paleta noastră premium, activezi
                  colectarea datelor și vezi live preview-ul în timp real.
                </p>
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                  <div className="text-sm text-green-300 font-medium">
                    Timp necesar:
                  </div>
                  <div className="text-white font-bold">15 secunde</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center group-hover:transform group-hover:-translate-y-2 transition-all duration-500">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Distribuie & încasezi
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Copiezi link-ul generat și îl împărtășești oriunde: social
                  media, email, WhatsApp. Plățile apar instant în dashboard.
                </p>
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                  <div className="text-sm text-purple-300 font-medium">
                    Timp necesar:
                  </div>
                  <div className="text-white font-bold">5 secunde</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white mb-8 border border-white/20">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">
                Total: 30 de secunde până la primul link activ
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Premium Benefits Section */}
      <section className="py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 mb-6 px-4 py-2 text-sm">
              Avantaje competitive
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              De ce tot mai mulți{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                antreprenori aleg PayLinks?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Singurul serviciu de plăți construit exclusiv pentru nevoile
              pieței românești
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/60 transition-all duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Fără angajamente financiare
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Zero costuri de setup, fără contracte pe termen lung.
                    Plătești doar când încasezi.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/60 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Securitate de nivel bancar
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Certificat SSL 256-bit, conformitate PCI DSS Level 1, și
                    algoritmi avansați de detectare a fraudelor. Datele tale și
                    ale clienților sunt 100% protejate.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/60 transition-all duration-300">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Viteza de implementare record
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    De la înregistrare la primul link de plată activ în doar 30
                    de secunde. Fără documente, fără verificări complexe, fără
                    întârzieri.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/60 transition-all duration-300">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Compatibilitate totală carduri RO
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Acceptă toate cardurile românești (BCR, BRD, ING,
                    Raiffeisen) și internaționale.
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Pricing Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white text-center">
                  <h3 className="text-3xl font-bold mb-2">PayLinks.ro</h3>
                </div>

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      2.5%
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      per tranzacție
                    </div>

                    <div className="text-sm text-gray-500">
                      Fără alte costuri ascunse
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Link-uri de plată nelimitate
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Dashboard analytics complet
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Customizare design avansată
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Suport prioritar în română
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Securitate avansată</span>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Button
                      onClick={() => setShowAuth(true)}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white py-8 px-8 text-xl font-bold shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 border-2 border-white/20 rounded-2xl relative overflow-hidden group"
                      style={{
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #4f46e5 100%)",
                        boxShadow:
                          "0 20px 40px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <span>Creeaza cont gratuit!</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                    </Button>
                  </motion.div>

                  <div className="text-center mt-4">
                    <div className="text-xs text-gray-500 mb-2">
                      🔒 Nu sunt necesare detalii de card
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Final Premium CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="w-full h-full opacity-5"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(20, 1fr)",
                gap: "24px",
                padding: "32px",
              }}
            >
              {[...Array(400)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.03}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-white font-medium">
              Alegerea celor care monetizează rapid, fără bătăi de cap.
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Gata să-ți{" "}
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              crești
            </span>{" "}
            veniturile?
          </h2>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Alătură-te antreprenorilor români care generează{" "}
            <span className="text-green-400 font-bold">
              în medie 67% mai mult
            </span>{" "}
            cu link-uri de plată profesionale PayLinks
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">
                RON 50M+
              </div>
              <div className="text-gray-300">procesați în ultimul an</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                30 sec
              </div>
              <div className="text-gray-300">timp mediu de setup</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-300">uptime garantat</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 border-2 border-white/20 group"
            >
              Începe gratuit în 30 secunde
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Certificat SSL & PCI DSS</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Fără contracte sau angajamente</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-400" />
              <span>Suport 24/7 în română</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span>Activare instantanee</span>
            </div>
          </div>

          {/* Final Notice */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              🔒 Nu sunt necesare detalii de card pentru înregistrare • Anulare
              oricând • GDPR compliant
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-xl shadow-lg mb-4 inline-block">
                PayLinks
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
                <a
                  href="#features"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Funcționalități
                </a>
                <a
                  href="#pricing"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Prețuri
                </a>
                <a
                  href="/blog"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
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
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
