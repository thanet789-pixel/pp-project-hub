// PP PROJECT HUB Types definitions

export type UserRole = 'owner' | 'admin' | 'pm' | 'designer' | 'factory' | 'installer' | 'contractor' | 'customer';

export type ProjectStatus = 'design' | 'manufacturing' | 'installation' | 'completion' | 'delay' | 'review' | 'material_pending';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MessageType = 'text' | 'image' | 'file' | 'voice';

export type TimelineEventType = 'activity' | 'comment' | 'photo' | 'file' | 'system' | 'ai_summary';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  lineUserId?: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  address: string;
  coverUrl: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  actualSpent: number;
  startDate: string;
  dueDate: string;
  pmId: string;
  clientId: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleInProject: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: string; // User ID
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  userId?: string; // User ID
  userName?: string; // Cache for UI
  userRole?: UserRole; // Cache for UI
  avatarUrl?: string;
  eventType: TimelineEventType;
  content: string;
  referenceId?: string;
  createdAt: string;
  images?: string[];
  likes?: number;
  repliesCount?: number;
  replies?: TimelineReply[];
}

export interface TimelineReply {
  id: string;
  userName: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rating: number;
  jobCategory: string;
  contractUrl?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  totalContractValue: number;
  performanceScore: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  minStockAlert: number;
  unit: string;
  category: string;
  warehouseLocation: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}
