import { format } from 'date-fns';

import prismadb from '@/lib/prismadb'
import CategoryClient from './components/client'
import { CategoryColumn } from './components/columns';

export default async function CategoryPage({params}: { params: { storeId: string } }) {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      billboard: true,
    }
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    createdAt: format(item.createdAt, "MMM do, yyyy"),
  }))

  return (
    <div className='flex flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  )
}
