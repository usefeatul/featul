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
				render={(triggerProps) => {
					const child = React.Children.only(
						children,
					) as React.ReactElement<any>;
					const triggerAttrs = triggerProps as Record<string, unknown>;
					return React.cloneElement(
						child,
						Object.assign({}, triggerAttrs, child.props),
					);
				}}
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
						"bg-card dark:bg-black text-card-foreground border border-border ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black shadow-none outline-hidden animate-in fade-in-0 zoom-in-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 z-50 w-fit max-w-[16rem] whitespace-normal break-words leading-relaxed rounded-md px-3 py-2 text-sm",
						className,
					)}
					{...props}
				>
					{children}
				</BaseTooltip.Popup>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
