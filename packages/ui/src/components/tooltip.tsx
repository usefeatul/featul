"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "@featul/ui/lib/utils";

type TooltipProviderProps = React.PropsWithChildren<
	{
		delayDuration?: number;
	} & Omit<React.ComponentProps<typeof BaseTooltip.Provider>, "delay">
>;

function TooltipProvider({
	delayDuration = 150,
	children,
	...props
}: TooltipProviderProps) {
	return (
		<BaseTooltip.Provider
			data-slot="tooltip-provider"
			delay={delayDuration}
			{...props}
		>
			{children}
		</BaseTooltip.Provider>
	);
}

function Tooltip({ ...props }: React.ComponentProps<typeof BaseTooltip.Root>) {
	return (
		<TooltipProvider>
			<BaseTooltip.Root data-slot="tooltip" {...props} />
		</TooltipProvider>
	);
}

type BaseTriggerProps = React.ComponentPropsWithoutRef<
	typeof BaseTooltip.Trigger
>;

type TooltipTriggerProps = BaseTriggerProps & {
	asChild?: boolean;
	children?: React.ReactNode;
};

function TooltipTrigger({
	asChild,
	children,
	render: _render,
	...props
}: TooltipTriggerProps) {
	if (asChild) {
		return (
			<BaseTooltip.Trigger
				data-slot="tooltip-trigger"
				{...props}
				render={React.Children.only(children) as React.ReactElement}
			/>
		);
	}

	return (
		<BaseTooltip.Trigger data-slot="tooltip-trigger" {...props}>
			{children}
		</BaseTooltip.Trigger>
	);
}

type TooltipContentProps = React.ComponentPropsWithoutRef<
	typeof BaseTooltip.Popup
> & {
	sideOffset?: number;
	side?: React.ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>["side"];
	align?: React.ComponentPropsWithoutRef<
		typeof BaseTooltip.Positioner
	>["align"];
};

function TooltipContent({
	className,
	sideOffset = 6,
	side,
	align,
	children,
	...props
}: TooltipContentProps) {
	return (
		<BaseTooltip.Portal>
			<BaseTooltip.Positioner className="isolate z-50" sideOffset={sideOffset} side={side} align={align}>
				<BaseTooltip.Popup
					data-slot="tooltip-content"
					className={cn(
						"relative w-fit max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-foreground/60 bg-foreground bg-linear-to-b from-background/10 to-transparent px-2.5 py-1 text-xs font-normal leading-5 text-background whitespace-normal wrap-break-word outline-hidden [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.25)]",
						"shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.16),0_6px_16px_-4px_rgba(0,0,0,0.24)]",
						"origin-[var(--transform-origin)] transition-[opacity,scale,translate] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-ending-style:opacity-0 data-ending-style:duration-100 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-[0.97] motion-safe:data-starting-style:scale-[0.97] motion-safe:data-[side=bottom]:data-starting-style:-translate-y-0.5 motion-safe:data-[side=left]:data-starting-style:translate-x-0.5 motion-safe:data-[side=right]:data-starting-style:-translate-x-0.5 motion-safe:data-[side=top]:data-starting-style:translate-y-0.5 motion-reduce:transition-opacity",
						"[&_kbd]:border-background/15 [&_kbd]:bg-background/10 [&_kbd]:text-background/80",
						className,
					)}
					{...props}
				>
					{children}
					<BaseTooltip.Arrow className="-z-10 size-2.5 rotate-45 rounded-[1px] bg-inherit data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=inline-start]:-right-1 data-[side=inline-end]:-left-1" />
				</BaseTooltip.Popup>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
