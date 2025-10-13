export async function GET() {
  return Response.json({
    message: 'QAudit Pro API',
    version: '1.0.0',
    status: 'running',
  });
}
