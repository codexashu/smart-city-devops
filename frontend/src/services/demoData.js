export const SAMPLE_DEPARTMENTS = [
  { id: 1, name: 'Roads & Bridges', description: 'Road repairs, potholes, sidewalks, and bridges maintenance', active_complaints_count: 2, resolved_complaints_count: 5 },
  { id: 2, name: 'Water & Sewage', description: 'Water supply, pipeline leakages, drainage, and sewage maintenance', active_complaints_count: 1, resolved_complaints_count: 8 },
  { id: 3, name: 'Electricity & Power', description: 'Power outages, transformer faults, and electrical safety', active_complaints_count: 0, resolved_complaints_count: 12 },
  { id: 4, name: 'Sanitation & Waste', description: 'Garbage collection, waste dumping, and city cleanliness', active_complaints_count: 1, resolved_complaints_count: 15 },
  { id: 5, name: 'Street Lighting', description: 'Street light repairs, LED replacements, and timers', active_complaints_count: 0, resolved_complaints_count: 9 },
];

export const SAMPLE_COMPLAINTS = [
  {
    id: 1001,
    complaint_code: 'CMP-1001',
    title: 'Severe Pothole on Express Highway',
    description: 'Deep pothole causing heavy traffic slowdown and tire burst risk near metro pillar 142.',
    category: 'ROAD_DAMAGE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location_address: 'Pari Chowk, Greater Noida Expressway',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    citizen: { full_name: 'Ashutosh Pandey', email: 'citizen@smartcity.gov' },
    department: SAMPLE_DEPARTMENTS[0],
    history: [
      { id: 1, status: 'SUBMITTED', remarks: 'Issue registered by citizen via web portal.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 2, status: 'ASSIGNED', remarks: 'Reviewed and assigned to Roads & Bridges with HIGH priority.', created_at: new Date(Date.now() - 3600000 * 18).toISOString() },
      { id: 3, status: 'IN_PROGRESS', remarks: 'Road repair team dispatched with asphalt equipment.', created_at: new Date(Date.now() - 3600000 * 4).toISOString() }
    ]
  },
  {
    id: 1002,
    complaint_code: 'CMP-1002',
    title: 'Main Water Pipeline Burst & Flooding',
    description: 'Underground drinking water main cracked, wasting thousands of gallons and flooding Sector 62 road.',
    category: 'WATER_SEWAGE',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    location_address: 'Block C Market, Sector 62, Noida',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    citizen: { full_name: 'Rohit Sharma', email: 'rohit@gmail.com' },
    department: SAMPLE_DEPARTMENTS[1],
    history: [
      { id: 4, status: 'SUBMITTED', remarks: 'Complaint filed by citizen.', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 5, status: 'ASSIGNED', remarks: 'Assigned to Water & Sewage Department.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() }
    ]
  },
  {
    id: 1003,
    complaint_code: 'CMP-1003',
    title: 'Exposed High-Voltage Cable Near Park',
    description: 'Snapped overhead electrical wire hanging near children playground. Extreme danger.',
    category: 'ELECTRICITY',
    priority: 'CRITICAL',
    status: 'RESOLVED',
    location_address: 'Central Community Park, Alpha 1',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    resolution_remarks: 'Power isolated, wire replaced with underground conduit. Site safety inspected and cleared.',
    citizen: { full_name: 'Neha Gupta', email: 'neha@gmail.com' },
    department: SAMPLE_DEPARTMENTS[2],
    history: [
      { id: 6, status: 'SUBMITTED', remarks: 'Critical hazard reported.', created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
      { id: 7, status: 'ASSIGNED', remarks: 'Assigned to Electricity & Power Department.', created_at: new Date(Date.now() - 3600000 * 36).toISOString() },
      { id: 8, status: 'IN_PROGRESS', remarks: 'Emergency line crew arrived on site.', created_at: new Date(Date.now() - 3600000 * 20).toISOString() },
      { id: 9, status: 'RESOLVED', remarks: 'Hazard neutralized and reconnected safely.', created_at: new Date(Date.now() - 3600000 * 10).toISOString() }
    ]
  },
  {
    id: 1004,
    complaint_code: 'CMP-1004',
    title: 'Overflowing Municipal Garbage Dumpster',
    description: 'Municipal waste bin uncollected for 5 days, strong odor and blocking pedestrian walkway.',
    category: 'GARBAGE_WASTE',
    priority: 'MEDIUM',
    status: 'SUBMITTED',
    location_address: 'Govt High School Gate 2, Delta 2',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    citizen: { full_name: 'Ashutosh Pandey', email: 'citizen@smartcity.gov' },
    department: SAMPLE_DEPARTMENTS[3],
    history: [
      { id: 10, status: 'SUBMITTED', remarks: 'Complaint filed by citizen.', created_at: new Date(Date.now() - 3600000 * 6).toISOString() }
    ]
  },
  {
    id: 1005,
    complaint_code: 'CMP-1005',
    title: 'Row of 8 LED Streetlights Inoperative',
    description: 'Consecutive street light poles dark along main avenue. Hazardous driving conditions at night.',
    category: 'STREET_LIGHT',
    priority: 'HIGH',
    status: 'RESOLVED',
    location_address: 'Knowledge Park 3 Boulevard',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolution_remarks: 'Timer control unit replaced and blown breaker reset. All 8 poles tested operational.',
    citizen: { full_name: 'Pooja Verma', email: 'pooja@gmail.com' },
    department: SAMPLE_DEPARTMENTS[4],
    history: [
      { id: 11, status: 'SUBMITTED', remarks: 'Reported by citizen.', created_at: new Date(Date.now() - 3600000 * 72).toISOString() },
      { id: 12, status: 'ASSIGNED', remarks: 'Assigned to Street Lighting Team.', created_at: new Date(Date.now() - 3600000 * 50).toISOString() },
      { id: 13, status: 'IN_PROGRESS', remarks: 'Electrician van dispatched.', created_at: new Date(Date.now() - 3600000 * 30).toISOString() },
      { id: 14, status: 'RESOLVED', remarks: 'Breakers reset and timers calibrated.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() }
    ]
  }
];

export const SAMPLE_STATS = {
  summary: {
    total_complaints: 5,
    submitted: 1,
    assigned: 1,
    in_progress: 1,
    resolved: 2,
    resolution_rate: 40.0
  },
  by_category: {
    ROAD_DAMAGE: 1,
    WATER_SEWAGE: 1,
    ELECTRICITY: 1,
    GARBAGE_WASTE: 1,
    STREET_LIGHT: 1
  },
  department_performance: [
    { department_id: 1, name: 'Roads & Bridges', total_assigned: 1, resolved: 0, resolution_rate: 0 },
    { department_id: 2, name: 'Water & Sewage', total_assigned: 1, resolved: 0, resolution_rate: 0 },
    { department_id: 3, name: 'Electricity & Power', total_assigned: 1, resolved: 1, resolution_rate: 100 },
    { department_id: 4, name: 'Sanitation & Waste', total_assigned: 1, resolved: 0, resolution_rate: 0 },
    { department_id: 5, name: 'Street Lighting', total_assigned: 1, resolved: 1, resolution_rate: 100 }
  ]
};
