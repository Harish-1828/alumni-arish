export interface Post {
  _id?: string;
  author: string;
  content: string;
  time?: string;
  imageUrl?: string;
  createdAt?: string | Date;
}

export interface Announcement {
  _id?: string;
  title: string;
  link?: string;
  date?: string;
}

