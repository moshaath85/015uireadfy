export interface MuseumRouteNode {
  id: string;
  label: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
  artworkId?: string;
  connectedNodes: string[];
}

export interface MuseumRouteGraph {
  nodes: Record<string, MuseumRouteNode>;
  entrance: string;
}

export interface MuseumRouteState {
  currentNodeId: string;
  previousNodeId: string | null;
  transitioning: boolean;
  artworkFocused: boolean;
}

export const ROUTE_GRAPH: MuseumRouteGraph = {
  entrance: 'entrance',
  nodes: {
    entrance: {
      id: 'entrance',
      label: 'Entrance',
      position: [0, 1.68, 8.5],
      lookAt: [0, 2.0, -4.5],
      connectedNodes: ['overview'],
    },
    overview: {
      id: 'overview',
      label: 'Overview',
      position: [0, 1.68, 6.5],
      lookAt: [0, 2.0, -4.5],
      connectedNodes: ['hero-left', 'hero-right', 'left-wall', 'right-wall', 'exit'],
    },
    'hero-left': {
      id: 'hero-left',
      label: 'Hero work',
      position: [-2.0, 1.68, 4.5],
      lookAt: [-3.8, 1.5, -5.2],
      artworkId: 'aw-004',
      connectedNodes: ['overview', 'hero-right'],
    },
    'hero-right': {
      id: 'hero-right',
      label: 'Hero work',
      position: [2.0, 1.68, 4.5],
      lookAt: [4.0, 1.5, -5.2],
      artworkId: 'aw-128',
      connectedNodes: ['overview', 'hero-left'],
    },
    'left-wall': {
      id: 'left-wall',
      label: 'Left wall',
      position: [-4.0, 1.68, 3],
      lookAt: [-7.0, 2.0, 1],
      artworkId: 'aw-175',
      connectedNodes: ['overview'],
    },
    'right-wall': {
      id: 'right-wall',
      label: 'Right wall',
      position: [4.0, 1.68, 3],
      lookAt: [7.0, 2.0, -1.5],
      artworkId: 'aw-029',
      connectedNodes: ['overview'],
    },
    exit: {
      id: 'exit',
      label: 'Exit',
      position: [0, 1.68, 8.5],
      lookAt: [0, 1.8, -8],
      connectedNodes: ['overview'],
    },
  },
};

export function getConnectedNodes(nodeId: string): MuseumRouteNode[] {
  const node = ROUTE_GRAPH.nodes[nodeId];
  if (!node) return [];
  return node.connectedNodes.map((id) => ROUTE_GRAPH.nodes[id]).filter(Boolean);
}

export function getAdjacentArtwork(nodeId: string, direction: 1 | -1): string | null {
  const order = ['hero-left', 'hero-right', 'left-wall', 'right-wall'];
  const idx = order.indexOf(nodeId);
  if (idx === -1) return null;
  const next = order[idx + direction];
  return next ?? null;
}
