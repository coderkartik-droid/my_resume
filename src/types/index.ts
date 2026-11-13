export interface Project {
  id: string;
  title: string;
  slug: string;
  order: number;
  displayNumber: string;
  category: string;
  shortDesc: string;
  fullDesc?: string | null;
  objectives?: string | null;
  problem?: string | null;
  solution?: string | null;
  keyFeatures?: string | null;
  challenges?: string | null;
  techStack: string;
  thumbnailUrl?: string | null;
  screenshots?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  documentationUrl?: string | null;
  videoDemoUrl?: string | null;
  status: string;
  featured: boolean;
  published: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  files?: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileDescription?: string | null;
  storagePath: string;
  downloadUrl: string;
  buttonText: string;
  version?: string | null;
  visible: boolean;
  order: number;
  downloadCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DownloadLog {
  id: string;
  fileId: string;
  ip?: string | null;
  userAgent?: string | null;
  createdAt?: string | Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level?: string | null;
  icon?: string | null;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Experience {
  id: string;
  type: string; // 'work' | 'education' | 'achievement'
  role: string;
  organization: string;
  location?: string | null;
  period: string;
  description: string;
  skills?: string | null;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  features?: string | null;
  order: number;
  createdAt?: string | Date;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string | Date;
}

export interface Profile {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  aboutStory?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  email: string;
  phone?: string | null;
  location: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  websiteTitle: string;
  footerText: string;
  updatedAt?: string | Date;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string | null;
  quote: string;
  rating: number;
  featured: boolean;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string | null;
  badgeUrl?: string | null;
  skills?: string | null;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  coverUrl?: string | null;
  audioUrl: string;
  storagePath?: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  duration?: number | null;
  order: number;
  enabled: boolean;
  isDefault: boolean;
  playlist: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MusicConfig {
  id: string;
  enabled: boolean;
  showTopbarToggle: boolean;
  defaultTrackId?: string | null;
  defaultVolume: number;
  autoplayAttempt: boolean;
  loop: boolean;
  shuffle: boolean;
  playbackMode: string;
  activePlaylist: string;
  buttonStyle: string;
  buttonPosition: string;
  maxUploadSizeMb: number;
  updatedAt?: string | Date;
}

export * from "./theme";


