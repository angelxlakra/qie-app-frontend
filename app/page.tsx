import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Meteors } from "@/components/ui/meteors";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ArrowRight, ShieldCheck, QrCode, Ticket, Globe, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans">
      <Navigation />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-white dark:bg-black pt-16 pb-32 lg:pt-32 lg:pb-40">
          {/* Background Gradient/Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/40 dark:via-transparent dark:to-transparent opacity-70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100 via-transparent to-transparent dark:from-purple-900/40 dark:via-transparent dark:to-transparent opacity-70"></div>

          {/* Meteors Animation */}
          <Meteors number={30} className="dark:bg-blue-400 bg-blue-600" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Text */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Live on QIE Testnet
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  The Future of <br className="hidden lg:block"/>
                  <AnimatedGradientText
                    colorFrom="#3b82f6"
                    colorTo="#9333ea"
                    speed={1.5}
                    className="text-5xl lg:text-7xl font-extrabold"
                  >
                    Event Ticketing
                  </AnimatedGradientText>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Experience seamless, secure, and fraudulent-free ticketing powered by the QIE Blockchain. Buy, sell, and redeem tickets as NFTs with zero hassle.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/events">
                    <ShimmerButton
                      background="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                      shimmerColor="#ffffff"
                      className="px-8 py-4 text-white font-semibold shadow-lg shadow-blue-500/25"
                    >
                      <span className="flex items-center gap-2">
                        Explore Events
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </ShimmerButton>
                  </Link>
                  <Link
                    href="/create-event"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white rounded-full font-semibold transition-all hover:shadow-md"
                  >
                    Create Event
                  </Link>
                </div>
                
                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>Instant Transfer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span>Global Access</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                <div className="relative w-full h-full max-w-lg lg:max-w-xl mx-auto">
                    {/* Abstract overlapping cards/glassmorphism effect */}
                    <div className="absolute top-10 left-10 w-full h-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl -z-10 animate-pulse"></div>
                    
                    <div className="relative w-full h-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 glass-panel animate-float">
                        <Image
                            src="/hero-illustration.png"
                            alt="Blockchain Ticketing Illustration"
                            width={800}
                            height={800}
                            priority
                            className="w-full h-auto object-cover"
                        />
                         {/* Floating badges */}
                        <div className="absolute top-8 right-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 dark:border-gray-700 transform rotate-6 animate-float-delayed">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                     <Ticket className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <p className="text-xs text-gray-500">Just Sold</p>
                                     <p className="font-bold text-gray-900 dark:text-white">VIP Pass #402</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose QIE Tickets?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                We leverage blockchain technology to solve the biggest problems in event ticketing—fraud, scalping, and lack of transparency.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <BorderBeam
                  size={150}
                  duration={8}
                  delay={0}
                  colorFrom="#6366f1"
                  colorTo="#8b5cf6"
                />
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Fraud-Proof Tickets
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every ticket is an NFT on the QIE blockchain, guaranteeing authenticity. Say goodbye to fake tickets and duplicate sales.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <BorderBeam
                  size={150}
                  duration={8}
                  delay={2}
                  colorFrom="#3b82f6"
                  colorTo="#06b6d4"
                />
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Easy Redemption
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Simply show your dynamic QR code at the venue. Our cryptographic verification ensures smooth and secure entry in seconds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <BorderBeam
                  size={150}
                  duration={8}
                  delay={4}
                  colorFrom="#9333ea"
                  colorTo="#ec4899"
                />
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Ticket className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Secondary Market
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Can't make it? Resell your tickets safely on our marketplace. Organizers earn royalties on every secondary sale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900">
                 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-800 dark:from-blue-900 dark:to-purple-900 opacity-90"></div>
             </div>
             
             <div className="container mx-auto px-4 relative z-10 text-center">
                 <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience the Future?</h2>
                 <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                     Join thousands of users on the QIE Testnet today. Connect your wallet and start discovering events.
                 </p>
                 <Link href="/events">
                   <ShimmerButton
                     background="rgba(255, 255, 255, 1)"
                     shimmerColor="#3b82f6"
                     className="text-blue-700 text-lg font-bold shadow-xl"
                   >
                     Start Browsing Now
                   </ShimmerButton>
                 </Link>
             </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
