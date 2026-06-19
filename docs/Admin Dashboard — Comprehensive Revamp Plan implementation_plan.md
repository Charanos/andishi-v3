# Admin Dashboard - Comprehensive Revamp Plan

## Goal
Systematically revamp all admin dashboard pages, charts, cards, tables, and components to the same level of design quality and UX robustness already established in the client and engineer pages. Apply the project's design language consistently across every element.

## Design System Reference (Existing Patterns)
From the screenshots and code analysis, the established patterns are:
- **Dark surface palette**: `var(--bg-deep)` → `var(--surface)` → `var(--surface-high)` → glass
- **Glassmorphism**: `backdrop-blur-2xl`, `border border-[var(--glass-border)]`, `bg-gradient-to-br from-[color-mix...]`
- **Rounded corners**: `rounded-[1.2rem]` to `rounded-[1.75rem]` for cards, `rounded-full` for buttons/pills
- **Glowing rings**: SVG-based circular progress indicators (ReadinessRing, HealthRing, MarginRing)
- **Signal bars**: Labeled gradient progress bars with percentage
- **KPI cards**: `min-h-[14rem]` with polymorphic visualizer (chart toggle)
- **Charts**: `DashboardLineChart` (area), `DashboardBarChart`, `DashboardDonutChart` from recharts
- **Color tokens**: `var(--primary)` (cyan), `var(--secondary)` (indigo/violet), `var(--tertiary)` (green)
- **Typography**: `label-caps`, `title-serif`, `font-mono` for values
- **Tables**: `OperationalDataTable` with glass header, sticky scroll, action column

## Open Questions

> [!IMPORTANT]
> No blocking questions. Proceeding based on established patterns visible in the screenshots and codebase.

## Proposed Changes

### Phase 1 - Shared Components (Foundation)

#### [MODIFY] [operational-data-table.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/operational-data-table.tsx)
- Add sortable column headers with visual sort indicators
- Add row hover with left-border accent highlight
- Add sticky header on scroll
- Improve empty state with icon
- Add subtle row alternation for density

#### [MODIFY] [kpi-card-client.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/kpi-card-client.tsx)
- Enhance the sparkline chart container with better animations
- Improve the polymorphic visualizer switch button affordance
- Add animated number counters for values
- Improve trend indicator with icon arrows

#### [MODIFY] [dashboard-chart.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/dashboard-chart.tsx)
- Add `DashboardRadialBarChart` for multi-metric radial charts
- Improve tooltip styling consistency
- Add animated entry for all chart types
- Add `DashboardGroupedBarChart` for side-by-side comparisons

---

### Phase 2 - Admin Page Revamps

#### [MODIFY] [admin-engineers-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-engineers-page.tsx)
- **EngineerCard**: Add animated fit signal bars (all 4 signals visible on card), improve Signal cell grid with hover lift effect, add domain color-coded left border accent
- **EngineerTalentRoom**: Revamp the talent room section with richer layout (dossier card pattern from screenshots)
- **EngineerSupplyMap**: Enhance the domain capacity chart with labeled segment annotations
- **ChartPanel**: Upgrade readiness movement chart to use labeled axes and reference lines
- **KPI Cards**: Connect to actual `metricType` polymorphic visualizers properly

#### [MODIFY] [admin-clients-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-clients-page.tsx)
- **ClientCard**: Add health ring, risk signal, billing posture colored badge, relationship score bar
- **ClientAccountRoom**: Revamp command room with portfolio economics card matching screenshot pattern
- **ClientPortfolioMap**: Enhance with pressure map UI showing client health distribution
- **ChartPanel**: Improve portfolio health movement with labeled data points
- **Signal cells**: Add color-coded health thresholds (green/amber/red)

#### [MODIFY] [admin-briefs-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-briefs-page.tsx)
- **BriefQueueCard**: Add SLA urgency ring, priority score badge, match count pill
- **BriefCommandModal**: Richer candidate matching panel with dimension radar-style display
- **AnalyticsCard**: Improve the analytics container with better chart sizing and metric placement
- **PipelineStageStrip**: Animated stage indicator with count bubbles

#### [MODIFY] [admin-placements-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-placements-page.tsx)
- **PlacementCard**: Revamp to match screenshot pattern with health ring, billing/hours/model signal cells, milestone progress bar with label
- **PlacementMetric**: Upgrade from simple metric strip to full KpiCard-style component with sparkline
- **Billing trend chart**: Improve with labeled axes and weekly markers
- **PlacementDetailModal**: Richer delivery tab with signal bars for all metrics

#### [MODIFY] [admin-shortlists-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-shortlists-page.tsx)
- **ShortlistCard**: Add slot fill indicator, client tier badge, deadline urgency
- **Slate workspace**: Revamp main dossier area with network evidence chart matching screenshot  
- **EngineerDimensions**: Replace simple dimension bars with radar-style visual
- **KpiCards**: Wire up to polymorphic visualizers correctly

#### [MODIFY] [admin-revenue-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-revenue-page.tsx)
- **FinanceCard**: Add margin ring indicator, risk badge, billing model pill
- **RevenueStrategyRoom**: Enhance with forecast chart and model mix bar
- **FinanceObservability**: Add grouped bar chart for margin band analysis
- **KpiCards**: Wire up properly with trend direction icons

#### [MODIFY] [admin-payments-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-payments-page.tsx)
- Apply consistent card, table, and chart patterns

#### [MODIFY] [admin-pipeline-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-pipeline-page.tsx)
- Apply consistent patterns with funnel chart improvements

---

## Execution Order

1. `operational-data-table.tsx` - Shared table improvements (used everywhere)
2. `kpi-card-client.tsx` + `dashboard-chart.tsx` - Core chart/KPI improvements
3. `admin-engineers-page.tsx` - Already partially done, finalize
4. `admin-clients-page.tsx` - Full card + room revamp
5. `admin-placements-page.tsx` - Card + metrics revamp
6. `admin-briefs-page.tsx` - Queue card + analytics revamp
7. `admin-shortlists-page.tsx` - Slate workspace revamp
8. `admin-revenue-page.tsx` - Finance card + charts revamp
9. Remaining pages: payments, pipeline, audit, workspace

## Verification Plan

### Manual Verification
- Dev server running at localhost:3000 - navigate each admin page
- Check card layouts at multiple breakpoints
- Verify all chart tooltips render correctly
- Confirm KPI card polymorphic visualizers toggle properly
- Validate table sorting and row select behavior
