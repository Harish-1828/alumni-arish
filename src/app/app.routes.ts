import { Routes } from '@angular/router';
import { FundListComponent } from './features/fundraising/pages/fund-list/fund-list.component';
import { FundDetailComponent } from './features/fundraising/pages/fund-detail/fund-detail.component';
import { ContributeComponent } from './features/fundraising/pages/contribute/contribute.component';
import { AdminFundsComponent } from './features/admin/pages/admin-funds/admin-funds.component';
import { ContributionHistoryComponent } from './features/contributions/pages/contribution-history/contribution-history.component';
import { FriendsPageComponent } from './features/friends/pages/friends-page/friends-page.component';
import { EventsPageComponent } from './features/events/pages/events-page/events-page.component';
import { JobsPageComponent } from './features/jobs/pages/jobs-page/jobs-page.component';
import { ProfilePageComponent } from './features/profile/pages/profile-page/profile-page.component';
import { ChatPageComponent } from './features/chat/pages/chat-page/chat-page.component';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { MembersPageComponent } from './features/members/pages/members-page/members-page.component';
import { ProudableAlumniPageComponent } from './features/proudable-alumni/pages/proudable-alumni-page/proudable-alumni-page.component';
import { GalleryPageComponent } from './features/gallery/pages/gallery-page/gallery-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    component: HomePageComponent,
    title: 'Home - Mepco Alumni Network',
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Login - Mepco Alumni Network',
  },
  {
    path: 'fundraising',
    component: FundListComponent,
    title: 'Fundraising Initiatives - Mepco Alumni Network',
  },
  {
    path: 'fundraising/:id',
    component: FundDetailComponent,
    title: 'Campaign Details - Mepco Alumni Network',
  },
  {
    path: 'contribute',
    component: ContributeComponent,
    title: 'Contribute - Mepco Alumni Network',
  },
  {
    path: 'contribute/:fundId',
    component: ContributeComponent,
    title: 'Contribute - Mepco Alumni Network',
  },
  {
    path: 'contributions',
    component: ContributionHistoryComponent,
    title: 'Contributions Ledger - Mepco Alumni Network',
  },
  {
    path: 'admin/funds',
    component: AdminFundsComponent,
    title: 'Campaigns Admin Portal - Mepco Alumni Network',
  },
  {
    path: 'friends',
    component: FriendsPageComponent,
    title: 'Alumni Friends & Connections - Mepco Alumni Network',
  },
  {
    path: 'events',
    component: EventsPageComponent,
    title: 'Reunions & Events - Mepco Alumni Network',
  },
  {
    path: 'jobs',
    component: JobsPageComponent,
    title: 'Careers & Job Board - Mepco Alumni Network',
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    title: 'Alumni Directory & Profile - Mepco Alumni Network',
  },
  {
    path: 'chat',
    component: ChatPageComponent,
    title: 'Messages - Mepco Alumni Network',
  },
  {
    path: 'members',
    component: MembersPageComponent,
    title: 'Faculty Members - Mepco Alumni Network',
  },
  {
    path: 'proudable-alumni',
    component: ProudableAlumniPageComponent,
    title: 'Proudable Alumni - Mepco Alumni Network',
  },
  {
    path: 'gallery',
    component: GalleryPageComponent,
    title: 'Gallery - Mepco Alumni Network',
  },
  // Legacy URL compatibility redirects
  { path: 'home page/home_page.html', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login/login_page.html', redirectTo: 'login', pathMatch: 'full' },
  { path: 'friends/friends.html', redirectTo: 'friends', pathMatch: 'full' },
  { path: 'event page/event_page.html', redirectTo: 'events', pathMatch: 'full' },
  { path: 'job_posting/job-sidebar.html', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'alumni profile/alumni_profile.html', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'chat/chat_ui.html', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'fund1/fund_raising.html', redirectTo: 'fundraising', pathMatch: 'full' },
  { path: 'contribute/contribute.html', redirectTo: 'contribute', pathMatch: 'full' },
  { path: 'members/members.html', redirectTo: 'members', pathMatch: 'full' },
  { path: 'proudable_alumni/proudable_alumni.html', redirectTo: 'proudable-alumni', pathMatch: 'full' },
  { path: 'gallery/gallery.html', redirectTo: 'gallery', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: 'home',
  },
];
