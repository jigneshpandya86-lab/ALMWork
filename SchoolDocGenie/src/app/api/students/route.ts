import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Student } from '@/types';

export async function GET() {
  try {
    const snapshot = await db.collection('students').get();
    const students: Student[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const docRef = await db.collection('students').add(data);

    return NextResponse.json(
      { id: docRef.id, ...data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
