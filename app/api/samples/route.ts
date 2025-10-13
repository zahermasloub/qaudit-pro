import { createHash } from 'crypto';

import { samplingSchema } from '@/features/program/sampling/sampling.schema';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const v = samplingSchema.parse(body);

    // Generate SHA256 hash of selection criteria
    const criteriaString = JSON.stringify({
      method: v.method,
      populationSize: v.populationSize,
      sampleSize: v.sampleSize,
      confidenceLevel: v.confidenceLevel,
      precisionRate: v.precisionRate,
      criteria: v.criteria || {},
      timestamp: new Date().toISOString(),
    });

    const selectionHash = createHash('sha256').update(criteriaString).digest('hex');

    // Generate mock sample items based on method
    const generateSampleItems = () => {
      const items = [];
      for (let i = 1; i <= v.sampleSize; i++) {
        switch (v.method) {
          case 'random':
            items.push({
              itemId: `ITEM-${String(Math.floor(Math.random() * v.populationSize) + 1).padStart(4, '0')}`,
              amount: Math.floor(Math.random() * 10000) + 100,
              selected: true,
            });
            break;
          case 'judgment':
            items.push({
              itemId: `HIGH-RISK-${String(i).padStart(3, '0')}`,
              riskLevel: 'high',
              amount: Math.floor(Math.random() * 50000) + 10000,
              selected: true,
            });
            break;
          case 'monetary':
            items.push({
              itemId: `MU-${String(i).padStart(4, '0')}`,
              amount: Math.floor(Math.random() * 100000) + 50000,
              cumulative: i * 75000,
              selected: true,
            });
            break;
        }
      }
      return items;
    };

    const created = await prisma.sample.create({
      data: {
        testId: v.testId,
        method: v.method,
        populationSize: v.populationSize,
        sampleSize: v.sampleSize,
        confidenceLevel: v.confidenceLevel || 0.95,
        precisionRate: v.precisionRate || 0.05,
        selectionHash,
        criteriaJson: v.criteria || {},
        itemsJson: generateSampleItems(),
        notes: v.notes || null,
      },
    });

    return Response.json(
      {
        ok: true,
        id: created.id,
        hash: selectionHash,
        sampleSize: created.sampleSize,
        method: created.method,
      },
      { status: 200 },
    );
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message || e?.message || 'Invalid';
    return Response.json({ ok: false, error: msg }, { status: 400 });
  }
}
