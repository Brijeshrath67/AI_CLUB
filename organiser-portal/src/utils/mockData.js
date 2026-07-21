const NAMES = [
  'Aditya Sharma', 'Ananya Iyer', 'Rahul Verma', 'Sneha Patel', 
  'Vikram Malhotra', 'Diya Sen', 'Rohan Gupta', 'Kavya Nair', 
  'Arjun Mehta', 'Meera Rao', 'Siddharth Joshi', 'Pooja Bhat'
];

const EMAILS = [
  'aditya.s@college.edu', 'ananya.i@college.edu', 'rahul.v@college.edu', 'sneha.p@college.edu',
  'vikram.m@college.edu', 'diya.s@college.edu', 'rohan.g@college.edu', 'kavya.n@college.edu',
  'arjun.m@college.edu', 'meera.r@college.edu', 'sid.j@college.edu', 'pooja.b@college.edu'
];

export function getEventRegistrations(event) {
  if (!event || !event.id) return [];
  
  const key = `ml-hive_regs_${event.id}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored registrations:', e);
    }
  }

  // Generate deterministic mock registrations based on event id
  const regsCount = Math.min(event.capacity || 10, (event.id.charCodeAt(0) % 5) + 3);
  const registrations = [];
  
  // Base date around 1-5 days ago
  const baseTime = new Date(event.createdAt || Date.now()).getTime();

  for (let i = 0; i < regsCount; i++) {
    const nameIndex = (event.id.charCodeAt(i % event.id.length) + i) % NAMES.length;
    const dateOffset = (i + 1) * 4 * 60 * 60 * 1000; // 4 hours apart
    const regDate = new Date(baseTime + dateOffset);
    
    registrations.push({
      id: `tx_${event.id.slice(-4)}_${i}`,
      userName: NAMES[nameIndex],
      userEmail: EMAILS[nameIndex],
      amount: event.price,
      status: 'SUCCESS',
      createdAt: regDate.toISOString(),
      eventName: event.title,
      eventId: event.id
    });
  }

  // Sort by date descending
  registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  localStorage.setItem(key, JSON.stringify(registrations));
  return registrations;
}

export function addRealtimeRegistration(eventId, registration) {
  const key = `ml-hive_regs_${eventId}`;
  let current = [];
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      current = JSON.parse(stored);
    } catch (e) {}
  }
  
  const newReg = {
    id: registration.id || `tx_rt_${Math.random().toString(36).substr(2, 9)}`,
    userName: registration.userName,
    userEmail: registration.userEmail || `${registration.userName.toLowerCase().replace(' ', '.')}@college.edu`,
    amount: registration.amount,
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
    eventName: registration.eventName,
    eventId: eventId
  };

  current = [newReg, ...current];
  localStorage.setItem(key, JSON.stringify(current));
  return current;
}
