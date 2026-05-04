import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AmpDocument } from '@/types/document';
import { serializeToAmp, deserializeFromAmp } from '@/lib/ampFormat';

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

async function ensureDir() {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
}

export async function GET() {
  await ensureDir();
  try {
    const files = await fs.readdir(DOCUMENTS_DIR);
    const ampFiles = files.filter((f) => f.endsWith('.amp'));
    const docs: AmpDocument[] = [];
    for (const file of ampFiles) {
      try {
        const raw = await fs.readFile(path.join(DOCUMENTS_DIR, file), 'utf-8');
        docs.push(deserializeFromAmp(raw));
      } catch {
        // skip corrupt files
      }
    }
    docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDir();
  const body = await req.json();
  const now = new Date().toISOString();
  const doc: AmpDocument = {
    id: uuidv4(),
    title: body.title || 'Untitled Document',
    content: body.content || '',
    createdAt: now,
    updatedAt: now,
    wordCount: body.wordCount || 0,
    charCount: body.charCount || 0,
  };
  const filePath = path.join(DOCUMENTS_DIR, `${doc.id}.amp`);
  await fs.writeFile(filePath, serializeToAmp(doc), 'utf-8');
  return NextResponse.json(doc, { status: 201 });
}
