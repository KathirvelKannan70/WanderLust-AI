import type { Itinerary } from '../types/itinerary';

export function generateMockItinerary(prompt = "", preferences: any = {}): Itinerary {
  const lowercasePrompt = prompt.toLowerCase();
  
  const durationMatch = lowercasePrompt.match(/(\d+)\s*days?/i);
  let duration = durationMatch ? parseInt(durationMatch[1], 10) : 4;
  if (duration < 1) duration = 1;
  if (duration > 14) duration = 14;

  let destination = "Custom Destination";
  const inMatch = prompt.match(/in\s+([A-Za-z\s,]+)/i);
  if (inMatch && inMatch[1]) {
    destination = inMatch[1].trim();
  } else {
    const words = prompt.replace(/\b(\d+|days|day|trip|for|a|in|on|budget|with)\b/gi, '').trim();
    if (words) {
      destination = words.charAt(0).toUpperCase() + words.slice(1);
    }
  }

  let currency = "USD";
  let estimatedCost = duration * 250;

  if (lowercasePrompt.includes("kumbakonam")) {
    destination = "Kumbakonam, Tamil Nadu, India";
    currency = "INR";
    estimatedCost = duration * 3500;
  } else if (lowercasePrompt.includes("paris") || lowercasePrompt.includes("france")) {
    destination = "Paris, France";
    currency = "EUR";
    estimatedCost = duration * 350;
  } else if (lowercasePrompt.includes("tokyo") || lowercasePrompt.includes("japan")) {
    destination = "Tokyo, Japan";
    currency = "USD";
    estimatedCost = duration * 300;
  }

  return {
    tripTitle: `${duration}-Day Immersive Journey to ${destination}`,
    destination: destination,
    durationDays: duration,
    estimatedTotalCost: estimatedCost,
    currency: currency,
    summary: `A carefully curated ${duration}-day travel itinerary for ${destination} featuring iconic cultural landmarks, authentic local cuisine, and optimal daily pacing based on your prompt: "${prompt}"`,
    travelTips: [
      `Check opening hours for major attractions in ${destination} before visiting.`,
      "Keep local currency handy for small street vendors and traditional crafts.",
      "Wear comfortable walking shoes for day explorations.",
      "Download offline Google Maps for easy navigation."
    ],
    days: Array.from({ length: duration }, (_, dIndex) => {
      const dayNum = dIndex + 1;
      return {
        dayNumber: dayNum,
        theme: getDayTheme(destination, dayNum),
        title: getDayTitle(destination, dayNum),
        stops: [
          {
            id: `day-${dayNum}-stop-1`,
            time: "08:30 AM",
            title: getStopTitle(destination, dayNum, 1),
            description: getStopDesc(destination, dayNum, 1),
            category: "sights",
            location: `${destination} Heritage Zone`,
            estimatedCost: Math.round(estimatedCost * 0.08),
            durationMinutes: 120,
            tips: "Early morning visits offer the best experience and fewer crowds.",
            mapQuery: `${getStopTitle(destination, dayNum, 1)} ${destination}`,
            completed: false,
          },
          {
            id: `day-${dayNum}-stop-2`,
            time: "12:30 PM",
            title: getStopTitle(destination, dayNum, 2),
            description: getStopDesc(destination, dayNum, 2),
            category: "food",
            location: `${destination} Central Market`,
            estimatedCost: Math.round(estimatedCost * 0.05),
            durationMinutes: 90,
            tips: "Authentic local dining spot highly recommended by travelers.",
            mapQuery: `${getStopTitle(destination, dayNum, 2)} ${destination}`,
            completed: false,
          },
          {
            id: `day-${dayNum}-stop-3`,
            time: "03:30 PM",
            title: getStopTitle(destination, dayNum, 3),
            description: getStopDesc(destination, dayNum, 3),
            category: "shopping",
            location: `${destination} Bazaar District`,
            estimatedCost: Math.round(estimatedCost * 0.06),
            durationMinutes: 105,
            tips: "Great spot for picking up unique handcrafted souvenirs.",
            mapQuery: `${getStopTitle(destination, dayNum, 3)} ${destination}`,
            completed: false,
          },
          {
            id: `day-${dayNum}-stop-4`,
            time: "07:00 PM",
            title: getStopTitle(destination, dayNum, 4),
            description: getStopDesc(destination, dayNum, 4),
            category: "food",
            location: `${destination} Main Square`,
            estimatedCost: Math.round(estimatedCost * 0.09),
            durationMinutes: 120,
            tips: "Enjoy traditional local dinner specialties and ambient night market.",
            mapQuery: `${getStopTitle(destination, dayNum, 4)} ${destination}`,
            completed: false,
          }
        ]
      };
    }),
    packingList: [
      {
        category: "Essentials",
        items: ["Government ID & Tickets", "Universal Power Bank", "Comfortable Walking Shoes", "Reusable Water Bottle"]
      },
      {
        category: "Clothing",
        items: ["Breathable Cotton Wear", "Traditional/Modest Attire for Temples", "Sun Protection / Sunglasses", "Light Umbrella"]
      },
      {
        category: "Personal Care",
        items: ["Sunscreen & Lotion", "Basic First Aid Kit", "Hand Sanitizer & Wipes"]
      }
    ]
  };
}

function getDayTheme(dest: string, day: number) {
  if (day === 1) return "Arrival & Ancient Heritage";
  if (day === 2) return "Temple Trails & Local Flavors";
  if (day === 3) return "Art, Architecture & Shopping";
  if (day === 4) return "Scenic Excursions & Rivers";
  return "Relaxed Cultural Wandering";
}

function getDayTitle(dest: string, day: number) {
  if (dest.includes("Kumbakonam")) {
    return [
      "Adi Kumbeswarar Temple & Mahamaham Tank",
      "Sarangapani & Ramaswamy Architecture",
      "Darasuram Airavatesvara UNESCO Temple",
      "Swamimalai Murugan Temple & Silk Weaving",
      "Kumbakonam Degree Coffee & Local Eats Trail"
    ][day - 1] || `Kumbakonam Temple Quest - Day ${day}`;
  }
  return `Exploring Highlights of ${dest} - Day ${day}`;
}

function getStopTitle(dest: string, day: number, stopNum: number) {
  if (dest.includes("Kumbakonam")) {
    const stops = [
      ["Adi Kumbeswarar Temple", "Famous Kumbakonam Degree Coffee", "Mahamaham Tank Walk", "Traditional South Indian Thali Lunch"],
      ["Sarangapani Temple", "Ramaswamy Temple Murals", "Sri Mangalambigai Mess", "Chakra Temple Exploration"],
      ["Darasuram Airavatesvara UNESCO Temple", "Silk Weaving Village Visit", "Venkataramana Hotel Dinner", "Kumbakonam Brass Vessel Market"],
      ["Swamimalai Bronze Sculpture Heritage", "Cauvery River Bank Stroll", "Murugan Temple Visit", "Local Sweet & Savory Tasting"],
      ["Uppiliappan Temple Excursion", "Rayas Grand Restaurant", "Kumbakonam Local Craft Shopping", "Sunset Heritage Walk"]
    ];
    return (stops[day - 1] && stops[day - 1][stopNum - 1]) || `${dest} Heritage Spot #${stopNum}`;
  }
  return `${dest} Landmark #${(day - 1) * 4 + stopNum}`;
}

function getStopDesc(dest: string, day: number, stopNum: number) {
  if (dest.includes("Kumbakonam")) {
    return `Discover the majestic Chola architecture, intricate stone carvings, and sacred spiritual heritage at this famous Kumbakonam landmark.`;
  }
  return `Immerse yourself in the local charm, culture, and architecture of ${dest}.`;
}
