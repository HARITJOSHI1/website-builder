import { LaneDetails, PipelineDetailsWithLanesCardsTagsTickets } from '@/lib/types'
import { Lane, Ticket } from '@prisma/client'
import React from 'react'

type TProps = {
    lanes: LaneDetails[]
    pipelineId: string
    subaccountId: string
    pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets
    updateLanesOrder: (lanes: Lane[]) => Promise<void>
    updateTicketsOrder: (tickets: Ticket[]) => Promise<void>
  }

const PipelineView = ({}: TProps) => {
  return (
    <div>Kanban</div>
  )
}

export default PipelineView