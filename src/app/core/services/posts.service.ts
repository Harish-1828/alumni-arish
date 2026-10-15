import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Post, Announcement } from '../models/post.model';

const INITIAL_POSTS: Post[] = [
  {
    _id: 'p1',
    author: 'Alumni Association',
    content: 'Welcome to the Annual Alumni Homecoming 2026! Registration is now live across all batches.',
    time: '2 hours ago',
    imageUrl: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'p2',
    author: 'Career Development Cell',
    content: 'Excited to announce over 50 top-tier tech internships posted by our alumni community this week!',
    time: 'Yesterday',
    imageUrl: '',
    createdAt: new Date().toISOString(),
  },
];

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/posts';

  readonly posts = signal<Post[]>(INITIAL_POSTS);
  readonly announcements = signal<Announcement[]>([
    { _id: 'a1', title: 'Campus Placements 2026 Phase-1 Schedule Released', link: '/jobs' },
    { _id: 'a2', title: 'Silver Jubilee Alumni Meet Registrations', link: '/events' },
    { _id: 'a3', title: 'New Robotics Lab Inauguration Sponsored by Alumni', link: '/fundraising' },
  ]);

  fetchPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data && data.length > 0) {
          this.posts.set(data.slice().reverse());
        }
      }),
      catchError(() => of(this.posts()))
    );
  }

  createPost(author: string, content: string): Observable<Post> {
    const newPost: Post = {
      _id: 'p_' + Date.now(),
      author,
      content,
      time: 'Just now',
      createdAt: new Date().toISOString(),
    };
    return this.http.post<Post>(this.apiUrl, newPost).pipe(
      tap((res) => {
        this.posts.update((list) => [res, ...list]);
      }),
      catchError(() => {
        this.posts.update((list) => [newPost, ...list]);
        return of(newPost);
      })
    );
  }
}

