import { addOnProducts } from '@/lib/constants';
import { stripe } from '@/lib/stripe';
import React from 'react'

type Props = {
  params: {
    agencyId: string;
  }
}

const page = ({params}: Props) => {

  const addOns =  stripe.products.list({
    ids: addOnProducts.map(prod => prod.id),
    expand: ['data.default_price']
  })
  return (
    <div>billing</div>
  )
}

export default page