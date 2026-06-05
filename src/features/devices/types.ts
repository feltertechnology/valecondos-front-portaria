import {
  Camera as CameraIcon, ScanFace, Radar, DoorClosed, DoorOpen, Bell, Cpu,
  Shield, Phone, Fingerprint, CreditCard, KeyRound, Car,
  type LucideIcon,
} from 'lucide-react';

export interface DeviceType {
  id: number;
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultPort: number;
  protocols: string[];
}

export const DEVICE_TYPES: DeviceType[] = [
  { id: 0, key: 'controladora',  label: 'Controladora',  icon: Cpu,         description: 'Cérebro do controle de acesso', defaultPort: 80, protocols: ['HTTP', 'ISAPI', 'TCP'] },
  { id: 1, key: 'leitor_facial', label: 'Leitor Facial', icon: ScanFace,    description: 'Reconhecimento facial 1:N',     defaultPort: 80, protocols: ['HTTP', 'CGI', 'TCP'] },
  { id: 2, key: 'camera',        label: 'Câmera',        icon: CameraIcon,  description: 'CFTV — gravação e LPR',         defaultPort: 554, protocols: ['RTSP', 'ONVIF', 'HTTP'] },
  { id: 3, key: 'antena_rfid',   label: 'Antena RFID',   icon: Radar,       description: 'Leitura veicular UHF',          defaultPort: 4001, protocols: ['TCP', 'TCP/IP'] },
  { id: 4, key: 'cancela',       label: 'Cancela',       icon: DoorClosed,  description: 'Garagem / entrada veicular',    defaultPort: 80, protocols: ['HTTP', 'Relê'] },
  { id: 5, key: 'portao',        label: 'Portão',        icon: DoorOpen,    description: 'Portão social / serviço',       defaultPort: 80, protocols: ['HTTP', 'Relê'] },
  { id: 6, key: 'interfone',     label: 'Interfone',     icon: Phone,       description: 'Comunicação IP / SIP',          defaultPort: 5060, protocols: ['SIP', 'HTTP'] },
  { id: 7, key: 'sensor',        label: 'Sensor',        icon: Bell,        description: 'Movimento / abertura',          defaultPort: 80, protocols: ['HTTP', 'Z-Wave'] },
  { id: 8, key: 'cerca',         label: 'Cerca Elétrica',icon: Shield,      description: 'Perímetro / choque',            defaultPort: 80, protocols: ['HTTP', 'TCP'] },
];

export interface DeviceVendor {
  id: number;
  key: string;
  label: string;
  initials: string;
  color: string;
  defaultProtocol: string;
  models: string[];
}

export const DEVICE_VENDORS: DeviceVendor[] = [
  { id: 0, key: 'hikvision',  label: 'Hikvision',   initials: 'HK', color: 'bg-red-600',    defaultProtocol: 'ISAPI',  models: ['DS-2CD2143', 'DS-K1T804', 'DS-K1T671'] },
  { id: 1, key: 'intelbras',  label: 'Intelbras',   initials: 'IB', color: 'bg-emerald-600',defaultProtocol: 'Manager',models: ['VR5000', 'iX5 SS', 'XPE 1013 PLUS'] },
  { id: 2, key: 'control_id', label: 'Control iD',  initials: 'iD', color: 'bg-violet-600', defaultProtocol: 'CGI',    models: ['iDAccess Pro', 'iDFace', 'iDBlock'] },
  { id: 3, key: 'zkteco',     label: 'ZKTeco',      initials: 'ZK', color: 'bg-blue-700',   defaultProtocol: 'PUSH',   models: ['SpeedFace V5L', 'F22', 'inBio 460'] },
  { id: 4, key: 'nice',       label: 'Nice',        initials: 'Ni', color: 'bg-orange-600', defaultProtocol: 'TTBus',  models: ['ROAD400', 'M-FAB', 'Apollo'] },
  { id: 5, key: 'ppa',        label: 'PPA',         initials: 'PP', color: 'bg-amber-600',  defaultProtocol: 'Relê',   models: ['Brutus', 'Dino', 'Penta'] },
  { id: 6, key: 'linear_hcs', label: 'Linear HCS',  initials: 'LH', color: 'bg-yellow-700', defaultProtocol: 'HCS-NET',models: ['HCS-2008', 'Guarita IP'] },
  { id: 7, key: 'wisenet',    label: 'Wisenet',     initials: 'Ws', color: 'bg-slate-700',  defaultProtocol: 'ONVIF',  models: ['XNB-6005', 'XNV-8080R'] },
  { id: 8, key: 'dahua',      label: 'Dahua',       initials: 'Da', color: 'bg-rose-700',   defaultProtocol: 'DSS',    models: ['IPC-HFW1431S', 'DH-ASI7213X-T1'] },
];

export interface CredentialType {
  id: number;
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const CREDENTIAL_TYPES: CredentialType[] = [
  { id: 0, key: 'facial',    label: 'Facial',         icon: ScanFace,    description: 'Reconhecimento facial — sem contato' },
  { id: 1, key: 'biometria', label: 'Biometria',      icon: Fingerprint, description: 'Impressão digital — 1:1 ou 1:N' },
  { id: 2, key: 'qrcode',    label: 'QR Code',        icon: KeyRound,    description: 'QR rotativo no app do morador' },
  { id: 3, key: 'rfid',      label: 'Tag RFID',       icon: CreditCard,  description: 'Cartão de proximidade ou tag UHF' },
  { id: 4, key: 'controle',  label: 'Controle Remoto',icon: Radar,       description: 'Pareamento de controle 433 MHz' },
  { id: 5, key: 'senha',     label: 'Senha',          icon: KeyRound,    description: 'PIN numérico (4–8 dígitos)' },
  { id: 6, key: 'placa',     label: 'Placa Veicular', icon: Car,         description: 'OCR de placa — Mercosul + antigas' },
];
