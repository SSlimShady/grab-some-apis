import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'grab-some-apis-web',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
}
