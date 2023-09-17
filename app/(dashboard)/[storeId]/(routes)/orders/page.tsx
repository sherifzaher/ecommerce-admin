import { format } from 'date-fns';

import prismadb from '@/lib/prismadb'
import OrderClient from './components/client'
import { OrderColumn } from './components/columns';
import { formatter } from '@/lib/utils';

export default async function OrdersPage({params}: { params: { storeId: string } }) {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    isPaid: item.isPaid,
    products: item.orderItems.map((item) => item.product.name).join(", "),
    totalPrice: formatter.format(item.orderItems.reduce((total, item) => {
      return total + Number(item.product.price)
    }, 0)),
    createdAt: format(item.createdAt, "MMM do, yyyy"),
  }))

  return (
    <div className='flex flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  )
}
