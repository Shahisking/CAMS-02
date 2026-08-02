import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Download,
  TrendingUp,
  Building,
  PieChart as PieIcon,
  Wrench,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { assets, maintenanceTickets, allocationLogs, buildingBlocks } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'department' | 'maintenance' | 'assets'>('department');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Live Executive Metrics
  const totalAssetsCount = assets.length;
  const totalValuation = assets.reduce((acc, a) => acc + (a.purchaseCost || 0), 0);
  
  const totalMaintenanceCost = maintenanceTickets.reduce(
    (acc, t) => acc + (Number(t.estimatedCost) || Number(t.actualCost) || 0),
    0
  );

  const activeCount = assets.filter((a) => a.status === 'Active' || a.status === 'In Use').length;
  const operationalIndex = totalAssetsCount > 0 ? ((activeCount / totalAssetsCount) * 100).toFixed(1) : '100.0';

  const pendingTicketsCount = maintenanceTickets.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;

  // 2. Chart 1: Live Condition Breakdown (Pie)
  const conditionCounts: Record<string, number> = {};
  assets.forEach((a) => {
    const cond = a.condition || 'Good';
    conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
  });
  const pieData = Object.keys(conditionCounts).map((c) => ({
    name: c,
    value: conditionCounts[c],
  }));
  const PIE_COLORS = ['#10B981', '#2563EB', '#F59E0B', '#EC4899', '#EF4444'];

  // 3. Chart 2: Live Monthly Maintenance Expenditure Trend (Area)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyCostMap: Record<string, number> = {};
  monthNames.forEach((m) => (monthlyCostMap[m] = 0));

  maintenanceTickets.forEach((t) => {
    const cost = Number(t.estimatedCost) || Number(t.actualCost) || 0;
    let monthStr = 'Jul'; // Default
    if (t.requestDate) {
      if (t.requestDate.includes('-')) {
        const parts = t.requestDate.split('-');
        if (parts.length >= 2) {
          const mIdx = parseInt(parts[1], 10) - 1;
          if (mIdx >= 0 && mIdx < 12) monthStr = monthNames[mIdx];
        }
      } else {
        monthNames.forEach((m) => {
          if (t.requestDate.toLowerCase().includes(m.toLowerCase())) monthStr = m;
        });
      }
    }
    monthlyCostMap[monthStr] = (monthlyCostMap[monthStr] || 0) + cost;
  });

  const liveMonthlyData = monthNames.map((m) => ({
    month: m,
    cost: monthlyCostMap[m] || 0,
  }));

  // 4. Chart 3: Live Department Valuation & Count Breakdown (Bar)
  const deptMap: Record<string, { count: number; valuation: number }> = {};
  assets.forEach((a) => {
    const dept = a.department || 'General';
    if (!deptMap[dept]) deptMap[dept] = { count: 0, valuation: 0 };
    deptMap[dept].count += 1;
    deptMap[dept].valuation += a.purchaseCost || 0;
  });

  const deptChartData = Object.entries(deptMap).map(([dept, data]) => ({
    name: dept.length > 14 ? dept.substring(0, 12) + '...' : dept,
    fullName: dept,
    count: data.count,
    valuationLakhs: Number((data.valuation / 100000).toFixed(2)),
  }));

  // 5. Chart 4: Maintenance Priority Breakdown (Bar)
  const priorityCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  maintenanceTickets.forEach((t) => {
    const prio = t.priority || 'Medium';
    priorityCounts[prio] = (priorityCounts[prio] || 0) + 1;
  });
  const priorityChartData = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
  }));

  // CSV Export Handlers
  const handleExportCSV = () => {
    let headers = '';
    let rows: string[] = [];
    let filename = `AIT_CAMS_Live_Report_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'department') {
      headers = 'Department Name,Total Asset Count,Total Valuation (INR),Valuation (Lakhs)';
      rows = Object.entries(deptMap).map(
        ([dept, data]) => `"${dept}",${data.count},${data.valuation},${(data.valuation / 100000).toFixed(2)}`
      );
    } else if (activeReportTab === 'maintenance') {
      headers = 'Ticket ID,Asset ID,Asset Name,Department,Problem,Priority,Estimated Cost (INR),Status,Request Date';
      rows = maintenanceTickets.map(
        (t) =>
          `"${t.id}","${t.assetId}","${t.assetName}","${t.department}","${t.problem}","${t.priority}",${t.estimatedCost},"${t.status}","${t.requestDate}"`
      );
    } else {
      headers = 'Asset ID,Asset Name,Category,Department,Building Block,Room,Purchase Cost (INR),Condition,Status';
      rows = assets.map(
        (a) =>
          `"${a.id}","${a.name}","${a.category}","${a.department}","${a.building}","${a.roomNumber}",${a.purchaseCost},"${a.condition}","${a.status}"`
      );
    }

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Filter logic for summary tables
  const filteredDeptList = Object.entries(deptMap).filter(([dept]) => {
    const matchesDeptFilter = departmentFilter === 'All' || dept === departmentFilter;
    const matchesSearch = dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeptFilter && matchesSearch;
  });

  const filteredTicketsList = maintenanceTickets.filter((t) => {
    const matchesDeptFilter = departmentFilter === 'All' || t.department === departmentFilter;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.problem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeptFilter && matchesSearch;
  });

  const filteredAssetsList = assets.filter((a) => {
    const matchesDeptFilter = departmentFilter === 'All' || a.department === departmentFilter;
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeptFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Institutional Real-Time Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
            Institutional Asset Reports & Live Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic live valuation, maintenance expenditure trends, and department condition audits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Live CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report PDF</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Valuation */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inventory Valuation
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              ₹{(totalValuation / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              Real-time DB Total: ₹{totalValuation.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Maintenance Cost */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Maintenance Desk Expenditure
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600 font-sans tracking-tight">
              ₹{totalMaintenanceCost.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1.5 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              Calculated live across {maintenanceTickets.length} service tickets
            </div>
          </div>
        </div>

        {/* Operational Rate */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Equipment Operational Index
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-blue-600 font-sans tracking-tight">
              {operationalIndex}%
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1.5 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              {activeCount} of {totalAssetsCount} assets active & in service
            </div>
          </div>
        </div>

        {/* Pending Tickets */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Repair Desk Queue
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              {pendingTicketsCount} Tickets
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
              Awaiting technician assignment or completion
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Area Chart: Live Monthly Maintenance Expenditure */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Live Monthly Maintenance Cost Trend (₹)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated service ticket expenditure dynamically derived from database records
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-semibold text-[11px] rounded-lg border border-blue-100">
              Live DB Stream
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveMonthlyData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenditure']}
                />
                <Area type="monotone" dataKey="cost" stroke="#2563EB" strokeWidth={2.5} fill="#2563EB" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Live Asset Condition Audit */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Live Asset Condition Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical condition breakdown of campus equipment
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-semibold text-[11px] rounded-lg border border-emerald-100">
              {totalAssetsCount} Items Verified
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(val: any) => [`${val} items`, 'Count']}
                />
                <Legend formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart 1: Department Valuation & Asset Count */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Department Asset Valuation (₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Capital asset cost distribution by academic and administrative departments
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {deptChartData.length} Departments
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Total Valuation']}
                />
                <Bar dataKey="valuationLakhs" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart 2: Maintenance Priority Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Maintenance Queue by Priority
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of critical, high, medium, and low priority tickets
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-600">
              {maintenanceTickets.length} Total Tickets
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="priority" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Live Reports Data Tables Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        {/* Table Toolbar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveReportTab('department')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReportTab === 'department'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Department Summary
            </button>
            <button
              onClick={() => setActiveReportTab('maintenance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReportTab === 'maintenance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Maintenance Desk Log ({maintenanceTickets.length})
            </button>
            <button
              onClick={() => setActiveReportTab('assets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeReportTab === 'assets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Asset Inventory Audit ({assets.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live records..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none w-48 sm:w-60 font-medium"
              />
            </div>

            {/* Dept Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none cursor-pointer font-medium"
            >
              <option value="All">All Departments</option>
              {Object.keys(deptMap).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Department Summary Table */}
        {activeReportTab === 'department' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Total Registered Assets</th>
                  <th className="py-3 px-4">Total Valuation (INR)</th>
                  <th className="py-3 px-4">Valuation (Lakhs)</th>
                  <th className="py-3 px-4">Share of Total Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filteredDeptList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                      No matching department report entries
                    </td>
                  </tr>
                ) : (
                  filteredDeptList.map(([dept, data]) => {
                    const pct = totalValuation > 0 ? ((data.valuation / totalValuation) * 100).toFixed(1) : '0';
                    return (
                      <tr key={dept} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{dept}</td>
                        <td className="py-3.5 px-4 font-semibold text-blue-600">{data.count} items</td>
                        <td className="py-3.5 px-4 font-mono font-medium">₹{data.valuation.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">₹{(data.valuation / 100000).toFixed(2)} Lakhs</td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">{pct}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Maintenance Desk Log Table */}
        {activeReportTab === 'maintenance' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Asset ID & Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Problem / Issue Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Estimated Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filteredTicketsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                      No maintenance ticket records found
                    </td>
                  </tr>
                ) : (
                  filteredTicketsList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{t.id}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <div>{t.assetName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.assetId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{t.department}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-800">{t.problem}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            t.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : t.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        ₹{(Number(t.estimatedCost) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{t.requestDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Asset Inventory Audit Table */}
        {activeReportTab === 'assets' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Building & Room</th>
                  <th className="py-3 px-4">Purchase Cost</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filteredAssetsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                      No matching asset inventory records found
                    </td>
                  </tr>
                ) : (
                  filteredAssetsList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{a.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{a.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{a.category}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{a.department}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{a.building} ({a.roomNumber})</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        ₹{(a.purchaseCost || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800">
                          {a.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'Active' || a.status === 'In Use'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
