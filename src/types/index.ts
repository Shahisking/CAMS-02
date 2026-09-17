export type Role = 'Admin' | 'Principal' | 'Dean' | 'HOD' | 'Staff' | 'Technician' | 'Monitor' | 'System Monitor';

export type Department =
  | 'Computer Science & Engineering'
  | 'Information Technology'
  | 'Electronics & Communication'
  | 'Electrical & Electronics'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Artificial Intelligence & Data Science'
  | 'Administrative Office'
  | 'Central Library'
  | 'Hostel Management'
  | 'Physical Education'
  | 'General';

export interface BlockItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  lastUpdated: string;
}

export type FloorName = 'Ground Floor' | 'First Floor' | 'Second Floor' | 'Third Floor' | 'Fourth Floor';

export type RoomType =
  | 'Classroom'
  | 'Laboratory'
  | 'Staff Room'
  | 'Seminar Hall'
  | 'Office'
  | 'Store Room'
  | 'Server Room'
  | 'Library';

export type RoomStatus = 'Active' | 'Occupied' | 'Vacant' | 'Under Maintenance' | 'Under Renovation';

export interface RoomItem {
  id: string;
  roomNumber: string;
  roomName: string;
  block: string;
  floor: FloorName;
  department: Department;
  capacity: number;
  roomType: RoomType;
  status: RoomStatus;
  description?: string;
}

export type Building = string;

export const BUILDING_BLOCKS: Building[] = [
  'A Block',
  'E Block',
  'M Block',
  'N Block',
  'S Block',
  'W Block',
  'Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
];

export type CategoryType =
  | 'Bench'
  | 'Chair'
  | 'Table'
  | 'Computer'
  | 'Projector'
  | 'Printer'
  | 'Laboratory Equipment'
  | 'Sports Equipment'
  | 'Library Assets'
  | 'Hostel Assets'
  | 'Electrical Equipment'
  | 'Fans'
  | 'LED Lights'
  | 'Mini Notice Board'
  | 'Dustbin'
  | 'Student Bench'
  | 'Open Rack'
  | 'Closed Bureau'
  | 'Projector Screen'
  | 'Black Board'
  | 'Computer Table'
  | 'Fire Extinguisher'
  | 'Staff Cabin Table'
  | 'Staff Table'
  | 'Small Bench'
  | 'Long Bench'
  | 'Drawer'
  | 'First Aid Kit Box'
  | 'White Board'
  | 'Cupboard'
  | 'Long Lab Switch Table'
  | 'Lab Stool'
  | 'Washbasin'
  | 'Microphone Speaker'
  | 'Camera'
  | 'Speaker'
  | 'Other Assets';

export type ChairType = 'Normal Chair' | 'Plastic Chair' | 'Cushion Chair' | 'Rolling Chair';

export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';

export type AssetStatus = 'Active' | 'In Use' | 'Under Maintenance' | 'Damaged' | 'Lost' | 'Written Off';

export interface Asset {
  id: string; // e.g. "AIT-CSE-101"
  name: string;
  category: CategoryType;
  chair_type_id?: ChairType;
  department: Department;
  building: Building;
  floor?: FloorName;
  roomNumber: string;
  location?: string; // alias for roomNumber for compatibility
  purchaseDate?: string;
  purchaseCost: number; // in INR ₹
  vendor: string;
  warrantyExpiry: string;
  condition: AssetCondition;
  status: AssetStatus;
  assignedTo?: string; // e.g. "Dr. R. Sundaram (HOD CSE)" or "Lab 3"
  assignedType: 'Faculty' | 'Department' | 'Lab' | 'Classroom' | 'Hostel' | 'Store Room';
  qrCodeUrl?: string;
  imageUrl?: string;
  specifications?: string;
  lastInspected?: string;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';

export interface MaintenanceTicket {
  id: string;
  assetId: string;
  assetName: string;
  department: Department;
  problem: string;
  priority: MaintenancePriority;
  assignedTechnician: string;
  estimatedCost: number;
  actualCost?: number;
  status: MaintenanceStatus;
  requestedBy: string;
  requestDate: string;
  completedDate?: string;
  remarks?: string;
}

export interface AllocationHistory {
  id: string;
  assetId: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  fromAssignee: string;
  toAssignee: string;
  transferredBy: string;
  date: string;
  reason: string;
}

export interface HistoryEvent {
  id: string;
  assetId: string;
  type: 'Purchase' | 'Allocation' | 'Transfer' | 'Repair' | 'Inspection' | 'Maintenance' | 'Disposal' | 'Status Change';
  title: string;
  description: string;
  performedBy: string;
  date: string;
  cost?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  department: Department;
  staffId: string;
  mobile: string;
  role: Role;
  avatar?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  category: 'Asset Added' | 'Maintenance Due' | 'Warranty Expired' | 'QR Scan Success' | 'Low Inventory' | 'Lost Asset' | 'Maintenance';
  timestamp: string;
  read: boolean;
  assetId?: string;
  recipientRole?: Role;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  maintenanceAlerts: boolean;
  sessionTimeoutMinutes: number;
  collegeName: string;
  collegeCode: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  academicYear: string;
}

export interface AuditLog {
  id: string;
  user: string;
  userEmail: string;
  role: Role;
  department: string;
  action: 'Login' | 'Logout' | 'Asset Creation' | 'Asset Update' | 'Asset Transfer' | 'Maintenance Request' | 'Approval' | 'Deletion' | string;
  details: string;
  ipAddress: string;
  timestamp: string;
}



