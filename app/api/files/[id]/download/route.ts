// 파일 다운로드 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

// Node.js runtime 사용 (파일 시스템 처리에 필요)
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = Number(id);

    if (Number.isNaN(fileId)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // path가 /uploads/uuid.pdf 형태이므로 public 폴더 기준으로 경로 구성
    // 예: /uploads/uuid.pdf -> public/uploads/uuid.pdf
    const fullPath = path.join(process.cwd(), 'public', file.path);
    
    // 파일 존재 여부 확인
    try {
      await fs.access(fullPath);
    } catch {
      return new NextResponse('File not found on disk', { status: 404 });
    }

    const data = await fs.readFile(fullPath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          file.originalName,
        )}"`,
      },
    });
  } catch (error) {
    console.error('❌ File Download Error:', error);
    return new NextResponse('File download failed', { status: 500 });
  }
}

