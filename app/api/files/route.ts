// app/api/files/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { promises as fs } from 'fs';

import path from 'path';

import { randomUUID } from 'crypto';

import { prisma } from '@/lib/prisma';



// 파일 시스템을 쓰기 때문에 반드시 nodejs 런타임 사용

export const runtime = 'nodejs';



// POST: 파일 업로드

export async function POST(request: NextRequest) {

  try {

    const formData = await request.formData();



    const file = formData.get('file') as unknown as File | null;

    const fileType =

      (formData.get('fileType') as string | null) ?? 'business_license';



    if (!file) {

      return NextResponse.json(

        { error: '파일이 없습니다.' },

        { status: 400 },

      );

    }



    // File -> Buffer

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);



    // 저장 경로: public/uploads

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await fs.mkdir(uploadDir, { recursive: true });



    // 확장자 추출

    const originalName = file.name || 'uploaded';

    const ext = path.extname(originalName); // 예: '.pdf', '.jpg'



    // UUID로 저장 파일명 생성

    const storedName = `${randomUUID()}${ext}`;

    const filePath = path.join(uploadDir, storedName);



    // 실제 파일 저장

    await fs.writeFile(filePath, buffer);



    // DB 저장 (UploadedFile 테이블)

    // path는 웹에서 접근 가능한 경로 (예: /uploads/uuid.pdf)

    const uploaded = await prisma.uploadedFile.create({

      data: {

        fileType,

        originalName: originalName,

        storedName: storedName,

        path: `/uploads/${storedName}`, // 웹에서 접근 가능한 경로

      },

    });



    return NextResponse.json(uploaded, { status: 201 });

  } catch (error) {

    console.error('❌ File Upload Error:', error);

    return NextResponse.json(

      { error: '파일 업로드에 실패했습니다.' },

      { status: 500 },

    );

  }

}



// GET: 업로드된 파일 목록 조회

export async function GET() {

  try {

    const files = await prisma.uploadedFile.findMany({

      orderBy: { uploadedAt: 'desc' },

    });

    return NextResponse.json(files, { status: 200 });

  } catch (error) {

    console.error('❌ File List Error:', error);

    return NextResponse.json(

      { error: '파일 목록을 불러오는 데 실패했습니다.' },

      { status: 500 },

    );

  }

}
