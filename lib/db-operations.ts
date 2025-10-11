// Example usage of Prisma models
// This file demonstrates how to use the defined models

import prisma from './prisma';
import { EngagementStatus, PBCRequestStatus } from './types';

// Example: Create a new engagement
export async function createEngagement(data: {
  code: string;
  title: string;
  objective: string;
  scope: any;
  criteria: any;
  constraints: any;
  auditeeUnits: any;
  stakeholders: any;
  startDate: Date;
  endDate: Date;
  budgetHours: number;
  createdBy: string;
  independenceDisclosureUrl?: string;
}) {
  try {
    const engagement = await prisma.engagement.create({
      data: {
        code: data.code,
        title: data.title,
        objective: data.objective,
        scopeJson: data.scope,
        criteriaJson: data.criteria,
        constraintsJson: data.constraints,
        auditeeUnitsJson: data.auditeeUnits,
        stakeholdersJson: data.stakeholders,
        startDate: data.startDate,
        endDate: data.endDate,
        budgetHours: data.budgetHours,
        createdBy: data.createdBy,
        independenceDisclosureUrl: data.independenceDisclosureUrl,
        status: EngagementStatus.DRAFT,
      },
    });
    return engagement;
  } catch (error) {
    console.error('Error creating engagement:', error);
    throw error;
  }
}

// Example: Get all engagements
export async function getEngagements() {
  try {
    const engagements = await prisma.engagement.findMany({
      include: {
        plans: true,
        pbcRequests: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return engagements;
  } catch (error) {
    console.error('Error fetching engagements:', error);
    throw error;
  }
}

// Example: Create a plan for an engagement
export async function createPlan(data: {
  engagementId: string;
  timeline: any;
  milestones: any;
  communicationCadence: string;
  dataStrategy: any;
  raci: any;
}) {
  try {
    const plan = await prisma.plan.create({
      data: {
        engagementId: data.engagementId,
        timelineJson: data.timeline,
        milestonesJson: data.milestones,
        communicationCadence: data.communicationCadence,
        dataStrategyJson: data.dataStrategy,
        raciJson: data.raci,
      },
    });
    return plan;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

// Example: Create a PBC request
export async function createPBCRequest(data: {
  engagementId: string;
  code: string;
  description: string;
  ownerId: string;
  dueDate: Date;
  attachments: any;
  notes?: string;
}) {
  try {
    const pbcRequest = await prisma.pBCRequest.create({
      data: {
        engagementId: data.engagementId,
        code: data.code,
        description: data.description,
        ownerId: data.ownerId,
        dueDate: data.dueDate,
        attachmentsJson: data.attachments,
        notes: data.notes,
        status: PBCRequestStatus.OPEN,
      },
    });
    return pbcRequest;
  } catch (error) {
    console.error('Error creating PBC request:', error);
    throw error;
  }
}

// Example: Get PBC requests for an engagement
export async function getPBCRequestsByEngagement(engagementId: string) {
  try {
    const pbcRequests = await prisma.pBCRequest.findMany({
      where: {
        engagementId: engagementId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    return pbcRequests;
  } catch (error) {
    console.error('Error fetching PBC requests:', error);
    throw error;
  }
}
