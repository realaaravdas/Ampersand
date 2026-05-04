import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AmpDocument } from '@/types/document';
import { serializeToAmp, deserializeFromAmp } from '@/lib/ampFormat';

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

function filePath(id: string) {
  // Sanitize id to prevent path traversal
  const safe = id.replace(/[^a-zA-Z0-9\-]/g, '');
  if (!safe) {
    throw new Error('Invalid document ID');
  }
  return path.join(DOCUMENTS_DIR, `${safe}.amp`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const raw = await fs.readFile(filePath(id), 'utf-8');
    return NextResponse.json(deserializeFromAmp(raw));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const raw = await fs.readFile(filePath(id), 'utf-8');
    const existing: AmpDocument = deserializeFromAmp(raw);
    const updates = await req.json();
    const updated: AmpDocument = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(filePath(id), serializeToAmp(updated), 'utf-8');
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await fs.unlink(filePath(id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
