import { format } from 'date-fns';

import prismadb from '@/lib/prismadb'
import SizesClient from './components/client'
import { ColorColumn } from './components/columns';

export default async function ColorsPage({params}: { params: { storeId: string } }) {
  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedColors: ColorColumn[] = colors.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, "MMM do, yyyy"),
  }))

  return (
    <div className='flex flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <SizesClient data={formattedColors} />
      </div>
    </div>
  )
}
