import { getFunnels } from '@/lib/queries'
import React from 'react'
import { Plus } from 'lucide-react'
import BlurPage from '@/components/global/BlurPage'
import FunnelsDataTable from './_components/DataTable'
import { columns } from './_components/Columns'
import FunnelForm from '@/components/forms/CreateFunnelForm'

const Funnels = async ({ params }: { params: { subAccountId: string } }) => {
  const funnels = await getFunnels(params.subAccountId)
  if (!funnels) return null

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Funnel
          </>
        }
        modalChildren={
          <FunnelForm subAccountId={params.subAccountId}></FunnelForm>
        }
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  )
}

export default Funnels