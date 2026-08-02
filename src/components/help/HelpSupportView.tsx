import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Mail,
  Send,
  CheckCircle2,
  Phone,
  MessageSquare,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HelpSupportView: React.FC = () => {
  const { settings } = useApp();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const FAQS = [
    {
      q: 'How do I generate a QR code label for a new laboratory workstation?',
      a: 'When registering an asset under the "Asset Management" tab, CAMS automatically generates a unique QR code tag. You can click on the "View Asset" button and select "Print QR Tag Label" to produce a physical barcode sticker.',
    },
    {
      q: 'Who can raise a maintenance repair ticket for broken projectors or equipment?',
      a: 'Faculty members, Department HODs, and Lab Technicians can raise maintenance tickets. Navigate to the Maintenance tab and click "+ Raise Maintenance Ticket".',
    },
    {
      q: 'How are asset allocations transferred between different academic blocks?',
      a: 'Go to the "Asset Allocation" section, select the desired asset tag ID, enter the destination building/room (e.g. Ramanujan Block -> APJ Kalam Block) and new custodian, then click "Confirm Asset Transfer".',
    },
    {
      q: 'Can I export the asset inventory to Excel or PDF for NAAC/NBA auditing?',
      a: 'Yes! Navigate to either Asset Management or Reports, then click "Export Excel" or "Export PDF" for instant formatted spreadsheet and printable reports.',
    },
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setShowTicketModal(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2500);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Help & Technical Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            System documentation, video tutorials, FAQs and CAMS administrative desk contact
          </p>
        </div>

        <button
          onClick={() => setShowTicketModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4" /> Raise Support Ticket
        </button>
      </div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">User Manual (PDF)</h3>
            <p className="text-xs text-slate-500 mb-4">Comprehensive guidebook for CAMS features</p>
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Download CAMS Manual v2.5 →
            </button>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Video Tutorials</h3>
            <p className="text-xs text-slate-500 mb-4">2-minute walk-throughs for QR scanning & transfers</p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
              Watch Walkthroughs →
            </span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Contact Administrator</h3>
            <p className="text-xs text-slate-500 mb-1">{settings.contactEmail}</p>
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{settings.contactPhone}</p>
          </div>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openFaq === index && (
                <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Raise Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Raise Support Ticket</h3>
            <p className="text-xs text-slate-500 mb-6">Send query directly to Adithya Institute of Technology CAMS Admin</p>

            {ticketSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Support Ticket Submitted! Ticket ID: #TCK-{Date.now().toString().slice(-4)}
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Ticket Subject *
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Request for additional QR stickers or account permission upgrade"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your technical inquiry..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <Send className="w-4 h-4" /> Submit Ticket
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
