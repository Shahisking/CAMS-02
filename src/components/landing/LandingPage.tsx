import React from 'react';
import { motion } from 'motion/react';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  ShieldCheck,
  QrCode,
  Wrench,
  BarChart3,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Lock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <CollegeLogo size="lg" variant="icon-only" />
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-display">
                Adithya Institute of Technology
              </div>
              <div className="text-xs badge-bold text-blue-600 dark:text-blue-400 tracking-wider">
                CAMS – Smart Asset Monitoring System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('login')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-bl from-blue-100/50 via-emerald-50/30 to-transparent dark:from-blue-950/30 dark:via-emerald-950/10 dark:to-transparent rounded-bl-full blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-[10px] badge-bold">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Smart Asset Management Platform
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl heading-hero text-slate-900 dark:text-white">
                Manage College Assets <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500">Smarter & Faster</span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Track, maintain, and monitor every lab workstation, projector, library bookshelf, and campus equipment at <strong>Adithya Institute of Technology</strong> with real-time QR scanning and maintenance analytics.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                >
                  Login to Portal
                </button>
              </div>
            </motion.div>

            {/* Right Column Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl shadow-blue-500/10">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      AIT
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Smart Campus Overview</div>
                      <div className="text-xs text-emerald-500 font-medium">● 1,240 Assets Active</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400">
                    Live Sync
                  </span>
                </div>

                {/* Stat Preview Pills */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Computer Labs</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">480 Items</div>
                  </div>
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active Maintenance</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">3 Tickets</div>
                  </div>
                </div>

                {/* Floating QR Tag Mockup */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg mb-4">
                  <div className="p-2 bg-white rounded-xl text-slate-900">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-blue-400 font-semibold uppercase">Scan Asset Tag</div>
                    <div className="text-sm font-bold truncate">AIT-CSE-001 (Dell i7 Workstation)</div>
                    <div className="text-xs text-slate-400">Ramanujan Block • Lab 3</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto QR Tag Generation
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Adithya Institute of Technology</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Powerful Core Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything Needed to Track Campus Assets
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
              Designed specifically for engineering institutions to eliminate asset misplacement, automate maintenance schedules, and generate compliance reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
                title: 'Instant QR Code Module',
                desc: 'Generate printable QR labels for every asset and scan them using smartphone or laptop camera for immediate status checks.',
              },
              {
                icon: <Wrench className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                title: 'Maintenance Ticket Engine',
                desc: 'Raise repair requests, assign certified technicians, track cost estimations, and set priority levels.',
              },
              {
                icon: <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
                title: 'Department & Block Allocations',
                desc: 'Seamlessly allocate equipment between CSE, ECE, Mech, Civil, Library, Hostels, and Store Rooms with transfer histories.',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
                title: 'Analytics & Audit Reports',
                desc: 'Interactive bar, pie, and line charts showing asset breakdown by condition, department, and annual depreciation.',
              },
              {
                icon: <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
                title: 'One-Click Export (Excel & PDF)',
                desc: 'Export filtered inventories, audit logs, and maintenance histories directly into printable PDF or Excel spreadsheets.',
              },
              {
                icon: <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
                title: 'Role-Based Access Control',
                desc: 'Customized views and administrative permissions for Principal, HODs, Faculty, Lab Assistants, and Maintenance Techs.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 shadow-xs">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="stat-value text-4xl sm:text-6xl text-blue-400">1,250+</div>
              <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mt-2">Campus Assets Registered</div>
            </div>
            <div>
              <div className="stat-value text-4xl sm:text-6xl text-emerald-400">11</div>
              <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mt-2">Academic Departments</div>
            </div>
            <div>
              <div className="stat-value text-4xl sm:text-6xl text-indigo-400">99.2%</div>
              <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mt-2">Equipment Operational Rate</div>
            </div>
            <div>
              <div className="stat-value text-4xl sm:text-6xl text-amber-400">99.8%</div>
              <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mt-2">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Trusted by Faculty & Staff
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              What Adithya Faculty Says
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: 'CAMS transformed how we audit 200+ high-end workstations in our AI lab. Searching via QR tags takes seconds.',
                name: 'Dr. R. Sundaram',
                role: 'HOD, Computer Science & Engineering',
              },
              {
                quote: 'Maintenance tickets no longer get lost in paper forms. Technicians receive instant priority alerts.',
                name: 'Prof. M. Malathi',
                role: 'Senior Staff, ECE Department',
              },
              {
                quote: 'As Principal, I can monitor campus asset health across all blocks from a single executive dashboard.',
                name: 'Dr. K. Arulmohan',
                role: 'Principal, Adithya Institute of Technology',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <p className="text-slate-600 dark:text-slate-300 italic text-sm mb-6 leading-relaxed">
                  "{t.quote}"
                </p>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-base">{t.name}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Contact & Support
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
                Adithya Institute of Technology
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                For administrative access, system maintenance assistance, or campus asset registration support, reach out to the CAMS Helpdesk.
              </p>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Kurumbapalayam, Sathy Road, Coimbatore, Tamil Nadu 641107</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+91 422 2654500 / Ext 104 (CAMS Cell)</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>cams-support@adithyatech.edu.in</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Ready to Access CAMS?</h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                Login with your institutional staff or student ID to access your department's asset portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center shadow-md transition-all flex-1"
                >
                  Login to Portal
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-center transition-all flex-1"
                >
                  Register Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">Adithya Institute of Technology</span> — CAMS Portal
          </div>
          <div>© {new Date().getFullYear()} Adithya Institute of Technology. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
