import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Store,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  ExternalLink,
  ArrowRight,
  Package,
  Building,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VendorDetails } from '../../types';

interface VendorsViewProps {
  onOpenAddAssetModal?: () => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ onOpenAddAssetModal }) => {
  const { assets, vendors, addVendor, setActiveTab, setSelectedAssetId, currentUser } = useApp();
  const isMonitor = currentUser?.role === 'Monitor';
  const [search, setSearch] = useState('');
  const [selectedVendorForAssets, setSelectedVendorForAssets] = useState<VendorDetails | null>(null);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  // New Vendor Form
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorGstin, setNewVendorGstin] = useState('');
  const [newVendorLocation, setNewVendorLocation] = useState('');

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;

    await addVendor({
      name: newVendorName,
      category: newVendorCategory || 'General Supply',
      contactPerson: newVendorContact || 'Operations Manager',
      phone: newVendorPhone || '+91 90000 00000',
      email: newVendorEmail || `contact@${newVendorName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      gstin: newVendorGstin || '33AAAC1234A1Z1',
      location: newVendorLocation || 'Coimbatore',
      rating: 5.0,
      status: 'Active',
    });

    setIsAddVendorModalOpen(false);
    setNewVendorName('');
    setNewVendorCategory('');
    setNewVendorContact('');
    setNewVendorPhone('');
    setNewVendorEmail('');
    setNewVendorGstin('');
    setNewVendorLocation('');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5" /> Enterprise Vendor Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Approved Vendors & OEM Partners
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Manage verified suppliers, warranty contacts, GST compliance, and supplied asset contracts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor, OEM, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
          {isMonitor && (
            <button
              onClick={() => setIsAddVendorModalOpen(true)}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="p-12 text-center text-[#6B7280] text-sm bg-white rounded-2xl border border-[#E5E7EB]">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor, i) => {
            const suppliedAssets = assets.filter(
              (a) => a.vendor.toLowerCase() === vendor.name.toLowerCase() || a.vendor.includes(vendor.name)
            );
            const totalValuation = suppliedAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

            return (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-6 rounded-[20px] border border-[#E5E7EB] bg-white transition-all duration-300 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.12)] hover:border-[#2563EB] flex flex-col justify-between"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] font-bold shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#111827] leading-tight">
                          {vendor.name}
                        </h3>
                        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                          {vendor.category}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {vendor.status}
                    </span>
                  </div>

                  {/* Contact info box */}
                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]/70 my-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="text-[#6B7280] font-medium">Contact Person:</span>
                      <span className="font-semibold">{vendor.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="text-[#6B7280] font-medium">Phone:</span>
                      <a href={`tel:${vendor.phone}`} className="text-[#2563EB] font-mono hover:underline">
                        {vendor.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="text-[#6B7280] font-medium">Email:</span>
                      <a href={`mailto:${vendor.email}`} className="text-[#2563EB] font-mono hover:underline truncate max-w-[180px]">
                        {vendor.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="text-[#6B7280] font-medium">GSTIN:</span>
                      <span className="font-mono text-[11px] text-[#4B5563]">{vendor.gstin}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-[#E5E7EB] text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">Supplied</div>
                      <div className="text-sm font-bold text-[#111827] mt-0.5">{suppliedAssets.length} Assets</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">Contract</div>
                      <div className="text-sm font-bold text-[#2563EB] mt-0.5">
                        ₹{(totalValuation / 100000).toFixed(1)}L
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">Rating</div>
                      <div className="text-sm font-bold text-[#D97706] mt-0.5 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {vendor.rating}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#6B7280] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" /> {vendor.location}
                  </span>
                  <button
                    onClick={() => setSelectedVendorForAssets(vendor)}
                    className="px-3.5 py-1.5 rounded-lg bg-transparent text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors duration-200 font-semibold text-xs inline-flex items-center gap-1.5 group cursor-pointer"
                  >
                    View Supplied Assets{' '}
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Supplied Assets for Selected Vendor */}
      {selectedVendorForAssets && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full p-6 border border-[#E5E7EB] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    Assets Supplied by {selectedVendorForAssets.name}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Contact: {selectedVendorForAssets.contactPerson} ({selectedVendorForAssets.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendorForAssets(null)}
                className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {assets.filter(
                (a) =>
                  a.vendor.toLowerCase() === selectedVendorForAssets.name.toLowerCase() ||
                  a.vendor.includes(selectedVendorForAssets.name)
              ).length === 0 ? (
                <div className="p-8 text-center text-[#6B7280] text-sm">
                  No active assets specifically mapped to this vendor name in the database yet.
                </div>
              ) : (
                assets
                  .filter(
                    (a) =>
                      a.vendor.toLowerCase() === selectedVendorForAssets.name.toLowerCase() ||
                      a.vendor.includes(selectedVendorForAssets.name)
                  )
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between hover:border-[#2563EB] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                            {asset.id}
                          </span>
                          <span className="text-sm font-bold text-[#111827]">{asset.name}</span>
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          {asset.department} • Room {asset.location} • Purchase Date: {asset.purchaseDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#111827]">
                            ₹{asset.purchaseCost?.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                            {asset.status}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setSelectedVendorForAssets(null);
                            setActiveTab('assets');
                          }}
                          className="p-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                        >
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={() => setSelectedVendorForAssets(null)}
                className="px-4 py-2 bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Vendor */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E5E7EB] shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#111827]">Register New Approved Vendor</h3>
              <button
                onClick={() => setIsAddVendorModalOpen(false)}
                className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendorSubmit} className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">Company / OEM Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems India"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Category / Supply Domain</label>
                  <input
                    type="text"
                    placeholder="e.g. Network Switches & Routers"
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Contact Representative</label>
                  <input
                    type="text"
                    placeholder="e.g. R. Ananth"
                    value={newVendorContact}
                    onChange={(e) => setNewVendorContact(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="sales@cisco.in"
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="33AAAAA1234A1Z5"
                    value={newVendorGstin}
                    onChange={(e) => setNewVendorGstin(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Location / City</label>
                  <input
                    type="text"
                    placeholder="Coimbatore"
                    value={newVendorLocation}
                    onChange={(e) => setNewVendorLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-4 py-2 bg-[#F3F4F6] text-[#374151] rounded-lg font-semibold hover:bg-[#E5E7EB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
