export interface Application {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    events?: number;
    devices?: number;
  };
}
