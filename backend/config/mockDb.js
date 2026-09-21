// backend/config/mockDb.js
const { createMockDatabase } = require('./mockStore');

class MockDatabase {
  constructor() {
    this.store = createMockDatabase();
    this.autoIncrement = {
      users: 100,
      rooms: 100,
      departments: 100,
      maintenance: 100,
      allocations: 100,
      asset_history: 100,
      notifications: 100,
      audit_logs: 100,
      login_history: 100,
      asset_requests: 100,
    };
  }

  getTable(name) {
    const tableMap = {
      users: 'users',
      assets: 'assets',
      blocks: 'blocks',
      rooms: 'rooms',
      departments: 'departments',
      maintenance: 'maintenance',
      maintenance_tickets: 'maintenance',
      allocations: 'allocations',
      asset_history: 'asset_history',
      notifications: 'notifications',
      audit_logs: 'audit_logs',
      login_history: 'login_history',
      asset_requests: 'asset_requests',
      vendors: 'vendors',
    };
    const key = tableMap[name.toLowerCase()];
    return key ? this.store[key] : null;
  }

  async query(sql, params = []) {
    const rawSql = sql.trim();
    const cleanSql = rawSql.replace(/\s+/g, ' ');
    const lower = cleanSql.toLowerCase();

    // DDL Statements - Ignore gracefully
    if (
      lower.startsWith('create table') ||
      lower.startsWith('alter table') ||
      lower.startsWith('create unique index') ||
      lower.startsWith('create index') ||
      lower.startsWith('do $$') ||
      lower.startsWith('begin') ||
      lower.startsWith('commit') ||
      lower.startsWith('rollback')
    ) {
      return { rows: [], rowCount: 0 };
    }

    // Health check: SELECT 1
    if (lower === 'select 1' || lower === 'select 1;') {
      return { rows: [{ '?column?': 1 }], rowCount: 1 };
    }

    // System stats: SELECT COUNT(*) queries
    if (lower.startsWith('select count(')) {
      return this.handleCountQuery(cleanSql, params);
    }

    // SELECT queries
    if (lower.startsWith('select')) {
      return this.handleSelectQuery(cleanSql, params);
    }

    // INSERT queries
    if (lower.startsWith('insert into')) {
      return this.handleInsertQuery(cleanSql, params);
    }

    // UPDATE queries
    if (lower.startsWith('update')) {
      return this.handleUpdateQuery(cleanSql, params);
    }

    // DELETE queries
    if (lower.startsWith('delete from')) {
      return this.handleDeleteQuery(cleanSql, params);
    }

    console.warn('[MockDB] Unhandled SQL query:', sql);
    return { rows: [], rowCount: 0 };
  }

  handleCountQuery(sql, params) {
    const lower = sql.toLowerCase();
    const tableMatch = lower.match(/from\s+([a-zA-Z0-9_]+)/);
    if (!tableMatch) return { rows: [{ count: '0' }], rowCount: 1 };
    
    const tableName = tableMatch[1];
    const table = this.getTable(tableName) || [];
    
    if (tableName === 'users') {
      const active = table.filter(u => u.status === 'Active').length;
      return { rows: [{ total: String(table.length), active: String(active) }], rowCount: 1 };
    }
    if (tableName === 'assets') {
      const active = table.filter(a => a.status === 'Active' || a.status === 'In Use').length;
      return { rows: [{ total: String(table.length), active: String(active) }], rowCount: 1 };
    }
    if (tableName === 'maintenance' || tableName === 'maintenance_tickets') {
      const pending = table.filter(m => m.status === 'Pending').length;
      const inProgress = table.filter(m => m.status === 'In Progress').length;
      return { rows: [{ total: String(table.length), pending: String(pending), in_progress: String(inProgress) }], rowCount: 1 };
    }
    if (tableName === 'asset_requests') {
      const pending = table.filter(r => r.status === 'Pending').length;
      return { rows: [{ total: String(table.length), pending: String(pending) }], rowCount: 1 };
    }

    return { rows: [{ count: String(table.length), total: String(table.length) }], rowCount: 1 };
  }

  handleSelectQuery(sql, params) {
    const lower = sql.toLowerCase();
    const fromMatch = lower.match(/from\s+([a-zA-Z0-9_]+)/);
    if (!fromMatch) return { rows: [], rowCount: 0 };
    
    const tableName = fromMatch[1];
    const table = this.getTable(tableName);
    if (!table) return { rows: [], rowCount: 0 };

    let results = [...table];

    // WHERE clause parsing
    const whereMatch = sql.match(/where\s+(.*?)(order\s+by|group\s+by|limit|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      results = results.filter(row => this.evaluateWhere(row, whereClause, params));
    }

    // ORDER BY clause parsing
    const orderMatch = sql.match(/order\s+by\s+([a-zA-Z0-9_]+)\s*(asc|desc)?/i);
    if (orderMatch) {
      const col = orderMatch[1];
      const desc = (orderMatch[2] || 'asc').toLowerCase() === 'desc';
      results.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        const comp = valA > valB ? 1 : -1;
        return desc ? -comp : comp;
      });
    }

    // LIMIT parsing
    const limitMatch = sql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      results = results.slice(0, limit);
    }

    return { rows: results.map(r => ({ ...r })), rowCount: results.length };
  }

  evaluateWhere(row, whereClause, params) {
    // Simple WHERE conditions evaluator
    // Handles: email = $1, id = $1, staff_id = $1, submitted_by = $1, recipient_role = $1 OR recipient_role IS NULL, etc.
    const lower = whereClause.toLowerCase();

    // Check for $1, $2, etc. references
    const paramRef = whereClause.match(/\$(\d+)/);
    const paramVal = paramRef ? params[parseInt(paramRef[1], 10) - 1] : null;

    if (lower.includes('email =') && paramRef) {
      return String(row.email || '').toLowerCase() === String(paramVal || '').toLowerCase();
    }
    if (lower.includes('staff_id =') && paramRef) {
      return String(row.staff_id || '').toLowerCase() === String(paramVal || '').toLowerCase();
    }
    if (lower.includes('user_id =') && paramRef) {
      return String(row.user_id || '') === String(paramVal || '');
    }
    if (lower.includes('submitted_by =') && paramRef) {
      return String(row.submitted_by || '') === String(paramVal || '');
    }
    if (lower.includes('id =') && paramRef) {
      return String(row.id || '') === String(paramVal || '');
    }
    if (lower.includes('asset_id =') && paramRef) {
      return String(row.asset_id || '') === String(paramVal || '');
    }
    if (lower.includes('recipient_role') && lower.includes('is null')) {
      if (!paramVal) return true;
      return !row.recipient_role || String(row.recipient_role).toLowerCase() === String(paramVal).toLowerCase();
    }

    // Fallback: match any column in where clause
    const colMatch = whereClause.match(/([a-zA-Z0-9_]+)\s*=\s*\$(\d+)/);
    if (colMatch) {
      const col = colMatch[1];
      const pIdx = parseInt(colMatch[2], 10) - 1;
      return String(row[col] || '') === String(params[pIdx] || '');
    }

    return true;
  }

  handleInsertQuery(sql, params) {
    const tableMatch = sql.match(/insert\s+into\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*values\s*\((.*?)\)/i);
    if (!tableMatch) {
      console.warn('[MockDB] Could not parse INSERT:', sql);
      return { rows: [], rowCount: 0 };
    }

    const tableName = tableMatch[1];
    const columns = tableMatch[2].split(',').map(c => c.trim().toLowerCase());
    const table = this.getTable(tableName);
    if (!table) return { rows: [], rowCount: 0 };

    const newRow = {};
    if (this.autoIncrement[tableName]) {
      newRow.id = ++this.autoIncrement[tableName];
    }

    // Match column values from params or literals
    columns.forEach((col, idx) => {
      if (idx < params.length) {
        newRow[col] = params[idx];
      }
    });

    // Provide default timestamps if missing
    if (!newRow.created_at && columns.includes('created_at')) {
      newRow.created_at = new Date().toISOString();
    }
    if (!newRow.timestamp && (tableName === 'audit_logs' || tableName === 'notifications')) {
      newRow.timestamp = new Date().toISOString();
    }
    if (!newRow.last_updated && tableName === 'blocks') {
      newRow.last_updated = new Date().toISOString();
    }

    table.push(newRow);

    return { rows: [{ ...newRow }], rowCount: 1 };
  }

  handleUpdateQuery(sql, params) {
    const tableMatch = sql.match(/update\s+([a-zA-Z0-9_]+)\s+set\s+(.*?)\s+where\s+(.*)/i);
    if (!tableMatch) return { rows: [], rowCount: 0 };

    const tableName = tableMatch[1];
    const setClause = tableMatch[2];
    const whereClause = tableMatch[3];
    const table = this.getTable(tableName);
    if (!table) return { rows: [], rowCount: 0 };

    let updatedCount = 0;
    table.forEach(row => {
      if (this.evaluateWhere(row, whereClause, params)) {
        // Parse assignments like name = $1, department = $2, last_login = NOW()
        const assignments = setClause.split(',');
        assignments.forEach(assign => {
          const parts = assign.trim().split('=');
          if (parts.length === 2) {
            const col = parts[0].trim();
            const valExpr = parts[1].trim();
            const paramRef = valExpr.match(/\$(\d+)/);
            if (paramRef) {
              const pIdx = parseInt(paramRef[1], 10) - 1;
              row[col] = params[pIdx];
            } else if (valExpr.toLowerCase() === 'now()') {
              row[col] = new Date().toISOString();
            } else if (valExpr.toLowerCase() === 'true') {
              row[col] = true;
            } else if (valExpr.toLowerCase() === 'false') {
              row[col] = false;
            }
          }
        });
        updatedCount++;
      }
    });

    return { rows: [], rowCount: updatedCount };
  }

  handleDeleteQuery(sql, params) {
    const tableMatch = sql.match(/delete\s+from\s+([a-zA-Z0-9_]+)\s*(?:where\s+(.*))?/i);
    if (!tableMatch) return { rows: [], rowCount: 0 };

    const tableName = tableMatch[1];
    const whereClause = tableMatch[2] || '';
    const table = this.getTable(tableName);
    if (!table) return { rows: [], rowCount: 0 };

    const initialLength = table.length;
    const key = Object.keys(this.store).find(k => this.store[k] === table);
    if (whereClause) {
      this.store[key] = table.filter(row => !this.evaluateWhere(row, whereClause, params));
    } else {
      this.store[key] = [];
    }

    return { rows: [], rowCount: initialLength - this.store[key].length };
  }

  async connect() {
    return {
      query: (sql, params) => this.query(sql, params),
      release: () => {},
    };
  }

  on(event, handler) {
    // No-op for mock DB pool events
  }
}

module.exports = { MockDatabase };
