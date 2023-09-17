"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Category, Color, Image, Product, Size } from "@prisma/client";
import { Trash } from "lucide-react";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AlertModal from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";

import useOrigin from "@/hooks/use-origin";
import { Checkbox } from "@/components/ui/checkbox";


const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface BillboardProps {
  initialData: Product & {
    images: Image[];
  } | null;
  colors: Color[];
  categories: Category[];
  sizes: Size[];
}

export default function ProductForm({ initialData, categories, colors, sizes }: BillboardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product"  : "Create product";
  const description = initialData ? "Edit a product"  : "Add a new product";
  const toastMessage = initialData ? "Product updated."  : "Product created.";
  const action = initialData ? "Save changes"  : "Create";

  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      price: parseFloat(String(initialData?.price))
    } : {
      name : '',
      images: [],
      price: 0,
      categoryId: '',
      colorId: '',
      sizeId: '',
      isArchived: false,
      isFeatured: false,
    }
  });

  const onSubmit = async (data: ProductFormValues) => { 
    try {
      setLoading(true);
      if(initialData){
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);  
      }
      toast.success(toastMessage);
      router.push(`/${params.storeId}/products`);
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const onDelete = async () => { 
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      toast.success('Product Deleted!');
      router.refresh();
      router.push('/');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading 
          title={title}
          description={description}
        />
        {initialData && (
          <Button disabled={loading} variant="destructive" size="icon" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) =>  (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value.map((image) => image.url)}
                      disabled={loading}
                      onChange={(url) => field.onChange([...field.value, { url }])}
                      onRemove={(url) => field.onChange(field.value.filter((item) => item.url !== url))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) =>  (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) =>  (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="9.99" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) =>  (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                    value={String(field.value)}
                  >
                    <FormControl >
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) =>  (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl >
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select Size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem
                          key={size.id}
                          value={size.id}
                        >
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) =>  (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl >
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select Color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem
                          key={color.id}
                          value={color.id}
                        >
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) =>  (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This Product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) =>  (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This Product will not appear anywhere is this store
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
