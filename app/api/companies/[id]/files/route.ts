// 업체의 파일 목록 조회 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 업체의 파일 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 업체의 모든 파일 조회
    const files = await prisma.file.findMany({
      where: {
        companyId: id,
      },
      orderBy: {
        createdAt: 'desc', // 최근 업로드 순으로 정렬
      },
    });

    // 프론트엔드에서 사용할 형식으로 변환
    const fileList = files.map((file: any) => ({
      id: file.id,
      fileType: file.fileType,
      originalName: file.originalName || file.fileName || '', // originalName 우선, 없으면 fileName
      storedName: file.storedName || '', // 저장된 파일명
      path: file.filePath || '', // 웹 접근 경로
      uploadedAt: file.createdAt.toISOString(),
      status: file.status || null,
      extractedText: file.extractedText || '', // 추출된 텍스트 포함 (선택한 파일의 텍스트 표시용)
    }));

    return NextResponse.json(fileList);
  } catch (error) {
    console.error('파일 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '파일 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

