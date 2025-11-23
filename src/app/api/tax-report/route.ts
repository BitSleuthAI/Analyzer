import { NextRequest, NextResponse } from 'next/server';
import { getTaxReport } from '@/ai/flows/tax-report-flow';
import type { TaxReportInput } from '@/ai/flows/tax-report-flow';

/**
 * POST /api/tax-report
 * Generates a basic tax report
 * 
 * Request body: TaxReportInput
 * Response: TaxReportOutput or { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body: TaxReportInput = await request.json();

    // Validate required fields
    if (!body.walletData || !body.startDate || !body.endDate || !body.currency) {
      return NextResponse.json(
        { error: 'Missing required fields: walletData, startDate, endDate, currency' },
        { status: 400 }
      );
    }

    // Generate the tax report using the server function
    const report = await getTaxReport(body);

    return NextResponse.json(report);

  } catch (error: any) {
    console.error('[Tax Report API] Error:', {
      errorMessage: error.message,
      errorStack: error.stack,
    });

    return NextResponse.json(
      { 
        error: 'Failed to generate tax report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
