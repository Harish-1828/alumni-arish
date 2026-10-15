import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  year: string;
}

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-page.component.html',
  styleUrls: ['./gallery-page.component.css'],
})
export class GalleryPageComponent {
  galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: 'Mepco Silver Jubilee Auditorium',
      category: 'Campus',
      imageUrl: '/images/clg_image.png',
      year: '2024',
    },
    {
      id: 2,
      title: 'Annual Alumni Homecoming Celebration',
      category: 'Reunion',
      imageUrl: '/images/clg_header.png',
      year: '2023',
    },
    {
      id: 3,
      title: 'Main Academic Block & Innovation Hub',
      category: 'Infrastructure',
      imageUrl: '/images/clg_image.png',
      year: '2022',
    },
    {
      id: 4,
      title: 'Graduation Day Ceremony',
      category: 'Milestone',
      imageUrl: '/images/clg_header.png',
      year: '2024',
    },
  ];
}

