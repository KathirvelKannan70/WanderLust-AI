import { Itinerary } from '../types/itinerary';

export function exportToJson(itinerary: Itinerary) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(itinerary, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `${itinerary.destination.toLowerCase().replace(/\s+/g, '-')}-itinerary.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToMarkdown(itinerary: Itinerary) {
  let md = `# ${itinerary.tripTitle}\n\n`;
  md += `**Destination:** ${itinerary.destination}  \n`;
  md += `**Duration:** ${itinerary.durationDays} Days  \n`;
  md += `**Estimated Total Cost:** ${itinerary.estimatedTotalCost} ${itinerary.currency}\n\n`;
  md += `### Summary\n${itinerary.summary}\n\n`;

  if (itinerary.travelTips && itinerary.travelTips.length > 0) {
    md += `### Local Insider Tips\n`;
    itinerary.travelTips.forEach((tip) => (md += `- ${tip}\n`));
    md += `\n`;
  }

  itinerary.days.forEach((day) => {
    md += `## Day ${day.dayNumber}: ${day.title} (${day.theme})\n\n`;
    day.stops.forEach((stop) => {
      md += `### [${stop.time}] ${stop.title}\n`;
      md += `- **Category:** ${stop.category}\n`;
      md += `- **Cost:** ${stop.estimatedCost} ${itinerary.currency}\n`;
      md += `- **Location:** ${stop.location}\n`;
      md += `- **Description:** ${stop.description}\n`;
      if (stop.tips) md += `- **Tip:** ${stop.tips}\n`;
      md += `\n`;
    });
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${itinerary.destination.toLowerCase().replace(/\s+/g, '-')}-itinerary.md`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function triggerPrintPdf() {
  window.print();
}
