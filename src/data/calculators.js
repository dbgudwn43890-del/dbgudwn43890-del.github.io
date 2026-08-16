// Single registry of every calculator on the site. Pages derive their links
// from this rather than each keeping its own hand-written list.
import materials from './materials.json';
import flooringTypes from './flooring.json';

export const CATEGORIES = {
  landscaping: {
    label: 'Landscaping',
    blurb: 'Bulk material for beds, paths and driveways — sold by the cubic yard and delivered by the ton.',
  },
  concrete: {
    label: 'Concrete',
    blurb: 'Slabs, footings and post holes, in cubic yards and bags.',
  },
  flooring: {
    label: 'Flooring',
    blurb: 'Floor coverings sold by the box or off a fixed-width roll.',
  },
  painting: {
    label: 'Painting',
    blurb: 'Paint and primer by the gallon, worked out surface by surface.',
  },
};

const CALCULATORS = [
  ...Object.entries(materials).map(([key, m]) => ({
    href: key === 'gravel' ? '/' : `/${m.category}/${key}-calculator/`,
    name: `${m.name} Calculator`,
    category: m.category,
    blurb: `How much ${m.name.toLowerCase()} you need, in cubic yards, tons and bags.`,
  })),
  {
    href: '/concrete/concrete-calculator/',
    name: 'Concrete Calculator',
    category: 'concrete',
    blurb: 'Slabs and fence post holes, plus whether to buy bags or order ready-mix.',
  },
  ...Object.entries(flooringTypes).map(([key, t]) => ({
    href: `/flooring/${key}-calculator/`,
    name: `${t.name} Calculator`,
    category: 'flooring',
    blurb:
      t.sold === 'roll'
        ? 'Roll length, seam count and square yards for a carpeted room.'
        : 'Square footage, waste allowance and whole boxes for any material and pattern.',
  })),
  {
    href: '/painting/paint-calculator/',
    name: 'Paint Calculator',
    category: 'painting',
    blurb: 'Gallons for walls, ceiling and trim, plus primer — and what to actually buy.',
  },
];

export const byCategory = (category) => CALCULATORS.filter((c) => c.category === category);

/** BreadcrumbList JSON-LD for a calculator page. `site` is Astro.site. */
export function breadcrumbs(site, category, name, href) {
  const url = (path) => new URL(path, site).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'All calculators', item: url('/calculators/') },
      { '@type': 'ListItem', position: 2, name: CATEGORIES[category].label, item: url(`/${category}/`) },
      { '@type': 'ListItem', position: 3, name, item: url(href) },
    ],
  };
}
