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
			<BaseTooltip.Positioner className="z-50" sideOffset={sideOffset} side={side} align={align}>
				<BaseTooltip.Popup
					data-slot="tooltip-content"
					className={cn(
						"overflow-hidden rounded-lg border border-[#444444] border-t-[#666666] border-b-[#181818] bg-[#3a3a3a] text-zinc-100 dark:border-[#d4d4d4] dark:border-t-white dark:border-b-[#bcbcbc] dark:bg-[#f5f5f5] dark:text-zinc-900",
						"w-fit max-w-[min(20rem,calc(100vw-1rem))] p-px outline-hidden origin-[var(--transform-origin)] transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
					)}
					{...props}
				>
					<div
						className={cn(
							"rounded-[6px] bg-[#292929] px-2.5 py-1 text-xs font-normal leading-5 text-inherit whitespace-normal wrap-break-word dark:bg-[#eeeeee]",
							"bg-[linear-gradient(180deg,#363636_0%,#252525_100%)] dark:bg-[linear-gradient(180deg,#dedede_0%,#f4f4f4_100%)]",
                            "[&_kbd]:border-white/15 [&_kbd]:bg-white/10 [&_kbd]:text-zinc-200 dark:[&_kbd]:border-black/10 dark:[&_kbd]:bg-black/[0.06] dark:[&_kbd]:text-zinc-600",
							className,
						)}
					>
						{children}
					</div>
				</BaseTooltip.Popup>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
