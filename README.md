# Greastro

**Griffin's Web Services + React + Astro = Greastro**  
A type-safe, enterprise-ready static site generator built on Astro with advanced content management, relational queries, and automatic page generation.

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)

## Overview

Greastro extends Astro's content collections with a powerful, database-like query system, automatic page generation, hierarchical content relationships, and a flexible component architecture. It's designed for developers who want the performance of static sites with the flexibility of dynamic content management systems.

## Table of Contents

- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Advanced Features](#advanced-features)
- [API Reference](#api-reference)
- [Scripts](#scripts)
- [Contributing](#contributing)

## Key Features

### 🎯 Advanced Content Management
- **Type-safe content collections** with Zod validation
- **Automatic page generation** with configurable routing (`/collection/item` or `/item`)
- **Meta-driven configuration** via `_meta.mdx` files
- **Override pattern** for flexible content control (item → collection → system defaults)
- **MDX support** with frontmatter validation

### 🔍 Database-Like Query System
- **Relational queries** with graph-based relationship tracking
- **Hierarchical content** with parent-child relationships
- **Advanced filtering** with composable filter functions
- **Multi-level sorting** and pagination
- **Reference resolution** with lazy loading
- **Indirect relations** via multi-hop graph traversal
```typescript
// Query like a database
const posts = await query('blog')
  .where(whereEquals('author', 'jane-doe'))
  .orderBy(sortByDate('publishDate', 'desc'))
  .limit(10)
  .withRelations(true)
  .get();
```

### 🎨 Flexible Component System
- **ContentRenderer** component with multiple variants (Grid, List, Blog, Masonry, Accordion, etc.)
- **Dynamic layout system** with custom layouts per collection/item
- **Polymorphic button components** (renders as `<button>` or `<a>` based on props)
- **Type-safe icon system** supporting Lucide, Font Awesome, Simple Icons, and more
- **Reusable loop templates** for consistent content display

### 🗺️ Intelligent Menu System
- **Automatic menu generation** from content with `addToMenu` frontmatter
- **Hierarchical menus** with unlimited nesting
- **Semantic ID generation** preventing collisions
- **Desktop and mobile variants** with responsive behavior
- **Active state detection** with exact path matching

### 🔗 Smart Redirect Management
- **Automatic redirects** from `redirectFrom` frontmatter
- **Path alias redirects** (automatically redirect `/collection/item` ↔ `/item`)
- **Validation system** preventing circular redirects and conflicts
- **Security checks** against XSS and open redirects

### 🔍 SEO & Analytics
- **Comprehensive SEO** with Open Graph, Twitter Cards, and JSON-LD
- **Automatic metadata** from content frontmatter
- **Image optimization** with Astro's image service
- **Structured data** for rich search results
- **Cookie consent** with GDPR/CCPA compliance

### 🛠️ Developer Experience
- **Full TypeScript** with strict type safety
- **Hot module replacement** during development
- **Comprehensive error handling** with helpful messages
- **Automatic ID generation** for sections and components
- **Extensive utilities** for strings, paths, images, and more

## Architecture

### Content Collections
Collections are defined in `src/content/config.ts` and configured via `_meta.mdx` files:
```yaml
---
# src/content/blog/_meta.mdx
title: "Blog"
description: "Latest articles"
hasPage: true              # Generate /blog index page
itemsHasPage: true         # Generate individual post pages
itemsLayout: "BlogLayout"  # Custom layout for posts
itemsAddToMenu:
  - menu: "main-menu"      # Auto-add all posts to menu
---
```

### Query System
The query system builds a relationship graph at build time, enabling:
- Direct references (A → B)
- Reverse references (B ← A)
- Parent-child hierarchies
- Sibling relationships
- Ancestor/descendant chains
- Indirect relations (A → B → C)

### Page Generation
Pages are generated automatically based on configuration:
- **Collection index pages**: `/[collection]/index.astro`
- **Collection-level items**: `/[collection]/[slug].astro`
- **Root-level items**: `/[slug].astro`

Control via frontmatter:
```yaml
---
title: "About Us"
rootPath: true    # Generate at /about instead of /pages/about
hasPage: true     # Generate a page for this item
---
```

### Component Variants
The `ContentRenderer` component accepts a `variant` prop to render content in different layouts:
```astro
<!-- Grid layout -->
<ContentRenderer 
  query={query('services')} 
  variant="GridVariant" 
  columns={3} 
/>

<!-- Blog layout with metadata -->
<ContentRenderer 
  query={query('blog').limit(5)} 
  variant="BlogVariant" 
/>

<!-- Accordion for FAQs -->
<ContentRenderer 
  query={query('faq')} 
  variant="AccordionVariant" 
/>
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/griffinswebservices/greastro.git
cd greastro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Create Your First Collection

1. **Create a collection directory:**
```bash
mkdir src/content/products
```

2. **Add collection metadata:**
```yaml
# src/content/products/_meta.mdx
---
title: "Products"
description: "Our product catalog"
hasPage: true
itemsHasPage: true
---
```

3. **Add some content:**
```yaml
# src/content/products/widget-pro.mdx
---
title: "Widget Pro"
description: "Professional widget for serious users"
price: "$99"
---

The Widget Pro is our flagship product...
```

4. **Query and display:**
```astro
<ContentRenderer 
  query={query('products')} 
  variant="CardVariant"
  columns={3}
/>
```

## Project Structure
```
src/
├── components/
│   ├── ContentRenderer/      # Universal section renderer
│   │   ├── variants/         # Layout variants (Grid, Blog, List, etc.)
│   │   └── utils/            # Variant helpers and ID generation
│   ├── LoopComponents/       # Individual content cards
│   ├── LoopTemplates/        # Reusable templates (Accordion, Menu)
│   ├── Button/               # Polymorphic button system
│   └── consent/              # Cookie consent components
├── content/
│   ├── blog/                 # Blog posts
│   │   ├── _meta.mdx        # Collection configuration
│   │   └── *.mdx            # Individual posts
│   ├── authors/              # Author data
│   ├── services/             # Service offerings
│   └── menu-items/           # Menu structure
├── layouts/
│   ├── BaseLayout.astro      # Root HTML layout
│   ├── collections/          # Dynamic collection layouts
│   │   ├── CollectionLayout.astro  # Default item layout
│   │   └── BlogLayout.astro        # Blog-specific layout
│   └── SEO.astro             # SEO meta tags
├── pages/
│   ├── [collection]/
│   │   ├── index.astro       # Collection index
│   │   └── [slug].astro      # Collection items
│   ├── [slug].astro          # Root-level items
│   └── index.astro           # Homepage
└── utils/
    ├── query/                # Query system
    │   ├── query.ts          # Main query builder
    │   ├── graph.ts          # Relationship graph
    │   ├── relations.ts      # Relation resolution
    │   └── hierarchy.ts      # Parent-child queries
    ├── collections/          # Collection utilities
    ├── redirects/            # Redirect system
    ├── loaders/              # Custom Astro loaders
    └── pageGeneration/       # Static page helpers
```

## Configuration

### Content Collections
Define collections in `src/content/config.ts`:
```typescript
export const collections = {
  'products': defineCollection({
    schema: ({ image }) => baseSchema({ image }).extend({
      price: z.string(),
      features: z.array(z.string()).default([]),
    }),
  }),
};
```

### Redirects
Configure automatic redirects in `astro.config.mjs`:
```javascript
import { buildRedirectConfig } from './src/utils/redirects';

export default defineConfig({
  redirects: buildRedirectConfig(),
});
```

### SEO
Configure site-wide SEO in `src/content/siteData.ts`:
```typescript
export const siteData = {
  title: "Your Site Name",
  description: "Your site description",
  domain: "yoursite.com",
};
```

### Environment Variables
```env
PUBLIC_SITE_DOMAIN=yoursite.com
```

## Advanced Features

### Custom Layouts
Create custom layouts for collections:
```astro
// src/layouts/collections/ProductLayout.astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';

const { entry, Content } = Astro.props;
---

<BaseLayout>
  <h1>{entry.data.title}</h1>
  <p class="price">{entry.data.price}</p>
  <Content />
</BaseLayout>
```

Specify in `_meta.mdx`:
```yaml
---
itemsLayout: "ProductLayout"
---
```

### Hierarchical Content
Create parent-child relationships:
```yaml
# src/content/services/web-development.mdx
---
title: "Web Development"
order: 1
---

# src/content/services/frontend.mdx
---
title: "Frontend Development"
parent: "web-development"
order: 1
---
```

Query hierarchy:
```typescript
const children = await getChildren('services', 'web-development');
const tree = await getTree('services', 'web-development', 3);
```

### Relational Content
Reference other collections:
```yaml
---
title: "My Blog Post"
author: "jane-doe"  # References authors collection
tags: ["astro", "web-dev"]
---
```

Query with relations:
```typescript
const result = await query('blog')
  .withRelations(true, 2)
  .get();

// Access related author
const author = result.relations?.get('blog:my-post')?.references;
```

### Creating Custom Variants

Create a new variant in `src/components/ContentRenderer/variants/`:
```astro
---
// CustomVariant.astro
import type { BaseVariantProps } from "../ContentRenderer.types";

interface Props extends BaseVariantProps {
  customProp?: string;
}

const {
  items = [],
  title,
  description,
  customProp,
  id,
} = Astro.props as Props;
---

<section id={id} class="py-16">
  {title && <h2>{title}</h2>}
  {description && <p>{description}</p>}
  
  <div class="custom-grid">
    {items.map((item) => (
      <div class="custom-card">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    ))}
  </div>
</section>
```

Use it:
```astro
<ContentRenderer 
  query={query('products')} 
  variant="CustomVariant"
  customProp="value"
/>
```

## API Reference

### Query System

#### Basic Queries
```typescript
// Get all items
const all = await query('blog').all();

// Get with limit
const limited = await query('blog').limit(10).get();

// Find specific item
const item = await find('blog', 'my-post');
```

#### Filtering
```typescript
const filtered = await query('blog')
  .where(whereEquals('status', 'published'))
  .where(whereContains('title', 'astro', false))
  .where(whereAfter('publishDate', '2024-01-01'))
  .get();
```

#### Sorting
```typescript
const sorted = await query('blog')
  .orderBy(sortByDate('publishDate', 'desc'))
  .orderBy(sortBy('title', 'asc'))
  .get();
```

#### Pagination
```typescript
const page = 2;
const pageSize = 10;
const results = await query('blog')
  .orderBy(sortByDate())
  .limit(pageSize)
  .offset((page - 1) * pageSize)
  .get();
```

#### Relations
```typescript
// Get with relations
const withRelations = await query('blog')
  .withRelations(true, 2)  // depth of 2
  .get();

// Direct relation queries
const relations = await getRelations('blog', 'my-post');
const references = await getReferencedEntries('blog', 'my-post', {
  field: 'author',
  resolve: true,
});
```

#### Hierarchy
```typescript
// Parent-child
const parent = await getParent('services', 'frontend-dev');
const children = await getChildren('services', 'web-dev', {
  recursive: true,
  resolve: true,
});

// Ancestors and descendants
const ancestors = await getAncestors('services', 'react-dev');
const descendants = await getDescendants('services', 'web-dev');

// Tree structure
const tree = await getTree('services', 'web-dev', 3);

// Breadcrumbs
const breadcrumbs = await getBreadcrumbs('services', 'react-dev');
```

### ContentRenderer Props
```typescript
interface ContentRendererProps {
  query?: Query;           // Query object
  variant?: string;        // Variant name (default: 'GridVariant')
  title?: string;          // Section title
  description?: string;    // Section description
  id?: string;            // Manual section ID
  // Variant-specific props...
}
```

### Available Variants

- **GridVariant**: Responsive grid layout (1-6 columns)
- **ListVariant**: Vertical stack of horizontal cards
- **BlogVariant**: Article layout with metadata (1-3 columns)
- **CardVariant**: Feature showcase cards (1-4 columns)
- **MasonryVariant**: Pinterest-style layout
- **AccordionVariant**: Collapsible Q&A
- **HeroVariant**: Full-width hero section
- **ContactVariant**: Contact information cards
- **SocialMediaVariant**: Social media icons
- **MenuVariant**: Navigation menu

## Scripts
```bash
# Development
npm run dev                    # Start dev server
npx astro dev --host          # Start dev server (accessible on network)

# Production
npm run build                  # Build for production
npm run preview                # Preview production build

# Maintenance
rm -rf .astro node_modules/.astro dist  # Clear all caches
npx astro sync                 # Regenerate TypeScript types

# Utilities
npm run log-redirects          # Show all configured redirects
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ support required
- No IE11 support

## Performance

Greastro sites are highly optimized:
- **Static generation**: All pages built at compile time
- **Minimal JavaScript**: Only interactive components ship JS
- **Image optimization**: Automatic image optimization with Astro
- **Code splitting**: Automatic per-page code splitting
- **CSS scoping**: Scoped styles prevent bloat

Typical Lighthouse scores:
- Performance: 95-100
- Accessibility: 90-100
- Best Practices: 95-100
- SEO: 90-100

## Troubleshooting

### Types are out of sync
```bash
npx astro sync
```

### Build cache issues
```bash
rm -rf .astro node_modules/.astro dist
npm install
npm run build
```

### Query returns no results
- Check collection name spelling
- Verify `hasPage` settings in `_meta.mdx`
- Ensure items have frontmatter
- Clear cache and rebuild

### Menu items not appearing
- Check `addToMenu` configuration
- Verify menu reference: `menu: "main-menu"`
- Ensure parent items exist
- Check console for loader warnings

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Built with:
- [Astro](https://astro.build) - Static site framework
- [React](https://react.dev) - Component interactivity
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Zod](https://zod.dev) - Schema validation
- [React Icons](https://react-icons.github.io/react-icons/) - Icon system

## Support

- 📧 Email: [support@griffinswebservices.com](mailto:support@griffinswebservices.com)
- 🐛 Issues: [GitHub Issues](https://github.com/griffinswebservices/greastro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/griffinswebservices/greastro/discussions)

---

## What is Astro?

Astro is a web framework for building **content-driven websites** like blogs, marketing, and e-commerce. Greastro extends Astro with enterprise features for complex content management needs.

### Learn More About Astro

- 📚 [Documentation](https://docs.astro.build)
- 💬 [Discord Community](https://astro.build/chat)
- 🎓 [Tutorial](https://docs.astro.build/en/tutorial/0-introduction/)
- 🚀 [Integrations](https://astro.build/integrations/)

---

**Made with ❤️ by [Griffin's Web Services](https://griffinswebservices.com)**