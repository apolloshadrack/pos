export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'barcode',
      title: 'Barcode',
      type: 'string',
      validation: (Rule: any) => Rule.required().unique(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Beer', value: 'beer' },
          { title: 'Wine', value: 'wine' },
          { title: 'Spirits', value: 'spirits' },
          { title: 'Cider', value: 'cider' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price (KSh)',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'abv',
      title: 'ABV (%)',
      type: 'number',
      description: 'Alcohol by Volume percentage',
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
}

