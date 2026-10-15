import { Routes } from '@angular/router';
import { FundListComponent } from './features/fundraising/pages/fund-list/fund-list.component';
import { FundDetailComponent } from './features/fundraising/pages/fund-detail/fund-detail.component';
import { ContributeComponent } from './features/fundraising/pages/contribute/contribute.component';
import { AdminFundsComponent } from './features/admin/pages/admin-funds/admin-funds.component';
import { ContributionHistoryComponent } from './features/contributions/pages/contribution-history/contribution-history.component';
import { LegacyPageComponent } from './legacy-page/legacy-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'fundraising',
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
    path: '**',
    component: LegacyPageComponent,
  },
];
