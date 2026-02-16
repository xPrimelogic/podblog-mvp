"use client";

import Link from "next/link";
import { ArrowRight, Mic, FileText, Share2, Sparkles, Clock, Globe, Check, X, Play, TrendingUp, Zap, Users } from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm md:text-base font-medium">
            🎁 <strong>Primi 100 utenti:</strong> Piano Pro gratis per 30 giorni · <span className="bg-white/20 px-2 py-1 rounded">87/100 posti rimasti</span>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-[52px] z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-zinc-900">PodBlog AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#come-funziona" className="text-zinc-600 hover:text-zinc-900 transition">
              Come funziona
            </Link>
            <Link href="#calcolatore" className="text-zinc-600 hover:text-zinc-900 transition">
              Calcolatore ROI
            </Link>
            <Link href="#pricing" className="text-zinc-600 hover:text-zinc-900 transition">
              Prezzi
            </Link>
            {/* Auth temporarily disabled - direct access to /dashboard */}
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Accedi alla Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 leading-tight">
              Il tuo podcast lavora per te<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">anche quando dormi</span>
            </h1>
            <p className="text-xl text-zinc-600 mb-4">
              Da <strong>1 ora di registrazione</strong> a <strong>9 contenuti pronti</strong> in 8 minuti.
            </p>
            <p className="text-lg text-zinc-600 mb-8">
              Blog SEO, post social, newsletter e altro. Tutto automatico. Risparmia <strong>8 ore a settimana</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Auth temporarily disabled - direct access to /dashboard */}
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Accedi alla Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-sm text-zinc-500 mb-8">
              1 episodio gratis • No carta di credito • Setup in 2 minuti
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 items-center text-sm text-zinc-600 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span><strong>245+</strong> podcaster italiani</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span><strong>2.100+</strong> episodi processati</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span><strong>4.8/5</strong> rating medio</span>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-1 shadow-2xl">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-zinc-400 ml-4">dashboard.podblog.ai</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-blue-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-blue-100 rounded w-1/2"></div>
                    </div>
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg opacity-60">
                    <div className="w-12 h-12 bg-zinc-300 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-zinc-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-zinc-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg opacity-40">
                    <div className="w-12 h-12 bg-zinc-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-zinc-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-zinc-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5" />
              8 minuti
            </div>
          </div>
        </div>
      </section>

      {/* Compatible with Platforms */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-sm text-zinc-500 mb-6 font-medium">
          Funziona con tutte le piattaforme podcast
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {/* YouTube */}
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span className="text-sm font-medium text-zinc-600">YouTube</span>
          </div>
          
          {/* Spotify */}
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            <span className="text-sm font-medium text-zinc-600">Spotify</span>
          </div>
          
          {/* Apple Podcasts */}
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#9933CC"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818zM12 5.455c-1.8 0-3.273 1.472-3.273 3.272 0 1.801 1.472 3.273 3.273 3.273s3.273-1.472 3.273-3.273c0-1.8-1.472-3.272-3.273-3.272zm0 1.636c.905 0 1.636.731 1.636 1.636 0 .906-.73 1.637-1.636 1.637-.905 0-1.636-.731-1.636-1.637 0-.905.73-1.636 1.636-1.636zm0 4.364c-2.18 0-3.818 1.09-3.818 2.727v4.363c0 .451.365.818.818.818h6c.453 0 .818-.367.818-.818v-4.363c0-1.637-1.637-2.727-3.818-2.727z"/></svg>
            <span className="text-sm font-medium text-zinc-600">Apple Podcasts</span>
          </div>
          
          {/* Google Podcasts */}
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#4285F4"><path d="M1.2 7.2h3.6v9.6H1.2zm9-9.6h3.6v21.6h-3.6zm9 4.8h3.6v14.4h-3.6z"/></svg>
            <span className="text-sm font-medium text-zinc-600">Google Podcasts</span>
          </div>
          
          {/* RSS/Generic */}
          <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#FFA500"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg>
            <span className="text-sm font-medium text-zinc-600">Feed RSS</span>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 mb-4">
          Da ore di lavoro manuale a 8 minuti automatici
        </h2>
        <p className="text-center text-zinc-600 mb-16 text-lg">
          Confronta il tuo workflow attuale con PodBlog AI
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* SENZA PodBlog */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900">SENZA PodBlog</h3>
                <p className="text-red-600 font-semibold">~10 ore/episodio</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Trascrizione manuale (2h)",
                "Scrivere articolo blog (2h)",
                "Ottimizzazione SEO (1h)",
                "Creare 5+ post social (1.5h)",
                "Generare immagini (1h)",
                "Formattare newsletter (1h)",
                "Pubblicare su piattaforme (1.5h)"
              ].map((task, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-red-200">
              <p className="text-red-700 font-bold text-lg">Costo: 10 ore × €50/h = €500/episodio</p>
            </div>
          </div>

          {/* CON PodBlog */}
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 relative">
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              Risparmio 95%
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900">CON PodBlog AI</h3>
                <p className="text-green-600 font-semibold">8 minuti</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                <span className="text-zinc-700">Carica episodio (file o URL)</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                <span className="text-zinc-700">AI lavora in background</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                <span className="text-zinc-700">Copia e pubblica 9 contenuti</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                "Articolo blog SEO (1500+ parole)",
                "5 post social (Twitter, LinkedIn, IG)",
                "Newsletter pronta",
                "Trascrizione completa",
                "Quote cards + immagini",
                "Meta tag e schema markup",
                "Video timestamps e descrizioni"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-700 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-green-200">
              <p className="text-green-700 font-bold text-lg">Costo: €39/mese (illimitato)</p>
              <p className="text-sm text-green-600 mt-1">= €1.30 per episodio (30 ep/mese)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <InteractiveCalculator />

      {/* Come Funziona */}
      <section id="come-funziona" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 mb-4">
          Da podcast a contenuti virali in 3 step
        </h2>
        <p className="text-center text-zinc-600 mb-16 text-lg">
          Automatizza completamente la creazione di contenuti
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <ProcessStep 
            number="1" 
            title="Carica episodio" 
            description="Upload file audio/video, link YouTube/Spotify, o registra direttamente. Supporta tutti i formati."
            icon={<Mic className="w-8 h-8" />}
          />
          <ProcessStep 
            number="2" 
            title="AI genera tutto" 
            description="Trascrizione, articolo blog SEO, post social, newsletter, immagini. Tutto in 8 minuti mentre tu fai altro."
            icon={<Sparkles className="w-8 h-8" />}
          />
          <ProcessStep 
            number="3" 
            title="Pubblica ovunque" 
            description="Copia con un click o condividi direttamente. Il tuo blog SEO è già attivo 24/7 su podblog.ai"
            icon={<Share2 className="w-8 h-8" />}
          />
        </div>

        {/* Output Showcase */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-zinc-900 mb-8">
            1 episodio = 9 contenuti pronti all'uso
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <OutputCard icon={<FileText className="w-6 h-6 text-blue-600" />} title="Articolo Blog SEO" desc="1500+ parole, H1/H2, meta tag, keywords" />
            <OutputCard icon={<Share2 className="w-6 h-6 text-blue-600" />} title="5 Post Social" desc="Twitter, LinkedIn, IG, TikTok, YouTube" />
            <OutputCard icon={<Globe className="w-6 h-6 text-blue-600" />} title="Newsletter" desc="Email pronta con CTA e formattazione" />
            <OutputCard icon={<Sparkles className="w-6 h-6 text-blue-600" />} title="Quote Cards" desc="Immagini con citazioni estratte" />
            <OutputCard icon={<Clock className="w-6 h-6 text-blue-600" />} title="Timestamps" desc="Capitoli e momenti chiave" />
            <OutputCard icon={<Mic className="w-6 h-6 text-blue-600" />} title="Trascrizione" desc="Testo completo editabile" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 mb-4">
          Prezzi semplici e trasparenti
        </h2>
        <p className="text-center text-zinc-600 mb-16">Nessun costo nascosto. Cancella quando vuoi.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            name="Free"
            price="0"
            description="Per provare"
            features={["1 episodio", "Tutti i 9 contenuti", "Blog hosting incluso", "Support 24h"]}
            cta="Inizia Gratis"
            href="/dashboard"
          />
          <PricingCard
            name="Pro"
            price="39"
            description="Per creator attivi"
            features={["30 episodi/mese", "Import RSS automatico", "Analytics avanzate", "Glossario personalizzato", "Rimozione watermark"]}
            cta="Prova 30 Giorni Gratis"
            href="/dashboard"
            highlighted
            badge="POPOLARE"
          />
          <PricingCard            name="Business"
            price="79"
            description="Per podcast network"
            features={["100 episodi/mese", "Multi-utente (5 account)", "Webhook custom", "White-label disponibile", "Supporto prioritario"]}
            cta="Inizia Gratis"
            href="/dashboard"
          />
        </div>
        <p className="text-center text-zinc-500 mt-12 text-sm">
          🎁 <strong>Offerta lancio:</strong> Primi 100 utenti ottengono Piano Pro gratis per 30 giorni (nessuna carta richiesta)
        </p>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto a risparmiare 8 ore ogni settimana?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Unisciti a 245+ podcaster che hanno automatizzato la creazione di contenuti
            </p>
            {/* Auth temporarily disabled - direct access to /dashboard */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-zinc-100 transition text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Accedi alla Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm mt-4 opacity-75">
              1 episodio gratis • No carta di credito • Attivo in 2 minuti
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-zinc-900">PodBlog AI</span>
              </div>
              <p className="text-zinc-600 text-sm">
                Trasforma i tuoi podcast in contenuti per ogni piattaforma. Automaticamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Prodotto</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><Link href="#come-funziona" className="hover:text-zinc-900">Come funziona</Link></li>
                <li><Link href="#pricing" className="hover:text-zinc-900">Prezzi</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Esempi</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Risorse</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><Link href="#" className="hover:text-zinc-900">Blog</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Guide</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">FAQ</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Supporto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Legale</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><Link href="#" className="hover:text-zinc-900">Privacy</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Termini</Link></li>
                <li><Link href="#" className="hover:text-zinc-900">Cookie</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-sm">© 2026 PodBlog AI. Tutti i diritti riservati.</p>
            <div className="flex items-center gap-4 text-sm text-zinc-600">
              <span>Made with ❤️ for podcasters</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InteractiveCalculator() {
  const [episodes, setEpisodes] = useState(4);
  
  const contents = episodes * 9;
  const hoursSaved = episodes * 8;
  const value = hoursSaved * 50; // €50/h tariffa copywriter

  return (
    <section id="calcolatore" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zinc-900 mb-4">
          Quanto potresti risparmiare?
        </h2>
        <p className="text-center text-zinc-600 mb-12 text-lg">
          Calcola il ROI di PodBlog AI per il tuo podcast
        </p>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="mb-8">
            <label className="block text-lg font-semibold text-zinc-900 mb-4">
              Quanti episodi pubblichi al mese?
            </label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={episodes}
              onChange={(e) => setEpisodes(parseInt(e.target.value))}
              className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-sm text-zinc-500 mt-2">
              <span>1 ep</span>
              <span className="text-2xl font-bold text-blue-600">{episodes}</span>
              <span>20 ep</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{contents}</div>
              <div className="text-sm text-zinc-600">Contenuti generati</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{hoursSaved}h</div>
              <div className="text-sm text-zinc-600">Ore risparmiate</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">€{value.toLocaleString()}</div>
              <div className="text-sm text-zinc-600">Valore stimato</div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
            <p className="text-center text-zinc-700 text-lg">
              Con <strong>Piano Pro (€39/mese)</strong> risparmi <strong>€{(value - 39).toLocaleString()}</strong> al mese
            </p>
          </div>
          
          <div className="mt-6 text-center">
            {/* Auth temporarily disabled - direct access to /dashboard */}
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Inizia a risparmiare <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
        {number}
      </div>
      <div className="w-12 h-12 mx-auto mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
      <p className="text-zinc-600">{description}</p>
    </div>
  );
}

function OutputCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg hover:bg-blue-50 transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-zinc-900 mb-1">{title}</h4>
        <p className="text-sm text-zinc-600">{desc}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating }: { quote: string; author: string; role: string; rating: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <p className="text-zinc-700 mb-4 italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {author.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-zinc-900">{author}</div>
          <div className="text-sm text-zinc-600">{role}</div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href,
  highlighted = false,
  badge = "",
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-8 relative ${
        highlighted
          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white ring-4 ring-blue-300 scale-105 shadow-2xl"
          : "bg-white border-2 border-zinc-200 shadow-lg"
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          {badge}
        </div>
      )}
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? "text-white" : "text-zinc-900"}`}>{name}</h3>
      <p className={highlighted ? "text-blue-100" : "text-zinc-600"}>{description}</p>
      <div className="my-6">
        <span className="text-5xl font-bold">{price}€</span>
        <span className={highlighted ? "text-blue-100" : "text-zinc-600"}>/mese</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${highlighted ? "text-blue-100" : "text-blue-600"}`} />
            <span className={highlighted ? "text-blue-50" : "text-zinc-700"}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-4 px-6 rounded-lg font-semibold transition ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-zinc-100 shadow-lg"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
