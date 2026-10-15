import { Injectable } from '@angular/core';

import { runAdminAdminDashboardScript } from './admin-admin-dashboard';
import { runAdminFundEventHandlerScript } from './admin-fund-event-handler';
import { runAdminMembersManagerScript } from './admin-members-manager';
import { runAlumniProfileAlumniProfileScript } from './alumni-profile-alumni-profile';
import { runChatChatUiScript } from './chat-chat-ui';
import { runContributeContributeScript } from './contribute-contribute';
import { runEventPageEventPageScript } from './event-page-event-page';
import { runFriendsFriendsScript } from './friends-friends';
import { runFund1FundScript } from './fund1-fund';
import { runHomePageHomePageScript } from './home-page-home-page';
import { runJobPostingJobPreferencesScript } from './job-posting-job-preferences';
import { runJobPostingJobsDisplayScript } from './job-posting-jobs-display';
import { runJobPostingManagePostingsScript } from './job-posting-manage-postings';
import { runJobPostingPostInternshipScript } from './job-posting-post-internship';
import { runJobPostingPostJobScript } from './job-posting-post-job';
import { runLoginLoginScript } from './login-login';
import { runMembersMembersScript } from './members-members';
import { runProudableAlumniProudableAlumniScript } from './proudable-alumni-proudable-alumni';

type LegacyRunner = () => void;
type LegacyWindow = Window & Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class LegacyScriptsService {
  private readonly runners = new Map<string, LegacyRunner[]>([
    ['login/login_page.html', [runLoginLoginScript]],
    ['home page/home_page.html', [runHomePageHomePageScript]],
    ['alumni profile/alumni_profile.html', [runAlumniProfileAlumniProfileScript]],
    ['chat/chat_ui.html', [runChatChatUiScript]],
    ['friends/friends.html', [runFriendsFriendsScript]],
    ['members/members.html', [runMembersMembersScript]],
    ['event page/event_page.html', [runEventPageEventPageScript]],
    ['gallery/gallery.html', []],
    ['proudable_alumni/proudable_alumni.html', [runProudableAlumniProudableAlumniScript]],
    ['fund1/fund_raising.html', [runFund1FundScript]],
    ['contribute/contribute.html', [runContributeContributeScript]],
    [
      'job_posting/job-sidebar.html',
      [runJobPostingJobPreferencesScript, runJobPostingJobsDisplayScript],
    ],
    ['job_posting/manage-postings.html', [runJobPostingManagePostingsScript]],
    ['job_posting/post-job.html', [runJobPostingPostJobScript]],
    ['job_posting/post-internship.html', [runJobPostingPostInternshipScript]],
    [
      'admin/admin_portal.html',
      [runAdminAdminDashboardScript, runAdminFundEventHandlerScript, runAdminMembersManagerScript],
    ],
  ]);

  configureGlobals(): void {
    const legacyWindow = window as unknown as LegacyWindow;
    const hostname = window.location.hostname;
    const apiBaseUrl =
      hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : `http://${hostname}:5000`;

    legacyWindow['API_BASE_URL'] = apiBaseUrl;
    legacyWindow['API_BASE'] = apiBaseUrl;
    legacyWindow['handleLogout'] = (event?: Event) => this.handleLogout(event);
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true' && Boolean(sessionStorage.getItem('loggedInUser'));
  }

  async runForPage(pagePath: string): Promise<void> {
    this.configureGlobals();

    const pageRunners = this.runners.get(pagePath) ?? [];
    for (const runner of pageRunners) {
      await this.runWithReadyHooks(runner);
    }
  }

  redirectToLegacyPath(path: string): void {
    window.location.href = `/${path}`;
  }

  private handleLogout(event?: Event): void {
    event?.preventDefault();
    sessionStorage.clear();
    this.redirectToLegacyPath('index.html');
  }

  private async runWithReadyHooks(runner: LegacyRunner): Promise<void> {
    const originalDocumentAddEventListener = document.addEventListener.bind(document);
    const originalWindowAddEventListener = window.addEventListener.bind(window);

    document.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'DOMContentLoaded') {
        queueMicrotask(() => this.invokeListener(listener, new Event('DOMContentLoaded')));
        return;
      }

      originalDocumentAddEventListener(type, listener, options);
    }) as Document['addEventListener'];

    window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'load') {
        queueMicrotask(() => this.invokeListener(listener, new Event('load')));
        return;
      }

      originalWindowAddEventListener(type, listener, options);
    }) as Window['addEventListener'];

    try {
      runner();
      await new Promise<void>((resolve) => queueMicrotask(resolve));
    } finally {
      document.addEventListener = originalDocumentAddEventListener as Document['addEventListener'];
      window.addEventListener = originalWindowAddEventListener as Window['addEventListener'];
    }
  }

  private invokeListener(listener: EventListenerOrEventListenerObject, event: Event): void {
    if (typeof listener === 'function') {
      listener.call(document, event);
      return;
    }

    listener.handleEvent(event);
  }
}
