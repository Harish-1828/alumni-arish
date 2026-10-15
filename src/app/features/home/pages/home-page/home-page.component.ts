import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../../../core/services/posts.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  private postsService = inject(PostsService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  readonly user = this.authService.currentUser;
  readonly posts = this.postsService.posts;
  readonly announcements = this.postsService.announcements;

  newPostContent = signal('');

  ngOnInit(): void {
    this.postsService.fetchPosts().subscribe();
  }

  submitPost(): void {
    const text = this.newPostContent().trim();
    if (!text) {
      this.notify.warning('Please enter some text for your post');
      return;
    }
    const author = this.user()?.name || 'Mepco Alumnus';
    this.postsService.createPost(author, text).subscribe({
      next: () => {
        this.newPostContent.set('');
        this.notify.success('Post shared with alumni community!');
      },
    });
  }
}

