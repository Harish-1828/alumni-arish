export interface Fund {
  _id: string;
  id?: string;
  title: string;
  description: string;
  image?: string;
  goal: number;
  raised: number;
  contributors: number;
  date?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateFundDto {
  title: string;
  description: string;
  goal: number;
  image?: string;
}

export interface UpdateFundDto {
  title?: string;
  description?: string;
  goal?: number;
  image?: string;
}

export interface FundStats {
  totalGoal: number;
  totalRaised: number;
  totalContributors: number;
  activeCampaigns: number;
  overallProgress: number;
}
