export interface TableOfContentsItem {
  title: string;
  page: number;
}

export const tableOfContents: TableOfContentsItem[] = [
  { title: 'MESSAGE FROM OUR POLITICAL LEADER', page: 4 },
  { title: 'THE VISION', page: 10 },
  { title: 'A RECOVERY PROGRAMME', page: 12 },
  { title: 'OUR TEAM', page: 14 },
  { title: 'THE TRANSFORMATIVE AGENDA', page: 16 },
  { title: 'TRANSFORMING OUR AGRICULTURE AND FISHERIES SECTOR', page: 23 },
  { title: 'REVITALIZING THE TOURISM SECTOR', page: 26 },
  { title: 'BUILDING A VIBRANT DIGITAL ECONOMY', page: 32 },
  { title: 'INVESTMENT, TRADE AND EXTERNAL RELATIONS', page: 38 },
  { title: 'INFRASTRUCTURE AND PORT DEVELOPMENT', page: 45 },
  { title: 'SECURING OUR ENERGY FUTURE THROUGH RENEWABLES', page: 50 },
  { title: 'GOVERNANCE AND LOCAL GOVERNMENT REFORM', page: 60 },
];

export function getSectionForPage(pageNumber: number): string | null {
  // Find the section that this page belongs to
  let currentSection: string | null = null;

  for (let i = 0; i < tableOfContents.length; i++) {
    const item = tableOfContents[i];
    const nextItem = tableOfContents[i + 1];

    if (pageNumber >= item.page && (!nextItem || pageNumber < nextItem.page)) {
      currentSection = item.title;
      break;
    }
  }

  return currentSection;
}
