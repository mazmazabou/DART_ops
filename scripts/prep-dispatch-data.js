#!/usr/bin/env node
'use strict';

// =============================================================================
// Prep realistic dispatch data for marketing screenshots
// =============================================================================
// Fixes clock events so Alex/Jordan/Morgan show on-shift without "Late" tags,
// cancels messy active rides from today, and seeds a clean dispatch grid.
//
// Usage: node scripts/prep-dispatch-data.js
// =============================================================================

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost/rideops',
});

function gid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// Today's date in PST as YYYY-MM-DD
function todayPST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

// Build a TIMESTAMPTZ string for today at HH:MM PST
function todayAt(hhmm) {
  return `${todayPST()} ${hhmm}:00-08`;
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const today = todayPST();
    console.log('[prep-dispatch-data] today =', today);

    // =========================================================================
    // STEP 1 — Fix clock events
    // =========================================================================

    // 1a. Delete ALL today's clock events for our 4 drivers (fresh start)
    await client.query(
      `DELETE FROM clock_events WHERE employee_id IN ('emp1','emp2','emp3','emp4') AND event_date = $1`,
      [today]
    );
    console.log('[step 1] Cleared today clock events for emp1-4');

    // 1b. Insert clean clock events:
    //   Alex   (emp1): shift_gq0fgn46 → 09:00-13:00 (Fri). Clock in at 09:00, tardiness=0
    //   Jordan (emp2): shift_quyct650 → 12:00-17:00 (Fri). Clock in at 11:55 (early), tardiness=0
    //   Morgan (emp4): no Friday shift. Clock in at 10:00, tardiness=0
    await client.query(
      `INSERT INTO clock_events (id, employee_id, shift_id, event_date, scheduled_start, clock_in_at, tardiness_minutes)
       VALUES
         ($1, 'emp1', 'shift_gq0fgn46', $2, '09:00', $3::timestamptz, 0),
         ($4, 'emp2', 'shift_quyct650', $2, '12:00', $5::timestamptz, 0),
         ($6, 'emp4', NULL,             $2, NULL,    $7::timestamptz, 0)`,
      [
        gid('clock'), today,
        todayAt('09:00'),
        gid('clock'), todayAt('11:55'),
        gid('clock'), todayAt('10:00'),
      ]
    );
    console.log('[step 1] Inserted clean clock events for Alex, Jordan, Morgan');

    // 1c. Set active states
    await client.query(`UPDATE users SET active = TRUE  WHERE id IN ('emp1','emp2','emp4')`);
    await client.query(`UPDATE users SET active = FALSE WHERE id = 'emp3'`);
    console.log('[step 1] Set active: Alex/Jordan/Morgan=TRUE, Taylor=FALSE');

    // =========================================================================
    // STEP 2 — Cancel messy non-terminal today's rides
    // =========================================================================

    // Cancel all today's pending/approved/scheduled/in-progress rides
    const messy = await client.query(
      `UPDATE rides
         SET status = 'cancelled', cancelled_by = 'office', updated_at = NOW()
       WHERE requested_time >= $1::date
         AND requested_time < ($1::date + INTERVAL '1 day')
         AND status IN ('pending','approved','scheduled','driver_on_the_way','driver_arrived_grace')
       RETURNING id`,
      [today]
    );
    console.log(`[step 2] Cancelled ${messy.rowCount} messy active rides`);

    // Add cancellation events for any that were in-progress
    for (const row of messy.rows) {
      await client.query(
        `INSERT INTO ride_events (id, ride_id, actor_user_id, type, notes)
         VALUES ($1, $2, NULL, 'cancelled_by_office', 'Screenshot data reset')`,
        [gid('event'), row.id]
      );
    }

    // =========================================================================
    // STEP 3 — Seed realistic dispatch rides
    // =========================================================================

    // Rider data
    const casey = { id: 'rider1', name: 'Casey Rivera', email: 'hello+casey@ride-ops.com', phone: '555-0101' };
    const riley = { id: 'rider2', name: 'Riley Chen',   email: 'hello+riley@ride-ops.com',  phone: '555-0102' };

    // Office user for ride creation actor
    const OFFICE = 'office';

    async function insertRide({ rideId, rider, driverId, pickup, dropoff, requestedTime, status, notes, graceStart }) {
      await client.query(
        `INSERT INTO rides
           (id, rider_id, rider_name, rider_email, rider_phone,
            pickup_location, dropoff_location, notes,
            requested_time, status, assigned_driver_id,
            grace_start_time, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::timestamptz,$10,$11,$12::timestamptz,NOW(),NOW())`,
        [
          rideId, rider.id, rider.name, rider.email, rider.phone,
          pickup, dropoff, notes || null,
          requestedTime, status, driverId || null,
          graceStart || null,
        ]
      );
    }

    async function addEvent(rideId, actorId, type, notes) {
      await client.query(
        `INSERT INTO ride_events (id, ride_id, actor_user_id, type, notes)
         VALUES ($1,$2,$3,$4,$5)`,
        [gid('event'), rideId, actorId || null, type, notes || null]
      );
    }

    // --- Alex (emp1): 2 completed, 1 driver_on_the_way, 1 scheduled ---

    const r1 = gid('ride'); // 09:15 completed: Residence Hall A → Health Center (Casey)
    await insertRide({ rideId: r1, rider: casey, driverId: 'emp1', pickup: 'Residence Hall A', dropoff: 'Health Center', requestedTime: todayAt('09:15'), status: 'completed' });
    await addEvent(r1, null,   'requested');
    await addEvent(r1, OFFICE, 'approved');
    await addEvent(r1, 'emp1', 'claimed');
    await addEvent(r1, 'emp1', 'on_the_way');
    await addEvent(r1, 'emp1', 'arrived');
    await addEvent(r1, 'emp1', 'completed');

    const r2 = gid('ride'); // 09:50 completed: Engineering Hall → Science Library (Riley)
    await insertRide({ rideId: r2, rider: riley, driverId: 'emp1', pickup: 'Engineering Hall', dropoff: 'Science Library', requestedTime: todayAt('09:50'), status: 'completed' });
    await addEvent(r2, null,   'requested');
    await addEvent(r2, OFFICE, 'approved');
    await addEvent(r2, 'emp1', 'claimed');
    await addEvent(r2, 'emp1', 'on_the_way');
    await addEvent(r2, 'emp1', 'arrived');
    await addEvent(r2, 'emp1', 'completed');

    const r3 = gid('ride'); // 10:30 driver_on_the_way: Student Union → Business School (Casey)
    await insertRide({ rideId: r3, rider: casey, driverId: 'emp1', pickup: 'Student Union', dropoff: 'Business School', requestedTime: todayAt('10:30'), status: 'driver_on_the_way' });
    await addEvent(r3, null,   'requested');
    await addEvent(r3, OFFICE, 'approved');
    await addEvent(r3, 'emp1', 'claimed');
    await addEvent(r3, 'emp1', 'on_the_way');

    const r4 = gid('ride'); // 11:45 scheduled: Main Library → Medical Center (Riley)
    await insertRide({ rideId: r4, rider: riley, driverId: 'emp1', pickup: 'Main Library', dropoff: 'Medical Center', requestedTime: todayAt('11:45'), status: 'scheduled' });
    await addEvent(r4, null,   'requested');
    await addEvent(r4, OFFICE, 'approved');
    await addEvent(r4, 'emp1', 'claimed');

    console.log('[step 3] Alex rides: 2 completed, 1 driver_on_the_way, 1 scheduled');

    // --- Jordan (emp2): 3 scheduled (shift starts 12:00) ---

    const r5 = gid('ride'); // 12:15 scheduled: Humanities Building → Student Center (Riley)
    await insertRide({ rideId: r5, rider: riley, driverId: 'emp2', pickup: 'Humanities Building', dropoff: 'Student Center', requestedTime: todayAt('12:15'), status: 'scheduled' });
    await addEvent(r5, null,   'requested');
    await addEvent(r5, OFFICE, 'approved');
    await addEvent(r5, 'emp2', 'claimed');

    const r6 = gid('ride'); // 13:30 scheduled: Recreation Center → Performing Arts Center (Casey)
    await insertRide({ rideId: r6, rider: casey, driverId: 'emp2', pickup: 'Recreation Center', dropoff: 'Performing Arts Center', requestedTime: todayAt('13:30'), status: 'scheduled' });
    await addEvent(r6, null,   'requested');
    await addEvent(r6, OFFICE, 'approved');
    await addEvent(r6, 'emp2', 'claimed');

    const r7 = gid('ride'); // 15:00 scheduled: Dining Hall North → Campus Bookstore (Riley)
    await insertRide({ rideId: r7, rider: riley, driverId: 'emp2', pickup: 'Dining Hall (North)', dropoff: 'Campus Bookstore', requestedTime: todayAt('15:00'), status: 'scheduled' });
    await addEvent(r7, null,   'requested');
    await addEvent(r7, OFFICE, 'approved');
    await addEvent(r7, 'emp2', 'claimed');

    console.log('[step 3] Jordan rides: 3 scheduled');

    // --- Morgan (emp4): 1 completed, 1 driver_arrived_grace, 1 scheduled ---

    const r8 = gid('ride'); // 10:20 completed: Transportation Hub → Fine Arts Building (Riley)
    await insertRide({ rideId: r8, rider: riley, driverId: 'emp4', pickup: 'Transportation Hub', dropoff: 'Fine Arts Building', requestedTime: todayAt('10:20'), status: 'completed' });
    await addEvent(r8, null,   'requested');
    await addEvent(r8, OFFICE, 'approved');
    await addEvent(r8, 'emp4', 'claimed');
    await addEvent(r8, 'emp4', 'on_the_way');
    await addEvent(r8, 'emp4', 'arrived');
    await addEvent(r8, 'emp4', 'completed');

    const r9 = gid('ride'); // 10:50 driver_arrived_grace: Aquatic Center → Gymnasium (Casey)
    const graceTime = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 minutes ago
    await insertRide({ rideId: r9, rider: casey, driverId: 'emp4', pickup: 'Aquatic Center', dropoff: 'Gymnasium', requestedTime: todayAt('10:50'), status: 'driver_arrived_grace', graceStart: graceTime });
    await addEvent(r9, null,   'requested');
    await addEvent(r9, OFFICE, 'approved');
    await addEvent(r9, 'emp4', 'claimed');
    await addEvent(r9, 'emp4', 'on_the_way');
    await addEvent(r9, 'emp4', 'arrived');
    await addEvent(r9, 'emp4', 'driver_arrived_grace');

    const r10 = gid('ride'); // 12:30 scheduled: Science Building → Parking Structure B (Riley)
    await insertRide({ rideId: r10, rider: riley, driverId: 'emp4', pickup: 'Science Building', dropoff: 'Parking Structure B', requestedTime: todayAt('12:30'), status: 'scheduled' });
    await addEvent(r10, null,   'requested');
    await addEvent(r10, OFFICE, 'approved');
    await addEvent(r10, 'emp4', 'claimed');

    console.log('[step 3] Morgan rides: 1 completed, 1 driver_arrived_grace, 1 scheduled');

    // --- Pending queue (unassigned, needs office approval) ---

    const r11 = gid('ride'); // 11:30 pending: Visitor Center → Residence Hall A (Riley)
    await insertRide({ rideId: r11, rider: riley, pickup: 'Visitor Center', dropoff: 'Residence Hall A', requestedTime: todayAt('11:30'), status: 'pending' });
    await addEvent(r11, null, 'requested');

    const r12 = gid('ride'); // 12:00 pending: Administration Building → Stadium (Casey)
    await insertRide({ rideId: r12, rider: casey, pickup: 'Administration Building', dropoff: 'Stadium', requestedTime: todayAt('12:00'), status: 'pending' });
    await addEvent(r12, null, 'requested');

    const r13 = gid('ride'); // 13:30 pending: Campus Security → Law School (Riley)
    await insertRide({ rideId: r13, rider: riley, pickup: 'Campus Security', dropoff: 'Law School', requestedTime: todayAt('13:30'), status: 'pending' });
    await addEvent(r13, null, 'requested');

    console.log('[step 3] Pending queue: 3 rides');

    // --- Approved unassigned (waiting for driver to claim) ---

    const r14 = gid('ride'); // 11:00 approved: Law School → Campus Quad (Riley)
    await insertRide({ rideId: r14, rider: riley, pickup: 'Law School', dropoff: 'Campus Quad', requestedTime: todayAt('11:00'), status: 'approved' });
    await addEvent(r14, null,   'requested');
    await addEvent(r14, OFFICE, 'approved');

    const r15 = gid('ride'); // 13:00 approved: Medical Center → Residence Hall B (Casey)
    await insertRide({ rideId: r15, rider: casey, pickup: 'Medical Center', dropoff: 'Residence Hall B', requestedTime: todayAt('13:00'), status: 'approved' });
    await addEvent(r15, null,   'requested');
    await addEvent(r15, OFFICE, 'approved');

    console.log('[step 3] Approved unassigned: 2 rides');

    await client.query('COMMIT');
    console.log('\n[done] Dispatch data ready. Drivers active: Alex, Jordan, Morgan. Taylor off-shift.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[error]', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
