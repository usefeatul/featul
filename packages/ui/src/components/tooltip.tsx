"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

type TooltipProviderProps = React.PropsWithChildren<
	{
		delayDuration?: number;
	} & Omit<React.ComponentProps<typeof BaseTooltip.Provider>, "delay">
>;

function TooltipProvider({
	delayDuration = 0,
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
	sideOffset = 0,
	side,
	align,
	children,
	...props
}: TooltipContentProps) {
	return (
		<BaseTooltip.Portal>
			<BaseTooltip.Positioner sideOffset={sideOffset} side={side} align={align}>
				<BaseTooltip.Popup
					data-slot="tooltip-content"
					className={cn(
						overlayShellClass,
						"z-50 w-fit max-w-3xs p-1 outline-hidden animate-in fade-in-0 zoom-in-95 data-ending-style:opacity-0 data-starting-style:opacity-0",
					)}
					{...props}
				>
					<div
						className={cn(
							overlayInnerClass,
							"bg-black px-1.5 py-1 text-[11px] leading-normal text-white whitespace-normal wrap-break-word dark:bg-white dark:text-zinc-900",
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
