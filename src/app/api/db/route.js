import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    const { action, table, payload, filterCol, filterVal } = await request.json();

    if (action === 'select') {
      let query = `SELECT * FROM ${table}`;
      let params = [];

      if (filterCol && filterVal !== undefined) {
        query += ` WHERE ${filterCol} = ?`;
        params.push(filterVal);
      }

      const stmt = db.prepare(query);
      const data = stmt.all(...params);
      
      // Parse JSON fields if needed
      const parsedData = data.map(row => {
        if (row.registrations && typeof row.registrations === 'string') {
          try {
            row.registrations = JSON.parse(row.registrations);
          } catch(e) {}
        }
        return row;
      });

      return NextResponse.json({ data: parsedData, count: parsedData.length });
    }

    if (action === 'insert') {
      if (!payload.id) payload.id = Math.random().toString(36).substr(2, 9);
      const keys = Object.keys(payload);
      const values = Object.values(payload);
      
      // Serialize nested objects
      const safeValues = values.map(v => typeof v === 'object' ? JSON.stringify(v) : v);
      
      const placeholders = keys.map(() => '?').join(', ');
      
      const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...safeValues);
      
      return NextResponse.json({ error: null });
    }

    if (action === 'update') {
      if (!filterCol) throw new Error('Update requires a filter column');
      
      if (!payload.id) payload.id = Math.random().toString(36).substr(2, 9);
      const keys = Object.keys(payload);
      const values = Object.values(payload);
      
      const safeValues = values.map(v => typeof v === 'object' ? JSON.stringify(v) : v);
      
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE ${filterCol} = ?`);
      
      stmt.run(...safeValues, filterVal);
      
      return NextResponse.json({ error: null });
    }

    if (action === 'delete') {
      if (!filterCol) throw new Error('Delete requires a filter column');
      
      const stmt = db.prepare(`DELETE FROM ${table} WHERE ${filterCol} = ?`);
      stmt.run(filterVal);
      
      return NextResponse.json({ error: null });
    }

    if (action === 'count') {
      const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
      const result = stmt.get();
      return NextResponse.json({ count: result.count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
