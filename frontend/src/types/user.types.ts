export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  about: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  about?: string | null;
  phone?: string | null;
}
