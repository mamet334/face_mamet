/**
 * NavGraph.js
 * Waypoint Navigation Graph & Shortest Path Finder
 * Memastikan avatar bergerak menyusuri koridor dan pintu ruangan, bukan menembus dinding.
 */

export class NavGraph {
  constructor() {
    this.nodes = new Map(); // id -> { id, x, y, name, room }
    this.edges = new Map(); // id -> Set of neighbor IDs
    this.roomSpots = new Map(); // roomKey -> nodeId
    this.setupDefaultOfficeGraph();
  }

  addNode(id, x, y, options = {}) {
    this.nodes.set(id, { id, x, y, ...options });
    if (!this.edges.has(id)) {
      this.edges.set(id, new Set());
    }
    if (options.roomSpot) {
      this.roomSpots.set(options.roomSpot, id);
    }
  }

  addEdge(nodeA, nodeB) {
    if (!this.nodes.has(nodeA) || !this.nodes.has(nodeB)) {
      console.warn(`[NavGraph] Cannot add edge between ${nodeA} and ${nodeB}: node missing`);
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
      const specificNode = this.getNode(`lounge_spot_${agentId}`);
      if (specificNode) return specificNode;
    }
    const nodeId = this.roomSpots.get(roomKey);
    return nodeId ? this.nodes.get(nodeId) : null;
  }

  setupDefaultOfficeGraph() {
    // 1. Waypoint Nodes (Posisi dalam kanvas 960x600)
    // Command Center
    this.addNode('command_spot', 180, 235, { roomSpot: 'command', label: 'Command Desk' });
    this.addNode('command_door', 180, 280, { label: 'Command Door' });

    // Research Room
    this.addNode('research_spot', 480, 235, { roomSpot: 'research', label: 'Research Desk' });
    this.addNode('research_door', 480, 280, { label: 'Research Door' });

    // Engineer Room
    this.addNode('engineer_spot', 780, 235, { roomSpot: 'engineer', label: 'Engineer Workbench' });
    this.addNode('engineer_door', 780, 280, { label: 'Engineer Door' });

    // Central Hallway Corridor (Jalur penghubung utama horizontal)
    this.addNode('hallway_west', 180, 330, { label: 'West Corridor' });
    this.addNode('hallway_mid_west', 210, 330, { label: 'Mid-West Junction' });
    this.addNode('hallway_center', 480, 330, { roomSpot: 'alert', label: 'Central Hub / Alert Station' });
    this.addNode('hallway_mid_east', 750, 330, { label: 'Mid-East Junction' });
    this.addNode('hallway_east', 780, 330, { label: 'East Corridor' });

    // Memory Room (Bawah Kiri)
    this.addNode('memory_door', 210, 385, { label: 'Memory Door' });
    this.addNode('memory_spot', 210, 465, { roomSpot: 'memory', label: 'Memory Core Vault' });

    // Pantry & Break Lounge (Bawah Tengah)
    this.addNode('lounge_door', 480, 385, { label: 'Lounge Door' });
    this.addNode('lounge_spot', 480, 465, { roomSpot: 'lounge', label: 'Pantry & Coffee Sofa' });

    // Spot Terpisah di Lounge untuk Setiap Agen (Mencegah Menumpuk Jadi Satu)
    this.addNode('lounge_spot_mamet', 435, 465, { label: 'Lounge Sofa Kiri (Mamet)' });
    this.addNode('lounge_spot_engineer', 465, 465, { label: 'Lounge Sofa Kanan (Engineer)' });
    this.addNode('lounge_spot_researcher', 440, 512, { label: 'Lounge Area Baca (Researcher)' });
    this.addNode('lounge_spot_archivist', 505, 510, { label: 'Lounge Meja Santai (Archivist)' });
    this.addNode('lounge_spot_tokensaver', 535, 465, { label: 'Coffee Counter (TokenSaver)' });

    // Knowledge Graph Room (Bawah Kanan)
    this.addNode('knowledge_door', 750, 385, { label: 'Knowledge Door' });
    this.addNode('knowledge_spot', 750, 465, { roomSpot: 'knowledge', label: 'Knowledge Graph Table' });

    // 2. Jalur Sambungan (Edges)
    // Command -> Hallway
    this.addEdge('command_spot', 'command_door');
    this.addEdge('command_door', 'hallway_west');

    // Research -> Hallway
    this.addEdge('research_spot', 'research_door');
    this.addEdge('research_door', 'hallway_center');

    // Engineer -> Hallway
    this.addEdge('engineer_spot', 'engineer_door');
    this.addEdge('engineer_door', 'hallway_east');

    // Hallway Spine (Koneksi koridor utama)
    this.addEdge('hallway_west', 'hallway_mid_west');
    this.addEdge('hallway_mid_west', 'hallway_center');
    this.addEdge('hallway_center', 'hallway_mid_east');
    this.addEdge('hallway_mid_east', 'hallway_east');

    // Memory -> Hallway
    this.addEdge('hallway_mid_west', 'memory_door');
    this.addEdge('memory_door', 'memory_spot');

    // Lounge -> Hallway
    this.addEdge('hallway_center', 'lounge_door');
    this.addEdge('lounge_door', 'lounge_spot');
    this.addEdge('lounge_door', 'lounge_spot_mamet');
    this.addEdge('lounge_door', 'lounge_spot_engineer');
    this.addEdge('lounge_door', 'lounge_spot_researcher');
    this.addEdge('lounge_door', 'lounge_spot_archivist');
    this.addEdge('lounge_door', 'lounge_spot_tokensaver');

    this.addEdge('lounge_spot', 'lounge_spot_mamet');
    this.addEdge('lounge_spot', 'lounge_spot_engineer');
    this.addEdge('lounge_spot', 'lounge_spot_researcher');
    this.addEdge('lounge_spot', 'lounge_spot_archivist');
    this.addEdge('lounge_spot', 'lounge_spot_tokensaver');

    // Knowledge -> Hallway
    this.addEdge('hallway_mid_east', 'knowledge_door');
    this.addEdge('knowledge_door', 'knowledge_spot');
  }

  /**
   * Cari jalur terpendek menggunakan BFS (Breadth-First Search)
   * Mengembalikan array objek Node [{id, x, y, label}, ...]
   */
  findPath(startId, targetId) {
    if (startId === targetId) {
      const node = this.getNode(startId);
      return node ? [node] : [];
    }

    if (!this.nodes.has(startId) || !this.nodes.has(targetId)) {
      return [];
    }

    const queue = [startId];
    const visited = new Set([startId]);
    const parent = new Map();

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === targetId) {
        break;
      }

      const neighbors = this.edges.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    if (!parent.has(targetId)) {
      return []; // Tidak ditemukan rute
    }

    // Rekonstruksi rute dari target ke start
    const path = [];
    let curr = targetId;
    while (curr) {
      path.unshift(this.getNode(curr));
      curr = parent.get(curr);
    }

    return path;
  }

  /**
   * Menemukan node terdekat dari koordinat bebas (x, y)
   */
  findClosestNode(x, y) {
    let closest = null;
    let minDistance = Infinity;

    for (const node of this.nodes.values()) {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < minDistance) {
        minDistance = dist;
        closest = node;
      }
    }

    return closest;
  }
}
