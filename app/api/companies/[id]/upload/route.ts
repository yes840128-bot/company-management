// 파일 업로드 API
// 업로드한 파일을 서버의 public/uploads 폴더에 저장하고 DB에 정보를 저장합니다.
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { callClovaOcr } from '@/lib/clovaOcr';

// Node.js runtime 사용 (파일 시스템 및 OCR 처리에 필요)
export const runtime = 'nodejs';

// POST: 파일 업로드 처리
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 업체가 존재하는지 확인
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // FormData에서 파일과 파일 종류 가져오기
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // fileType에 따라 DB에 저장할 타입 결정
    let dbFileType = '';
    if (fileType === 'businessLicense' || fileType === 'biz_license') {
      dbFileType = 'business_license';
    } else if (fileType === 'biz_license_text' || fileType === 'business_license_text') {
      dbFileType = 'business_license';
    } else if (fileType === 'credit') {
      dbFileType = 'credit';
    } else if (fileType === 'callRecording' || fileType === 'call_recording') {
      dbFileType = 'call_recording';
    } else {
      dbFileType = fileType || 'other';
    }

    // 텍스트 파일인지 확인
    const isTextFile = fileType === 'biz_license_text' || fileType === 'business_license_text';

    // 파일을 바이트 배열로 변환 (텍스트 파일은 나중에 처리)
    let buffer: Buffer;
    let extractedText: string | null = null;

    if (isTextFile) {
      // 텍스트 파일인 경우 직접 읽기
      extractedText = await file.text();
      // 텍스트를 Buffer로 변환하여 저장
      buffer = Buffer.from(extractedText, 'utf-8');
    } else {
      // 이미지 파일인 경우 Buffer로 변환
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    // 저장 경로: public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // 업로드 폴더가 없으면 생성
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 원본 파일명
    const originalName = file.name || 'uploaded';

    // 확장자 추출
    const ext = path.extname(originalName); // 예: '.pdf', '.jpg'

    // UUID로 저장 파일명 생성
    const storedName = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, storedName);

    // 파일을 서버에 저장
    await writeFile(filePath, buffer);

    // 텍스트 추출 처리 (사업자등록증 이미지 파일인 경우 OCR 처리)
    if (dbFileType === 'business_license' && !isTextFile) {
      try {
        // 이미지 파일인 경우 OCR 처리
        extractedText = await callClovaOcr(buffer, file.name);
      } catch (error) {
        console.error('OCR 처리 실패:', error);
        // OCR 실패해도 파일 저장은 계속 진행
        extractedText = null;
      }
    }

    // DB에 파일 정보 저장
    // path는 웹에서 접근 가능한 경로 (예: /uploads/uuid.pdf)
    const savedFile = await prisma.file.create({
      data: {
        companyId: id,
        fileName: originalName, // 기존 필드 (호환성 유지)
        fileType: dbFileType,
        filePath: `/uploads/${storedName}`, // 웹에서 접근 가능한 경로
        originalName: originalName, // 원본 파일명
        storedName: storedName, // 저장된 파일명 (UUID)
        extractedText: extractedText,
        status: '사용중',
      },
    });

    return NextResponse.json({
      message: '파일이 업로드되었습니다.',
      file: {
        id: savedFile.id,
        fileType: savedFile.fileType,
        originalName: savedFile.originalName || savedFile.fileName,
        uploadedAt: savedFile.createdAt.toISOString(),
        extractedText: savedFile.extractedText,
      },
    });
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}

