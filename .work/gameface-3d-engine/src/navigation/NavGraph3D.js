/**
 * NavGraph3D.js
 * 3D Waypoint Navigation Graph & BFS Pathfinding
 * Menghitung rute perjalanan 3D karakter menyusuri lorong dan pintu antar-ruangan
 */

export class NavGraph3D {
  constructor() {
    this.nodes = new Map(); // id -> { id, x, y, z, label, room }
    this.edges = new Map(); // id -> Set of neighbor IDs
    this.roomSpots = new Map(); // roomKey -> nodeId
    this.setupOffice3DGraph();
  }

  addNode(id, x, y, z, options = {}) {
    this.nodes.set(id, { id, x, y, z, ...options });
    if (!this.edges.has(id)) {
      this.edges.set(id, new Set());
    }
    if (options.roomSpot) {
      this.roomSpots.set(options.roomSpot, id);
    }
  }

  addEdge(nodeA, nodeB) {
    if (!this.nodes.has(nodeA) || !this.nodes.has(nodeB)) {
      console.warn(`[NavGraph3D] Missing node for edge: ${nodeA} <-> ${nodeB}`);
      return;
    }
    this.edges.get(nodeA).add(nodeB);
    this.edges.get(nodeB).add(nodeA);
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getRoomSpot(roomKey, agentId = null) {
    if (roomKey === 'lounge' && agentId) {
      const specific = this.getNode(`lounge_spot_${agentId}`);
      if (specific) return specific;
    }
    const nodeId = this.roomSpots.get(roomKey);
    return nodeId ? this.nodes.get(nodeId) : null;
  }

  findPath(startNodeId, targetNodeId) {
    if (!this.nodes.has(startNodeId) || !this.nodes.has(targetNodeId)) {
      return null;
    }
    if (startNodeId === targetNodeId) {
      return [this.nodes.get(startNodeId)];
    }

    const queue = [[startNodeId]];
    const visited = new Set([startNodeId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === targetNodeId) {
        return path.map(id => this.nodes.get(id));
      }

      const neighbors = this.edges.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // Tidak ada jalur
  }

  findNearestNode(x, z) {
    let nearest = null;
    let minDistanceSq = Infinity;

    for (const node of this.nodes.values()) {
      const dx = node.x - x;
      const dz = node.z - z;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearest = node;
      }
    }

    return nearest;
  }

  setupOffice3DGraph() {
    // === 1. COMMAND CENTER (Top-Left) ===
    this.addNode('command_desk', -9, 0, -4, { roomSpot: 'command', label: 'Command Desk' });
    this.addNode('command_door', -9, 0, -1, { label: 'Command Door' });
    this.addEdge('command_desk', 'command_door');

    // TokenSaver Station
    this.addNode('tokensaver_station', -5, 0, -2, { roomSpot: 'tokensaver_station', label: 'TokenSaver Station' });
    this.addEdge('command_door', 'tokensaver_station');

    // === 2. RESEARCH ROOM (Top-Center) ===
    this.addNode('research_desk', 0, 0, -4, { roomSpot: 'research', label: 'Research Desk' });
    this.addNode('research_door', 0, 0, -1, { label: 'Research Door' });
    this.addEdge('research_desk', 'research_door');

    // === 3. ENGINEER ROOM (Top-Right) ===
    this.addNode('engineer_desk', 9, 0, -4, { roomSpot: 'engineer', label: 'Engineer Workbench' });
    this.addNode('engineer_door', 9, 0, -1, { label: 'Engineer Door' });
    this.addEdge('engineer_desk', 'engineer_door');

    // === 4. CENTRAL HALLWAY (Corridors Z = 0) ===
    this.addNode('hall_command', -9, 0, 0, { label: 'Hallway Command' });
    this.addNode('hall_mid_left', -4.5, 0, 0, { label: 'Hallway Mid-Left' });
    this.addNode('hall_center', 0, 0, 0, { label: 'Hallway Center' });
    this.addNode('hall_mid_right', 4.5, 0, 0, { label: 'Hallway Mid-Right' });
    this.addNode('hall_engineer', 9, 0, 0, { label: 'Hallway Engineer' });

    // Connect Hallway Linear Path
    this.addEdge('hall_command', 'hall_mid_left');
    this.addEdge('hall_mid_left', 'hall_center');
    this.addEdge('hall_center', 'hall_mid_right');
    this.addEdge('hall_mid_right', 'hall_engineer');

    // Connect Doors to Hallway
    this.addEdge('command_door', 'hall_command');
    this.addEdge('tokensaver_station', 'hall_mid_left');
    this.addEdge('research_door', 'hall_center');
    this.addEdge('engineer_door', 'hall_engineer');

    // === 5. MEMORY VAULT (Bottom-Left) ===
    this.addNode('memory_door', -8, 0, 2, { label: 'Memory Door' });
    this.addNode('memory_vault', -8, 0, 6, { roomSpot: 'memory', label: 'Memory Vault Desk' });
    this.addEdge('memory_door', 'memory_vault');

    // Connect Hallway to Memory
    this.addNode('hall_south_left', -8, 0, 1, { label: 'South Hallway Left' });
    this.addEdge('hall_command', 'hall_south_left');
    this.addEdge('hall_south_left', 'memory_door');

    // === 6. PANTRY & BREAK LOUNGE (Bottom-Right) ===
    this.addNode('lounge_door', 8, 0, 2, { label: 'Lounge Door' });
    this.addNode('hall_south_right', 8, 0, 1, { label: 'South Hallway Right' });
    this.addEdge('hall_engineer', 'hall_south_right');
    this.addEdge('hall_south_right', 'lounge_door');

    // Lounge main spot
    this.addNode('lounge_center', 8, 0, 5, { roomSpot: 'lounge', label: 'Lounge Common' });
    this.addEdge('lounge_door', 'lounge_center');

    // 5 Dedicated Resting Spots in Lounge (Anti-Crowding)
    this.addNode('lounge_spot_mamet', 6, 0, 4, { label: 'Mamet Armchair' });
    this.addNode('lounge_spot_engineer', 6, 0, 7, { label: 'Engineer Sofa Left' });
    this.addNode('lounge_spot_researcher', 9, 0, 8, { label: 'Researcher Sofa Right' });
    this.addNode('lounge_spot_archivist', 11, 0, 7, { label: 'Archivist Window Seat' });
    this.addNode('lounge_spot_tokensaver', 9, 0, 4, { label: 'TokenSaver Bar Stool' });

    // Connect individual spots to lounge center
    this.addEdge('lounge_center', 'lounge_spot_mamet');
    this.addEdge('lounge_center', 'lounge_spot_engineer');
    this.addEdge('lounge_center', 'lounge_spot_researcher');
    this.addEdge('lounge_center', 'lounge_spot_archivist');
    this.addEdge('lounge_center', 'lounge_spot_tokensaver');
  }
}
