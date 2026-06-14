import { User, Project, Task, TimelineEvent, Contractor, InventoryItem } from './types';

export const mockUsers: User[] = [
  { id: 'u1', email: 'owner@ppprojecthub.com', fullName: 'กฤษดา พรหมเมือง', role: 'owner', phone: '081-234-5678', avatarUrl: '/avatars/owner.png' },
  { id: 'u2', email: 'pm@ppprojecthub.com', fullName: 'กฤษดา พ.', role: 'pm', phone: '081-234-5678', avatarUrl: '/avatars/owner.png' },
  { id: 'u3', email: 'designer@ppprojecthub.com', fullName: 'นิพัทธ์ เกียรติสกุล', role: 'designer', phone: '082-345-6789', avatarUrl: '/avatars/designer.png' },
  { id: 'u4', email: 'factory@ppprojecthub.com', fullName: 'ช่างวิชัย แสงทอง', role: 'factory', phone: '083-456-7890', avatarUrl: '/avatars/factory.png' },
  { id: 'u5', email: 'installer@ppprojecthub.com', fullName: 'ช่างต้น', role: 'installer', phone: '084-567-8901', avatarUrl: '/avatars/installer.png' },
  { id: 'u6', email: 'contractor@ppprojecthub.com', fullName: 'ช่างไฟ', role: 'contractor', phone: '085-678-9012', avatarUrl: '/avatars/electrician.png' },
  { id: 'u7', email: 'customer@ppprojecthub.com', fullName: 'คุณเอก', role: 'customer', phone: '086-789-0123', avatarUrl: '/avatars/customer.png' },
  { id: 'u8', email: 'admin@ppprojecthub.com', fullName: 'สิริวัลย์ เจริญสุข', role: 'admin', phone: '087-890-1234', avatarUrl: '/avatars/admin.png' }
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'บ้านคุณเอก รามอินทรา',
    description: 'บ้านพักอาศัย 3 ชั้น',
    address: 'รามอินทรา กรุงเทพฯ',
    coverUrl: '/images/kitchen.png',
    status: 'installation',
    progress: 75,
    budget: 2650000,
    actualSpent: 1945000,
    startDate: '2026-05-01',
    dueDate: '2026-06-18',
    pmId: 'u2',
    clientId: 'u7',
    lineGroupId: 'Cabcde1234567890abcdef1234567890'
  },
  {
    id: 'p2',
    name: 'คอนโด A12 สุขุมวิท',
    description: 'คอนโดมิเนียม',
    address: 'สุขุมวิท กรุงเทพฯ',
    coverUrl: '/images/kitchen.png',
    status: 'manufacturing',
    progress: 40,
    budget: 1200000,
    actualSpent: 480000,
    startDate: '2026-05-15',
    dueDate: '2026-06-25',
    pmId: 'u2',
    clientId: 'u7'
  },
  {
    id: 'p3',
    name: 'ร้านกาแฟ The Wood',
    description: 'ร้านอาหาร / คาเฟ่',
    address: 'ราชพฤกษ์ นนทบุรี',
    coverUrl: '/images/kitchen.png',
    status: 'design',
    progress: 20,
    budget: 850000,
    actualSpent: 170000,
    startDate: '2026-06-01',
    dueDate: '2026-07-05',
    pmId: 'u2',
    clientId: 'u7'
  },
  {
    id: 'p4',
    name: 'บ้านคุณนัท บางนา',
    description: 'บ้านพักอาศัย 2 ชั้น',
    address: 'บางนา กรุงเทพฯ',
    coverUrl: '/images/kitchen.png',
    status: 'material_pending',
    progress: 10,
    budget: 3400000,
    actualSpent: 340000,
    startDate: '2026-06-05',
    dueDate: '2026-07-30',
    pmId: 'u2',
    clientId: 'u7'
  },
  {
    id: 'p5',
    name: 'โชว์รูมเฟอร์นิเจอร์',
    description: 'โชว์รูมสินค้า',
    address: 'เลียบด่วนรามอินทรา',
    coverUrl: '/images/kitchen.png',
    status: 'completion',
    progress: 80,
    budget: 1800000,
    actualSpent: 1440000,
    startDate: '2026-04-10',
    dueDate: '2026-06-30',
    pmId: 'u2',
    clientId: 'u7'
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'ติดตั้งตู้เสื้อผ้า ห้องนอน 1',
    description: 'งาน built-in ตู้เสื้อผ้าขนาดใหญ่ ห้องนอนหลักชั้น 2',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-06-13',
    assignedTo: 'u5'
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'เก็บสี บัว และซิลิโคน',
    description: 'งานเก็บรายละเอียดความเรียบร้อยของหน้าบาน ตู้และผนัง',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-06-14',
    assignedTo: 'u5'
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'ติดตั้งกระจกห้องน้ำ',
    description: 'ติดตั้งกระจกเงาบานใหญ่ห้องน้ำ 1 และ 2',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-06-16',
    assignedTo: 'u5'
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'เดินสายไฟครัว',
    description: 'ย้ายตำแหน่งปลั๊กไฟสำหรับเตาอบและเตาแก๊ส',
    status: 'done',
    priority: 'high',
    dueDate: '2026-06-12',
    assignedTo: 'u6'
  }
];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'tl5',
    projectId: 'p1',
    userId: 'u6',
    userName: 'ช่างไฟ',
    userRole: 'contractor',
    eventType: 'activity',
    content: 'เดินสายไฟครัวเสร็จแล้วครับ',
    createdAt: '2026-06-13T09:20:00Z',
    images: ['/images/kitchen.png'],
    likes: 2
  },
  {
    id: 'tl4',
    projectId: 'p1',
    eventType: 'ai_summary',
    content: 'AI สรุป : มีการเปลี่ยนแปลงสเปควัสดุ รอการอนุมัติ',
    createdAt: '2026-06-12T15:15:00Z'
  },
  {
    id: 'tl3',
    projectId: 'p1',
    userId: 'u7',
    userName: 'ลูกค้า (คุณเอก)',
    userRole: 'customer',
    eventType: 'comment',
    content: 'ขอเปลี่ยนหน้าบานเป็นสีโอ๊คอ่อนนะครับ',
    createdAt: '2026-06-12T15:10:00Z'
  },
  {
    id: 'tl2',
    projectId: 'p1',
    userId: 'u2',
    userName: 'กฤษดา (คุณ)',
    userRole: 'pm',
    eventType: 'comment',
    content: 'ดีมากครับ เก็บขอบด้านบนเพิ่มอีกนิดนึง แล้วค่อยยิงซิลิโคน ขอบคุณครับ',
    createdAt: '2026-06-12T14:02:00Z',
    repliesCount: 2,
    replies: [
      { id: 'r1', userName: 'ช่างต้น', content: 'รับทราบครับผม', createdAt: '2026-06-12T14:05:00Z' },
      { id: 'r2', userName: 'นิพัทธ์ (ดีไซเนอร์)', content: 'สวยงามลงตัวมากครับ', createdAt: '2026-06-12T14:10:00Z' }
    ]
  },
  {
    id: 'tl1',
    projectId: 'p1',
    userId: 'u5',
    userName: 'ช่างต้น',
    userRole: 'installer',
    eventType: 'photo',
    content: 'ติดตั้งตู้ครัวเรียบร้อยครับ',
    createdAt: '2026-06-12T13:45:00Z',
    images: ['/images/kitchen.png', '/images/kitchen.png', '/images/kitchen.png'],
    likes: 3
  }
];

export const mockContractors: Contractor[] = [
  { id: 'c1', name: 'หจก.แสงทอง คาร์เพนทรี', phone: '083-456-7890', rating: 4.8, jobCategory: 'built-in / carpentry', paymentStatus: 'partial', totalContractValue: 750000, performanceScore: 92 },
  { id: 'c2', name: 'ช่างไฟ สุขุมวิท เอ็นจิเนียริ่ง', phone: '085-678-9012', rating: 4.5, jobCategory: 'electrical / wiring', paymentStatus: 'paid', totalContractValue: 120000, performanceScore: 85 },
  { id: 'c3', name: 'กรุงเทพ เกลซิ่ง (กระจกและอะคริลิค)', phone: '089-012-3456', rating: 4.2, jobCategory: 'glass / acrylic', paymentStatus: 'pending', totalContractValue: 85000, performanceScore: 78 }
];

export const mockInventory: InventoryItem[] = [
  { id: 'i1', name: 'ไม้ HMR 15มม. (เกรด A)', sku: 'HMR-15-A', stockQty: 120, minStockAlert: 20, unit: 'แผ่น', category: 'wood', warehouseLocation: 'Zone A-2', status: 'in_stock' },
  { id: 'i2', name: 'บานพับถ้วย Soft-Close (Hafele)', sku: 'FIT-HP-SF', stockQty: 350, minStockAlert: 50, unit: 'ตัว', category: 'fittings', warehouseLocation: 'Zone B-1', status: 'in_stock' },
  { id: 'i3', name: 'สีกัลวาไนซ์ โจตัน (Charcoal Gray)', sku: 'PNT-JT-CG', stockQty: 8, minStockAlert: 10, unit: 'แกลลอน', category: 'paint', warehouseLocation: 'Zone C-3', status: 'low_stock' },
  { id: 'i4', name: 'กาวตะปูแรงยึดสูง Pattex', sku: 'GLU-PX-PL', stockQty: 0, minStockAlert: 15, unit: 'หลอด', category: 'paint', warehouseLocation: 'Zone C-1', status: 'out_of_stock' }
];

export const mockNotifications = [
  { id: 'n1', title: 'งานล่าช้า', message: 'งานติดตั้งครัว บ้านคุณเอก ล่าช้ากว่ากำหนด 2 วัน', isRead: false, type: 'warning', createdAt: '2026-06-13T11:20:00Z' },
  { id: 'n2', title: 'ลูกค้าแก้ไขสเปก', message: 'คุณเอก ขอเปลี่ยนหน้าบานเป็นสีโอ๊คอ่อน คอนโด A12', isRead: false, type: 'info', createdAt: '2026-06-12T15:10:00Z' },
  { id: 'n3', title: 'วัสดุใกล้หมด', message: 'สีกัลวาไนซ์ โจตัน เหลือ 8 แกลลอน (ต่ำกว่ากำหนด)', isRead: true, type: 'alert', createdAt: '2026-06-12T10:00:00Z' }
];

export const mockCalendarEvents = [
  // June 2026 Events (matching standard calendar view grid)
  { id: 'e1', date: '2026-06-01', title: 'นัดลูกค้า ตรวจแบบ', type: 'customer', time: '10:00', details: 'บ้านคุณเอก' },
  { id: 'e2', date: '2026-06-03', title: 'ติดตั้งตู้ครัว', type: 'install', time: '09:00 - 16:00', details: 'บ้านคุณเอก' },
  { id: 'e3', date: '2026-06-04', title: 'ผลิตบานตู้', type: 'manufacture', time: '08:00 - 17:00', details: 'คอนโด A12' },
  { id: 'e4', date: '2026-06-05', title: 'ส่งไม้ HMR', type: 'delivery', time: '13:00 - 15:00', details: 'โชว์รูมเฟอร์นิเจอร์' },
  { id: 'e5', date: '2026-06-07', title: 'ติดตั้งตู้เสื้อผ้า', type: 'install', time: '09:00 - 16:00', details: 'บ้านคุณเอก' },
  { id: 'e6', date: '2026-06-08', title: 'ตรวจงาน', type: 'inspection', time: '14:00', details: 'บ้านคุณเอก' },
  { id: 'e7', date: '2026-06-12', title: 'ติดตั้งตู้ครัว', type: 'install', time: '09:00 - 16:00', details: 'คอนโด A12' },
  { id: 'e8', date: '2026-06-14', title: 'นัดลูกค้า', type: 'customer', time: '10:30', details: 'ร้านกาแฟ The Wood' },
  { id: 'e9', date: '2026-06-15', title: 'ส่งของ', type: 'delivery', time: '09:00', details: 'ร้านกาแฟ The Wood' },
  { id: 'e10', date: '2026-06-17', title: 'ติดตั้งบานประตู', type: 'install', time: '09:00 - 16:00', details: 'โชว์รูมเฟอร์นิเจอร์' },
  { id: 'e11', date: '2026-06-18', title: 'นัดตรวจรับงาน', type: 'customer', time: '10:00', details: 'บ้านคุณเอก' },
  { id: 'e12', date: '2026-06-18', title: 'ผลิตบานตู้', type: 'manufacture', time: '14:00', details: 'คอนโด A12' },
  { id: 'e13', date: '2026-06-20', title: 'ตรวจงาน', type: 'inspection', time: '13:00', details: 'คอนโด A12' },
  { id: 'e14', date: '2026-06-21', title: 'ติดตั้งตู้ TV', type: 'install', time: '09:00 - 16:00', details: 'บ้านคุณนัท บางนา' },
  { id: 'e15', date: '2026-06-25', title: 'ส่งของ', type: 'delivery', time: '13:00', details: 'บ้านคุณนัท' },
  { id: 'e16', date: '2026-06-26', title: 'ติดตั้งงาน built-in', type: 'install', time: '09:00 - 16:00', details: 'บ้านคุณเอก' },
  { id: 'e17', date: '2026-06-28', title: 'ผลิตชิ้นงาน', type: 'manufacture', time: '08:00 - 17:00', details: 'ร้านกาแฟ The Wood' }
];
