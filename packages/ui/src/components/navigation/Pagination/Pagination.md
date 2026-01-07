# Pagination Component

A flexible and customizable pagination component for navigating through multiple pages of content.

## Purpose and Use Cases

The Pagination component provides users with an intuitive way to navigate through large datasets split across multiple pages. It supports various visual styles and configurations to match different design requirements.

### Common Use Cases

- Table pagination for large datasets
- Search results pagination
- Product catalog navigation
- Blog post listings
- Gallery or media browsing
- API response pagination

## Features

- **Multiple Variants**: Default, rounded, dots, and minimal styles
- **Size Options**: Small, medium, and large sizes
- **Customizable Icons**: Custom first, last, previous, and next button icons
- **Page Info Display**: Optional page information text
- **Items Per Page**: Optional items per page selector
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Works well across different screen sizes
- **Theme Integration**: Supports light/dark themes and custom colors

## Props Documentation

### Core Props

| Prop       | Type                    | Default  | Description                          |
| ---------- | ----------------------- | -------- | ------------------------------------ |
| `page`     | `number`                | Required | Current active page number (1-based) |
| `count`    | `number`                | Required | Total number of pages                |
| `onChange` | `(event, page) => void` | Required | Callback when page changes           |

### Style Props

| Prop      | Type                                            | Default     | Description                |
| --------- | ----------------------------------------------- | ----------- | -------------------------- |
| `variant` | `'default' \| 'rounded' \| 'dots' \| 'minimal'` | `'default'` | Visual style variant       |
| `size`    | `'sm' \| 'md' \| 'lg'`                          | `'md'`      | Size of pagination buttons |
| `color`   | `'primary' \| 'secondary' \| 'standard'`        | `'primary'` | Color theme                |

### Navigation Props

| Prop              | Type      | Default | Description                               |
| ----------------- | --------- | ------- | ----------------------------------------- |
| `boundaryCount`   | `number`  | `1`     | Pages at beginning/end always visible     |
| `siblingCount`    | `number`  | `1`     | Pages before/after current always visible |
| `hideNextButton`  | `boolean` | `false` | Hide next page button                     |
| `hidePrevButton`  | `boolean` | `false` | Hide previous page button                 |
| `showFirstButton` | `boolean` | `false` | Show first page button                    |
| `showLastButton`  | `boolean` | `false` | Show last page button                     |

### Icon Props

| Prop           | Type        | Default              | Description               |
| -------------- | ----------- | -------------------- | ------------------------- |
| `firstIcon`    | `ReactNode` | `<FirstPage />`      | Custom first page icon    |
| `lastIcon`     | `ReactNode` | `<LastPage />`       | Custom last page icon     |
| `previousIcon` | `ReactNode` | `<NavigateBefore />` | Custom previous page icon |
| `nextIcon`     | `ReactNode` | `<NavigateNext />`   | Custom next page icon     |

### Display Props

| Prop                   | Type                      | Default                      | Description                    |
| ---------------------- | ------------------------- | ---------------------------- | ------------------------------ |
| `showPageInfo`         | `boolean`                 | `false`                      | Show page information text     |
| `pageInfoFormat`       | `(page, count) => string` | `'Page ${page} of ${count}'` | Custom page info formatter     |
| `showItemsPerPage`     | `boolean`                 | `false`                      | Show items per page selector   |
| `itemsPerPageOptions`  | `number[]`                | `[10, 25, 50, 100]`          | Items per page options         |
| `itemsPerPage`         | `number`                  | `10`                         | Current items per page         |
| `onItemsPerPageChange` | `(count) => void`         | `undefined`                  | Items per page change callback |

### Other Props

| Prop        | Type      | Default     | Description                     |
| ----------- | --------- | ----------- | ------------------------------- |
| `disabled`  | `boolean` | `false`     | Disable all pagination controls |
| `className` | `string`  | `undefined` | Additional CSS class name       |

## Usage Examples

### Basic Pagination

```tsx
import { Pagination } from '@/components/navigation/Pagination';

function BasicExample() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <Pagination page={page} count={totalPages} onChange={(event, newPage) => setPage(newPage)} />
  );
}
```

### With Page Info and Items Per Page

```tsx
function CompleteExample() {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Pagination
      page={page}
      count={totalPages}
      onChange={(event, newPage) => setPage(newPage)}
      showPageInfo
      showItemsPerPage
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={setItemsPerPage}
      itemsPerPageOptions={[10, 25, 50, 100]}
    />
  );
}
```

### Different Variants

```tsx
// Default variant (flat with hover effects)
<Pagination page={1} count={10} onChange={handleChange} />

// Rounded buttons
<Pagination
  page={1}
  count={10}
  onChange={handleChange}
  variant="rounded"
/>

// Minimal dots (for image galleries)
<Pagination
  page={1}
  count={10}
  onChange={handleChange}
  variant="dots"
/>

// Minimal text-only
<Pagination
  page={1}
  count={10}
  onChange={handleChange}
  variant="minimal"
/>
```

### With Custom Icons

```tsx
import { ArrowBack, ArrowForward } from '@mui/icons-material';

<Pagination
  page={1}
  count={10}
  onChange={handleChange}
  previousIcon={<ArrowBack />}
  nextIcon={<ArrowForward />}
  showFirstButton
  showLastButton
/>;
```

## Accessibility

The Pagination component is fully accessible:

- **Keyboard Navigation**: Full support for Tab, Enter, and arrow keys
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Works with high contrast themes
- **WCAG Compliance**: Meets WCAG 2.1 AA standards

### Keyboard Shortcuts

- `Tab` / `Shift+Tab`: Navigate between buttons
- `Enter` / `Space`: Activate focused button
- `Home`: Jump to first page (when first button visible)
- `End`: Jump to last page (when last button visible)
- `Arrow Keys`: Navigate between page buttons

## Best Practices

### Design Guidelines

1. **Use appropriate variants**:
   - `default` for data tables
   - `rounded` for modern interfaces
   - `dots` for image carousels/galleries
   - `minimal` for content-heavy layouts

2. **Choose the right size**:
   - `sm` for compact layouts or mobile
   - `md` for standard desktop interfaces
   - `lg` for touch-friendly or accessibility-focused designs

3. **Show relevant information**:
   - Enable `showPageInfo` for data contexts
   - Enable `showItemsPerPage` when users need control
   - Keep boundary/sibling counts reasonable (1-2)

### Performance Tips

1. **Debounce page changes** for API calls
2. **Use React.memo** for parent components
3. **Virtualize large datasets** when possible
4. **Cache page data** to improve navigation speed

### UX Recommendations

1. **Always show current page clearly**
2. **Provide context** with page info when helpful
3. **Use consistent placement** throughout your app
4. **Consider loading states** during page changes
5. **Test with screen readers** and keyboard navigation

## Theme Customization

The component respects your MUI theme configuration:

```tsx
// Custom theme colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
  },
});
```

## Common Patterns

### Table Pagination

```tsx
function TablePagination({ data, pageSize = 10 }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <Table data={paginatedData} />
      <Pagination
        page={page}
        count={totalPages}
        onChange={(_, newPage) => setPage(newPage)}
        showPageInfo
      />
    </div>
  );
}
```

### API Pagination

```tsx
function ApiPagination() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { data, totalPages } = useApiData(page);

  const handlePageChange = async (event, newPage) => {
    setLoading(true);
    setPage(newPage);
    // API call will be triggered by useApiData hook
  };

  return (
    <div>
      {loading && <LoadingSpinner />}
      <DataComponent data={data} />
      <Pagination
        page={page}
        count={totalPages}
        onChange={handlePageChange}
        disabled={loading}
        showPageInfo
        showItemsPerPage
        itemsPerPage={pageSize}
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
}
```
