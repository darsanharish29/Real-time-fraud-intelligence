import React, { useState } from 'react';
import { Share2, Server, Smartphone, User, DollarSign, ShieldAlert, ArrowRight, Info } from 'lucide-react';

interface NetworkNode {
  id: string;
  label: string;
  type: 'ACCOUNT' | 'DEVICE' | 'IP' | 'MULE' | 'CASE';
  detail: string;
  risk: string;
  x: number;
  y: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  label: string;
  amount?: string;
}

export default function NetworkAnalysisPage() {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const nodes: NetworkNode[] = [
    { id: 'acc-target', label: 'DEMO-ACC-2048', type: 'ACCOUNT', detail: 'Target Hub Account (V. Sharma)', risk: 'CRITICAL', x: 380, y: 200 },
    { id: 'mule-1', label: 'DEMO-MULE-9901', type: 'MULE', detail: 'Identified Mule Account (Jamtara ring)', risk: 'HIGH', x: 620, y: 120 },
    { id: 'mule-2', label: 'DEMO-MULE-9902', type: 'MULE', detail: 'Secondary Outflow Layer', risk: 'HIGH', x: 620, y: 280 },
    { id: 'dev-1', label: 'DEV-ROOTED-88', type: 'DEVICE', detail: 'Rooted emulator device ID', risk: 'CRITICAL', x: 160, y: 120 },
    { id: 'ip-1', label: '198.51.100.42', type: 'IP', detail: 'TOR Exit Node / Netherland Relay', risk: 'HIGH', x: 160, y: 280 },
    { id: 'case-1', label: 'CASE-1044', type: 'CASE', detail: 'Syndicate Layering Investigation', risk: 'CRITICAL', x: 380, y: 60 },
  ];

  const edges: NetworkEdge[] = [
    { from: 'acc-target', to: 'mule-1', label: 'UPI Fast Transfer', amount: '₹1,48,500' },
    { from: 'acc-target', to: 'mule-2', label: 'IMPS Sweep', amount: '₹98,000' },
    { from: 'dev-1', to: 'acc-target', label: 'Auth Session Token' },
    { from: 'ip-1', to: 'dev-1', label: 'Tunnel Proxy' },
    { from: 'case-1', to: 'acc-target', label: 'Primary Subject' },
  ];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ACCOUNT':
        return 'bg-emerald-950 border-emerald-500 text-emerald-300';
      case 'MULE':
        return 'bg-red-950 border-red-500 text-red-300';
      case 'DEVICE':
        return 'bg-purple-950 border-purple-500 text-purple-300';
      case 'IP':
        return 'bg-blue-950 border-blue-500 text-blue-300';
      case 'CASE':
        return 'bg-amber-950 border-amber-500 text-amber-300';
      default:
        return 'bg-zinc-800 border-zinc-600 text-zinc-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            Entity Linkage &amp; Forensic Graph Visualizer
          </h2>
          <p className="text-xs text-zinc-400">
            Multi-hop relational topology linking accounts, mule nodes, rooted hardware, IP tunnels &amp; active cases
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400">Legend:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">Target</span>
          <span className="px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300">Mule</span>
          <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">Device</span>
          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300">IP Proxy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG / Canvas Graph Representation */}
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 shadow-xl relative min-h-[440px] flex items-center justify-center overflow-hidden">
          
          {/* SVG connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
              </marker>
            </defs>
            {/* Draw edge lines between nodes */}
            <line x1="380" y1="200" x2="620" y2="120" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="380" y1="200" x2="620" y2="280" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="160" y1="120" x2="380" y2="200" stroke="#a855f7" strokeWidth="2" />
            <line x1="160" y1="280" x2="160" y2="120" stroke="#3b82f6" strokeWidth="2" />
            <line x1="380" y1="60" x2="380" y2="200" stroke="#eab308" strokeWidth="2" />
          </svg>

          {/* Render Interactive Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{ left: `${node.x - 70}px`, top: `${node.y - 30}px` }}
              className={`absolute cursor-pointer transition-all duration-200 transform hover:scale-105 p-3 rounded-xl border shadow-lg w-[140px] text-center ${getNodeColor(node.type)} ${
                selectedNode?.id === node.id ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-black' : ''
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">{node.type}</div>
              <div className="text-xs font-bold font-mono truncate">{node.label}</div>
            </div>
          ))}

          <div className="absolute bottom-3 left-3 text-[10px] text-zinc-500 font-mono">
            Interactive Topology Engine &bull; Click any entity node to inspect forensic attributes
          </div>
        </div>

        {/* Node Inspection Drawer */}
        <div className="lg:col-span-4 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            Entity Metadata &amp; Risk Profile
          </h3>

          {selectedNode ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-lg bg-[#161616] border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Classification:</span>
                  <span className="font-mono text-zinc-200 font-semibold">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Entity Identifier:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Threat Rating:</span>
                  <span className="font-mono text-red-400 font-bold">{selectedNode.risk}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-zinc-300">Forensic Description:</div>
                <p className="text-xs text-zinc-400 leading-relaxed bg-[#161616] p-3 rounded-lg border border-zinc-800">
                  {selectedNode.detail}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="text-xs font-semibold text-zinc-300">Directly Linked Connections:</div>
                <div className="space-y-1.5 text-xs font-mono">
                  {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((e, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#181818] border border-zinc-800/80 flex justify-between">
                      <span className="text-zinc-400">{e.label}</span>
                      <span className="text-emerald-400 font-semibold">{e.amount || 'Active Link'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-zinc-500 space-y-2">
              <Share2 className="w-8 h-8 text-zinc-700 mx-auto" />
              <p>Select any node on the graph to inspect entity relations, fund transfers, and risk ratings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
