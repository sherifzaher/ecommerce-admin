import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


export async function GET(_req:Request, { params }: { params: { billboardId: string; } }) {
  try {
    if (!params.billboardId){
      return new NextResponse("Billboard id is required", { status: 4000 });
    };

    const billboard = await prismadb.store.findUnique({
      where: {
        id: params.billboardId,
      }
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_GET]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req:Request, { params }: { params: { storeId: string, billboardId: string; } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId){
      return new NextResponse("Unauthorized", { status: 401 });
    };

    if(!label) {
      return new NextResponse("Label is required", { status: 400 });
    };

    if(!imageUrl) {
      return new NextResponse("Image Url is required", { status: 400 });
    };

    if (!params.billboardId){
      return new NextResponse("Billboard id is required", { status: 4000 });
    };

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if(!storeByUserId){
      return new NextResponse("Unauthorized", { status: 403 });
    };

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl
      }
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARDS_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(_req:Request, { params }: { params: { storeId: string, billboardId: string; } }) {
  try {
    const { userId } = auth();

    if (!userId){
      return new NextResponse("Unauthorized", { status: 401 });
    };

    if (!params.billboardId){
      return new NextResponse("Billboard id is required", { status: 400 });
    };

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if(!storeByUserId){
      return new NextResponse("Unauthorized", { status: 403 });
    };

    const billboard = await prismadb.store.deleteMany({
      where: {
        id: params.billboardId,
      }
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}
