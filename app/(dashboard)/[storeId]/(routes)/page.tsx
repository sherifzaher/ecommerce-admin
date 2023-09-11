import prismadb from '@/lib/prismadb';
import React from 'react'

interface DashboardProps {
  params: { storeId: string; };
}

async function DashboardPage({ params }: DashboardProps) {
  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId
    }
  })
  return (
    <div>
      Active Store : {store?.name}
    </div>
  )
}

export default DashboardPage