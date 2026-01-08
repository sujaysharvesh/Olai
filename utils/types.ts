

export interface TextBox {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
}

export interface AuthRequest {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface JwtPayLoad {
  id: string;
  username: string;
  email: string;
}

export interface User {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface FolderItem {
  id: string;
  name: string;
}

export interface NoteItem {
  name: string,
  x: number,
  y: number
}

export interface NoteContextType {
  setNote: (notes : NoteItem) => void;
}

export interface FolderContextType {
  
  isOpen: boolean;
  setIsOpen : (value : boolean) => void;
  currentFolder : FolderItem;
  setCurrentFolder : (folder: FolderItem) => void;
  folders: FolderItem[];
  setFolders : (folders: FolderItem[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;

}

export interface ZoomContextType {
  zoom: number;
  setZoom: (value: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  ZOOM_STEP: number;
  MAX_ZOOM: number;
  MIN_ZOOM: number;

}