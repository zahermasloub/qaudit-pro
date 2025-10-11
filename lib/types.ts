// Type definitions for Prisma models
// These will be auto-generated after running prisma generate

export type Engagement = {
  id: string;
  code: string;
  title: string;
  objective: string;
  scopeJson: any;
  criteriaJson: any;
  constraintsJson: any;
  auditeeUnitsJson: any;
  stakeholdersJson: any;
  startDate: Date;
  endDate: Date;
  budgetHours: number;
  independenceDisclosureUrl?: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Plan = {
  id: string;
  engagementId: string;
  timelineJson: any;
  milestonesJson: any;
  communicationCadence: string;
  dataStrategyJson: any;
  raciJson: any;
  createdAt: Date;
  updatedAt: Date;
};

export type PBCRequest = {
  id: string;
  engagementId: string;
  code: string;
  description: string;
  ownerId: string;
  dueDate: Date;
  status: string;
  attachmentsJson: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Enums for status fields
export const EngagementStatus = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

export const PBCRequestStatus = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue"
} as const;

export type EngagementStatusType = typeof EngagementStatus[keyof typeof EngagementStatus];
export type PBCRequestStatusType = typeof PBCRequestStatus[keyof typeof PBCRequestStatus];