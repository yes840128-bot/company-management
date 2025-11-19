// 특정 업체 조회, 수정, 삭제 API
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyById, updateCompany, deleteCompany } from '@/lib/data';

// GET: 특정 업체 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyById(id);
    
    if (!company) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: '업체를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 업체 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedCompany = await updateCompany(id, body);
    
    if (!updatedCompany) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCompany);
  } catch (error) {
    return NextResponse.json(
      { error: '업체를 수정하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 업체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Prisma를 직접 사용하여 삭제 (File도 함께 삭제)
    const { prisma } = await import('@/lib/prisma');
    
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
    
    // File 레코드가 있는지 확인하고 삭제
    // onDelete: Cascade가 설정되어 있지만, 명시적으로 삭제하는 것이 안전합니다.
    await prisma.file.deleteMany({
      where: { companyId: id },
    });
    
    // Company 삭제
    await prisma.company.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('업체 삭제 실패:', error);
    return NextResponse.json(
      { error: '업체를 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}


