'use client';

import { useParams } from 'next/navigation';

export default function ResumePage() {
  const params = useParams();
  const id = params.id;

  return (
    <div>
      <h1>Resume {id}</h1>
    </div>
  );
}