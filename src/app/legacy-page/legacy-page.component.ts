import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LegacyScriptsService } from '../legacy-scripts/legacy-scripts.service';

type ParsedLegacyPage = {
  body: string;
  stylesheets: string[];
};

@Component({
  selector: 'app-legacy-page',
  standalone: true,
  imports: [CommonModule],
  template: '<main #pageHost class="legacy-page-host"></main>',
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .legacy-page-host {
        min-height: 100vh;
      }
    `,
  ],
})
export class LegacyPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pageHost', { static: true })
  private readonly pageHost!: ElementRef<HTMLElement>;

  private readonly routerSubscription?: Subscription;
  private readonly activeStyles = new Set<HTMLLinkElement>();
  private viewReady = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly legacyScripts: LegacyScriptsService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.routerSubscription = this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => {
          if (this.viewReady) {
            void this.loadCurrentPage();
          }
        });
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.viewReady = true;
    void this.loadCurrentPage();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.clearStylesheets();
  }

  private async loadCurrentPage(): Promise<void> {
    const pagePath = this.resolvePagePath();

    if (this.requiresAuthentication(pagePath) && !this.legacyScripts.isAuthenticated()) {
      this.legacyScripts.redirectToLegacyPath('login/login_page.html');
      return;
    }

    this.legacyScripts.configureGlobals();

    try {
      const response = await fetch(`/legacy-pages/${this.encodeLegacyPath(pagePath)}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Unable to load ${pagePath}`);
      }

      const parsed = this.parseLegacyHtml(await response.text(), pagePath);
      this.mountStylesheets(parsed.stylesheets);
      this.pageHost.nativeElement.innerHTML = parsed.body;

      await this.legacyScripts.runForPage(pagePath);
    } catch (error) {
      console.error(error);
      this.pageHost.nativeElement.innerHTML = `
        <section style="min-height:100vh;display:grid;place-items:center;font-family:Arial,sans-serif;background:#f7f8fb;color:#1f2937;padding:24px;">
          <div style="max-width:560px;text-align:center;">
            <h1 style="margin:0 0 12px;font-size:32px;">Page not found</h1>
            <p style="margin:0 0 20px;color:#64748b;">The requested alumni page could not be loaded.</p>
            <a href="/" style="color:#1651a7;font-weight:700;">Return home</a>
          </div>
        </section>
      `;
    }
  }

  private resolvePagePath(): string {
    const configured = this.route.snapshot.data['legacyPage'];
    if (typeof configured === 'string') {
      return configured;
    }

    const rawPath = decodeURI(this.router.url.split('?')[0].replace(/^\/+/, ''));
    return rawPath || 'index.html';
  }

  private requiresAuthentication(pagePath: string): boolean {
    const publicPages = new Set(['index.html', 'login/login_page.html']);
    return !publicPages.has(pagePath);
  }

  private parseLegacyHtml(html: string, pagePath: string): ParsedLegacyPage {
    const documentParser = new DOMParser();
    const parsedDocument = documentParser.parseFromString(html, 'text/html');

    parsedDocument.querySelectorAll('script').forEach((script) => script.remove());

    const stylesheets = Array.from(parsedDocument.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map((link) => this.resolveLegacyAssetPath(link.getAttribute('href') ?? '', pagePath))
      .filter(Boolean);

    parsedDocument.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());

    return {
      body: parsedDocument.body.innerHTML,
      stylesheets,
    };
  }

  private mountStylesheets(stylesheets: string[]): void {
    this.clearStylesheets();

    for (const href of stylesheets) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset['legacyStylesheet'] = 'true';
      document.head.appendChild(link);
      this.activeStyles.add(link);
    }
  }

  private clearStylesheets(): void {
    for (const link of this.activeStyles) {
      link.remove();
    }

    this.activeStyles.clear();
  }

  private resolveLegacyAssetPath(assetPath: string, pagePath: string): string {
    if (!assetPath || assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
      return assetPath;
    }

    const normalizedPagePath = pagePath.split('/').map(encodeURIComponent).join('/');
    return new URL(assetPath, `${window.location.origin}/${normalizedPagePath}`).pathname;
  }

  private encodeLegacyPath(pagePath: string): string {
    return pagePath.split('/').map(encodeURIComponent).join('/');
  }
}
