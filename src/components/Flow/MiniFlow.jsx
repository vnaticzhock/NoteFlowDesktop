import './FlowEditor.scss'

import ReactFlow, { MiniMap } from 'reactflow'

import { useFlowStorage } from '../../storage/Storage'

export default function MiniFlow({ flow }) {
  return (
    <div style={{ backgroundColor: 'black', width: 500, height: 200 }}>
      <ReactFlow defaultNodes={flow.nodes} defaultEdges={flow.edges}>
        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  )
}
