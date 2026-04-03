export interface PostImage {
  id: string;
  url: string;
  order: number;
}

export interface Post {
  id: string;
  content: string;
  images: PostImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  images?: File[];
}

export interface UpdatePostData {
  content?: string;
  images?: File[];
  removeImageIds?: string[];
}
