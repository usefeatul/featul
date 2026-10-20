"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type {
  HelpAnalytics as HelpAnalyticsData,
  HelpArticleStat,
  HelpRangeTotals,
  HelpSearchStat,
} from "@featul/api/help/analytics";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import type { GradientColor } from "@featul/ui/components/gradient";
import { raisedCardClass } from "@featul/ui/lib/overlay";
import { fillOf } from "@featul/ui/lib/pixel";
import { rgb } from "@featul/ui/lib/palette";
import { cn } from "@featul/ui/lib/utils";
import {
  ArticleIcon,
  ArrowRight,
  DislikeIcon,
  EyeIcon,
  LikeIcon,
  LockIcon,
  Plus,
  SearchIcon,
  SparklesIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@/components/global/icons";
import { expectOk } from "@/hooks/useHelpTree";
import {
  DitherMeter,
  GlowWave,
  RingGauge,
  niceMax,
  pointX,
  type ChartDatum,
} from "./analytics/dither";

const RANGES = [7, 30, 90] as const;
/** Rows per list card, so paired cards line up. */
const LIST_LIMIT = 5;
type Range = (typeof RANGES)[number];

const number = new Intl.NumberFormat();
const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dayLabel = (day: string, withYear = false) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });

function helpfulRate(helpful: number, notHelpful: number) {
  const votes = helpful + notHelpful;
  return votes === 0 ? null : Math.round((helpful / votes) * 100);
}

const cardClass = cn(
  raisedCardClass,
  "relative isolate overflow-hidden rounded-2xl",
);

/**
 * Help center analytics as a board of cards: a dithered hero with the headline number, a
 * row of stat cards with sparklines, the daily chart, then a masonry of detail cards.
 * Each plan sees what it includes; the rest are previews that link to billing.
 */
export function HelpAnalytics({ workspaceSlug }: { workspaceSlug: string }) {
  const [days, setDays] = React.useState<Range>(30);
  const { data, error } = useQuery<HelpAnalyticsData>({
    queryKey: ["help-analytics", workspaceSlug, days],
    queryFn: async () => {
      const res = await client.help.analytics.$get({
        slug: workspaceSlug,
        days,
      });
      await expectOk(res, "Couldn't load help center analytics");
      return (await res.json()) as HelpAnalyticsData;
    },
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

  const billingHref = `/workspaces/${workspaceSlug}/settings/billing`;

  if (error) {
    return (
      <p className="px-4 py-10 text-sm text-muted-foreground sm:px-6">
        {error.message}
      </p>
    );
  }
  if (!data) return <AnalyticsSkeleton />;

  const { access, totals, range, previous, series } = data;
  const daily = (
    pick: (d: NonNullable<typeof series>[number]) => number,
  ): ChartDatum[] =>
    (series ?? []).map((d) => ({
      key: d.day,
      value: pick(d),
      label: dayLabel(d.day, true),
    }));
  const before = (pick: (d: NonNullable<typeof series>[number]) => number) =>
    data.previousSeries?.map(pick);
  const rate = range
    ? helpfulRate(range.helpful, range.notHelpful)
    : helpfulRate(totals.helpful, totals.notHelpful);
  const previousRate = previous
    ? helpfulRate(previous.helpful, previous.notHelpful)
    : null;

  return (
    <div className="space-y-4 px-4 pb-14 sm:px-6">
      <Hero
        views={range ? range.views : totals.views}
        previous={previous?.views}
        rate={rate}
        days={days}
        trends={access.trends}
        onDays={setDays}
        series={access.trends ? daily((d) => d.views) : null}
        billingHref={billingHref}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          color="primary"
          icon={EyeIcon}
          label="Article views"
          value={compact.format(range ? range.views : totals.views)}
          change={
            range && previous
              ? { now: range.views, before: previous.views }
              : undefined
          }
          spark={access.trends ? daily((d) => d.views) : undefined}
        />
        <StatCard
          color="green"
          icon={LikeIcon}
          label="Found it helpful"
          value={rate === null ? "—" : `${rate}%`}
          hint={rate === null ? "No votes yet" : undefined}
          change={
            rate !== null && previousRate !== null
              ? { now: rate, before: previousRate, points: true }
              : undefined
          }
          ring={rate === null ? undefined : rate / 100}
          ringCenter={<LikeIcon className="size-5 text-foreground/70" />}
        />
        {access.searches && range && previous ? (
          <>
            <StatCard
              color="purple"
              icon={SearchIcon}
              label="Searches"
              value={compact.format(range.searches)}
              change={{ now: range.searches, before: previous.searches }}
              spark={daily((d) => d.searches)}
            />
            <StatCard
              color="orange"
              icon={SparklesIcon}
              label="Unanswered"
              value={compact.format(range.gaps)}
              hint="of searches found nothing"
              change={{
                now: range.gaps,
                before: previous.gaps,
                lowerIsBetter: true,
              }}
              ring={range.searches > 0 ? range.gaps / range.searches : 0}
            />
          </>
        ) : (
          <>
            <StatCard
              color="purple"
              icon={ArticleIcon}
              label="Published articles"
              value={number.format(totals.published)}
            />
            <LockedStat
              label="Search insights"
              plan="Professional"
              href={billingHref}
            />
          </>
        )}
      </div>

      {access.trends && series && range ? (
        <TrendCard
          days={days}
          metrics={[
            {
              key: "views",
              label: "Views",
              unit: "views",
              color: "primary",
              total: range.views,
              series: daily((d) => d.views),
              previous: before((d) => d.views),
              previousTotal: previous?.views,
            },
            {
              key: "helpful",
              label: "Helpful votes",
              unit: "helpful votes",
              color: "green",
              total: range.helpful,
              series: daily((d) => d.helpful),
              previous: before((d) => d.helpful),
              previousTotal: previous?.helpful,
            },
            ...(access.searches
              ? [
                  {
                    key: "searches",
                    label: "Searches",
                    unit: "searches",
                    color: "purple" as const,
                    total: range.searches,
                    series: daily((d) => d.searches),
                    previous: before((d) => d.searches),
                    previousTotal: previous?.searches,
                  },
                ]
              : []),
          ]}
        />
      ) : (
        <LockedCard
          title="Trends and top articles"
          plan="Starter"
          href={billingHref}
          description="Daily views, the articles people read most, and the ones that aren't helping yet."
          tall
        />
      )}

      {access.trends ? (
        // Paired cards in an even grid: each row's cards stretch to the same height.
        <div className="grid gap-4 lg:grid-cols-2">
          <TopArticlesCard
            workspaceSlug={workspaceSlug}
            articles={(data.topArticles ?? []).slice(0, LIST_LIMIT)}
          />
          <NeedsWorkCard
            workspaceSlug={workspaceSlug}
            articles={(data.needsWork ?? []).slice(0, LIST_LIMIT)}
          />
          {access.searches ? (
            <>
              <GapsCard
                workspaceSlug={workspaceSlug}
                gaps={(data.gaps ?? []).slice(0, LIST_LIMIT)}
              />
              <SearchesCard
                searches={(data.topSearches ?? []).slice(0, LIST_LIMIT)}
              />
            </>
          ) : null}
          {range ? <VotesCard range={range} /> : null}
          {data.ai ? (
            <AskAiCard used={data.ai.used} limit={data.ai.limit} />
          ) : access.searches ? null : (
            <LockedCard
              title="Search insights"
              plan="Professional"
              href={billingHref}
              description="See what visitors search for, the questions your articles don't answer yet, and Ask AI usage."
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

function Hero({
  views,
  previous,
  rate,
  days,
  trends,
  onDays,
  series,
  billingHref,
}: {
  views: number;
  previous?: number;
  rate: number | null;
  days: Range;
  trends: boolean;
  onDays: (days: Range) => void;
  series: ChartDatum[] | null;
  billingHref: string;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 pb-6 pt-6 text-primary-foreground ring-1 ring-inset ring-black/5 sm:px-8 sm:pt-8 dark:ring-white/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground/75">
            {trends
              ? `Help center · last ${days} days`
              : "Help center · all time"}
          </p>
          <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
            {number.format(views)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-primary-foreground/85">
            <span>article views</span>
            {previous !== undefined ? (
              <Change now={views} before={previous} onBrand />
            ) : null}
            {rate !== null ? (
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                {rate}% found it helpful
              </span>
            ) : null}
          </div>
        </div>
        {trends ? (
          <div
            role="radiogroup"
            aria-label="Date range"
            className="flex items-center gap-0.5 rounded-full bg-black/15 p-1 backdrop-blur-sm"
          >
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={days === value}
                onClick={() => onDays(value)}
                className={cn(
                  "h-7 cursor-pointer rounded-full px-3 text-xs font-medium tabular-nums transition-colors",
                  days === value
                    ? "bg-white text-primary shadow-sm"
                    : "text-primary-foreground/80 hover:text-primary-foreground",
                )}
              >
                {value} days
              </button>
            ))}
          </div>
        ) : (
          <Button
            asChild
            size="sm"
            className="rounded-full bg-white text-primary hover:bg-white/90"
          >
            <Link href={billingHref}>
              Unlock trends
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
      {series ? (
        // Bleeds to the banner's bottom edge so the wave rises out of it.
        <GlowWave
          data={series}
          color={[255, 255, 255]}
          compact
          className="-mx-6 -mb-6 mt-6 h-24 sm:-mx-8"
          ariaLabel={`Daily article views over the last ${days} days`}
        />
      ) : null}
    </section>
  );
}

type ChangeInput = {
  now: number;
  before: number;
  lowerIsBetter?: boolean;
  points?: boolean;
};

function Change({
  now,
  before,
  lowerIsBetter = false,
  points = false,
  onBrand = false,
}: ChangeInput & { onBrand?: boolean }) {
  if (before === 0 && now === 0) return null;
  const diff = points
    ? now - before
    : before === 0
      ? null
      : Math.round(((now - before) / before) * 100);
  const up = now >= before;
  const good = lowerIsBetter ? !up : up;
  const Icon = up ? TrendUpIcon : TrendDownIcon;
  const text =
    diff === null
      ? "New"
      : `${diff > 0 ? "+" : ""}${diff}${points ? " pts" : "%"}`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        onBrand
          ? "bg-white/15 text-primary-foreground backdrop-blur-sm"
          : good
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-700 dark:text-rose-400",
      )}
      title="Compared with the previous period"
    >
      <Icon className="size-3" />
      {text}
      <span className="sr-only">
        compared with the previous period, {good ? "better" : "worse"}
      </span>
    </span>
  );
}

function StatCard({
  color,
  icon: Icon,
  label,
  value,
  hint,
  change,
  spark,
  ring,
  ringCenter,
}: {
  color: GradientColor;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  change?: ChangeInput;
  spark?: ChartDatum[];
  /** A radial gauge (0 to 1) shown beside the number instead of a sparkline. */
  ring?: number;
  /** Ring centre; defaults to the ring's percentage. */
  ringCenter?: React.ReactNode;
}) {
  return (
    <article className={cn(cardClass, "group/stat flex flex-col p-5")}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border/70 dark:bg-white/[0.04] dark:ring-white/10">
            <Icon className="size-3.5 text-foreground/70" />
          </span>
          {label}
        </span>
        {change ? <Change {...change} /> : null}
      </div>
      {ring !== undefined ? (
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1 min-h-4 text-xs text-muted-foreground">{hint}</p>
          </div>
          <RingGauge
            value={ring}
            color={swatch(color)}
            size={84}
            label={`${label}: ${value}`}
          >
            {ringCenter ?? (
              <span className="text-[11px] font-semibold tabular-nums text-foreground">
                {Math.round(ring * 100)}%
              </span>
            )}
          </RingGauge>
        </div>
      ) : (
        <>
          <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 min-h-4 text-xs text-muted-foreground">{hint}</p>
          <div className="-mx-5 -mb-5 mt-auto pt-4">
            {spark ? (
              <GlowWave
                data={spark}
                color={color}
                compact
                className="h-16"
                ariaLabel={`${label} trend, per day`}
              />
            ) : (
              <div className="h-16" />
            )}
          </div>
        </>
      )}
    </article>
  );
}

type TrendMetric = {
  key: string;
  label: string;
  color: GradientColor;
  total: number;
  series: ChartDatum[];
  /** The previous period's values, aligned by day index, drawn as a ghost line. */
  previous?: number[];
  previousTotal?: number;
  unit: string;
};

const swatch = (color: GradientColor) =>
  color === "primary" ? "var(--primary)" : rgb(fillOf(color));

/** Activity: pill tabs switch the metric's glow wave; last period rides along as a dashed ghost line. */
function TrendCard({
  metrics,
  days,
}: {
  metrics: TrendMetric[];
  days: number;
}) {
  const [selected, setSelected] = React.useState(metrics[0]!.key);
  const metric = metrics.find((m) => m.key === selected) ?? metrics[0]!;
  const series = metric.series;
  const top = niceMax(
    Math.max(1, ...series.map((d) => d.value), ...(metric.previous ?? [])),
  );
  const best = series.reduce((a, b) => (b.value > a.value ? b : a), series[0]!);
  const average = Math.round(metric.total / Math.max(1, series.length));
  const labelEvery = Math.max(1, Math.ceil(series.length / 6));

  return (
    <section className={cn(cardClass, "flex flex-col p-5 sm:p-6")}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Activity · {metric.label}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <p className="text-4xl font-semibold tabular-nums tracking-tight">
              {number.format(metric.total)}
            </p>
            {metric.previousTotal !== undefined ? (
              <Change now={metric.total} before={metric.previousTotal} />
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {number.format(average)} a day on average
            {best && best.value > 0 ? ` · busiest ${dayLabel(best.key)}` : ""}
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Chart metric"
          className="flex items-center gap-1 rounded-full bg-muted/70 p-1 ring-1 ring-border/60 dark:bg-white/[0.04] dark:ring-white/10"
        >
          {metrics.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={m.key === metric.key}
              onClick={() => setSelected(m.key)}
              className={cn(
                "flex h-8 cursor-pointer items-center gap-2 rounded-full px-3.5 text-xs font-medium transition-colors",
                m.key === metric.key
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/60 dark:bg-white/10 dark:ring-white/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor: swatch(m.color),
                  boxShadow:
                    m.key === metric.key
                      ? `0 0 8px ${swatch(m.color)}`
                      : undefined,
                }}
              />
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative mt-6 h-64">
        {[0, 0.5].map((at) => (
          <div
            key={at}
            aria-hidden
            className="absolute inset-x-0 border-t border-border/60 dark:border-white/[0.06]"
            style={{ top: `${at * 100}%` }}
          >
            <span className="absolute left-0 top-1 z-[1] rounded bg-card/90 px-1 text-[10px] tabular-nums text-muted-foreground">
              {compact.format(top * (1 - at))}
            </span>
          </div>
        ))}
        <GlowWave
          key={metric.key}
          data={series}
          previous={metric.previous}
          color={metric.color}
          max={top}
          interactive
          className="absolute inset-0"
          formatValue={(v) => `${number.format(v)} ${metric.unit}`}
          ariaLabel={`${metric.label} per day`}
        />
      </div>
      <div className="relative mt-3 h-4 text-[10px] text-muted-foreground">
        {series.map((d, i) =>
          i % labelEvery === 0 ? (
            <span
              key={d.key}
              className={cn(
                "absolute whitespace-nowrap",
                i === 0 ? "" : "-translate-x-1/2",
              )}
              style={{ left: `${pointX(i, series.length) * 100}%` }}
            >
              {dayLabel(d.key)}
            </span>
          ) : null,
        )}
      </div>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-0.5 w-4 rounded-full"
            style={{
              backgroundColor: swatch(metric.color),
              boxShadow: `0 0 6px ${swatch(metric.color)}`,
            }}
          />
          Last {days} days
        </span>
        {metric.previous ? (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-4 border-t border-dashed border-muted-foreground/60"
            />
            The {days} days before
          </span>
        ) : null}
      </div>
    </section>
  );
}

function CardHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="size-3.5 text-foreground/60" />
        {title}
      </h2>
      {action}
    </header>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pb-6 pt-2 text-sm text-muted-foreground">{children}</p>
  );
}

function TopArticlesCard({
  workspaceSlug,
  articles,
}: {
  workspaceSlug: string;
  articles: HelpArticleStat[];
}) {
  const top = Math.max(1, ...articles.map((a) => a.views));
  return (
    <section className={cardClass}>
      <CardHeader title="Most viewed" icon={EyeIcon} />
      {articles.length === 0 ? (
        <Empty>No article views in this range yet.</Empty>
      ) : (
        <ol className="space-y-1 px-2 pb-3">
          {articles.map((article, index) => (
            <li key={article.id}>
              <Link
                href={`/workspaces/${workspaceSlug}/help/${article.id}/edit`}
                className="group/row block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 dark:hover:bg-white/[0.04]"
              >
                <div className="flex items-baseline gap-3 text-sm">
                  <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {article.title}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {number.format(article.views)}
                  </span>
                </div>
                <DitherMeter
                  value={article.views / top}
                  cell={2}
                  className="ml-7 mt-2 h-2"
                  label={`${article.title}: ${article.views} views`}
                />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function VotesCard({ range }: { range: HelpRangeTotals }) {
  const votes = range.helpful + range.notHelpful;
  const rate = helpfulRate(range.helpful, range.notHelpful);
  return (
    <section className={cardClass}>
      <CardHeader title="Reader feedback" icon={LikeIcon} />
      <div className="px-5 pb-5">
        {votes === 0 ? (
          <p className="pt-1 text-sm text-muted-foreground">
            No votes in this range yet.
          </p>
        ) : (
          <>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {rate}%
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                helpful
              </span>
            </p>
            <DitherMeter
              value={range.helpful / votes}
              color="green"
              split={{ color: "red" }}
              className="mt-4 h-4"
              label={`${range.helpful} helpful and ${range.notHelpful} not helpful votes`}
            />
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <LikeIcon className="size-3.5" />
                {number.format(range.helpful)} helpful
              </span>
              <span className="flex items-center gap-1.5">
                {number.format(range.notHelpful)} not helpful
                <DislikeIcon className="size-3.5" />
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function NeedsWorkCard({
  workspaceSlug,
  articles,
}: {
  workspaceSlug: string;
  articles: HelpArticleStat[];
}) {
  return (
    <section className={cardClass}>
      <CardHeader title="Needs work" icon={DislikeIcon} />
      {articles.length === 0 ? (
        <Empty>No articles have been marked unhelpful.</Empty>
      ) : (
        <ul className="space-y-1 px-2 pb-3">
          {articles.map((article) => {
            const votes = article.helpful + article.notHelpful;
            const rate = helpfulRate(article.helpful, article.notHelpful) ?? 0;
            return (
              <li key={article.id}>
                <Link
                  href={`/workspaces/${workspaceSlug}/help/${article.id}/edit`}
                  className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">
                      {article.title}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {rate}% · {number.format(votes)} votes
                    </span>
                  </div>
                  <DitherMeter
                    value={article.helpful / Math.max(1, votes)}
                    color="green"
                    split={{ color: "red" }}
                    cell={2}
                    className="mt-2 h-2"
                    label={`${article.title}: ${rate}% helpful`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function SearchesCard({ searches }: { searches: HelpSearchStat[] }) {
  const top = Math.max(1, ...searches.map((s) => s.count));
  return (
    <section className={cn(cardClass, "flex flex-col")}>
      <CardHeader title="Top searches" icon={SearchIcon} />
      {searches.length === 0 ? (
        <Empty>No searches in this range yet.</Empty>
      ) : (
        <ol className="space-y-1 px-2 pb-3">
          {searches.map((search, index) => (
            <li key={search.query} className="rounded-xl px-3 py-2.5">
              <div className="flex items-baseline gap-3 text-sm">
                <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {search.query}
                </span>
                {search.results === 0 ? (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-dashed ring-border dark:ring-white/15">
                    No results
                  </span>
                ) : null}
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {number.format(search.count)}
                </span>
              </div>
              <DitherMeter
                value={search.count / top}
                color="purple"
                cell={2}
                className="ml-7 mt-2 h-2"
                label={`${search.query}: searched ${search.count} times`}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function GapsCard({
  workspaceSlug,
  gaps,
}: {
  workspaceSlug: string;
  gaps: HelpSearchStat[];
}) {
  const writeHref = (query: string) => {
    const title =
      query.charAt(0).toUpperCase() + query.slice(1).replace(/\?$/, "");
    return `/workspaces/${workspaceSlug}/help/new?title=${encodeURIComponent(title)}`;
  };
  return (
    <section className={cardClass}>
      <CardHeader
        title="Content gaps"
        icon={Plus}
        action={
          <span className="text-xs text-muted-foreground">
            Questions with no answer
          </span>
        }
      />
      {gaps.length === 0 ? (
        <Empty>Every search found something. Nice.</Empty>
      ) : (
        <ul className="space-y-1 px-2 pb-3">
          {gaps.map((gap) => (
            <li
              key={`${gap.source}:${gap.query}`}
              className="group/gap flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/60 dark:hover:bg-white/[0.04]"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/80 dark:bg-white/[0.05]">
                {gap.source === "ai" ? (
                  <SparklesIcon
                    aria-label="Asked AI"
                    className="size-3.5 text-foreground/60"
                  />
                ) : (
                  <SearchIcon
                    aria-label="Searched"
                    className="size-3.5 text-foreground/60"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {gap.query}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {number.format(gap.count)}{" "}
                  {gap.count === 1 ? "time" : "times"}
                </span>
              </span>
              <Button
                asChild
                size="sm"
                variant="plain"
                className="h-7 shrink-0 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Link href={writeHref(gap.query)}>
                  Write article
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AskAiCard({ used, limit }: { used: number; limit: number }) {
  const atLimit = used >= limit;
  return (
    <section className={cardClass}>
      <CardHeader title="Ask AI" icon={SparklesIcon} />
      <div className="px-5 pb-5">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {number.format(used)}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            of {number.format(limit)} answers
          </span>
        </p>
        <DitherMeter
          value={used / Math.max(1, limit)}
          color={atLimit ? "orange" : "purple"}
          className="mt-4 h-3"
          label={`${used} of ${limit} Ask AI answers used this month`}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          {atLimit
            ? "Paused until next month. Visitors can still search articles."
            : "Resets monthly. Questions that match no articles don't count."}
        </p>
      </div>
    </section>
  );
}

function LockedStat({
  label,
  plan,
  href,
}: {
  label: string;
  plan: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        cardClass,
        "group/locked flex flex-col justify-between p-5",
      )}
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border/70 dark:bg-white/[0.04] dark:ring-white/10">
          <LockIcon className="size-3 text-foreground/70" />
        </span>
        {label}
      </span>
      <span className="mt-8 flex items-center justify-between text-sm font-medium text-foreground">
        Available on {plan}
        <ArrowRight className="size-4 transition-transform group-hover/locked:translate-x-0.5" />
      </span>
    </Link>
  );
}

function LockedCard({
  title,
  plan,
  href,
  description,
  tall = false,
}: {
  title: string;
  plan: string;
  href: string;
  description: string;
  tall?: boolean;
}) {
  return (
    <section
      className={cn(
        cardClass,
        "flex flex-col justify-end p-6",
        tall ? "min-h-64" : "min-h-52",
      )}
    >
      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/70 backdrop-blur-sm dark:ring-white/10">
        <LockIcon className="size-3" />
        {plan}
      </span>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild size="sm" className="mt-4 w-fit rounded-full">
        <Link href={href}>
          Upgrade to {plan}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </section>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-14 sm:px-6">
      <div className="h-56 animate-pulse rounded-3xl bg-primary/15" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl bg-muted/60 dark:bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-muted/60 dark:bg-white/[0.04]" />
    </div>
  );
}
