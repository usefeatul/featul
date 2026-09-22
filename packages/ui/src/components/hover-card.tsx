"use client";

import * as React from "react";
import { PreviewCard } from "@base-ui/react/preview-card";

import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

function HoverCard({
	...props
}: React.ComponentProps<typeof PreviewCard.Root>) {
	return <PreviewCard.Root data-slot="hover-card" {...props} />;
}

type BaseTriggerProps = React.ComponentPropsWithoutRef<
	typeof PreviewCard.Trigger
>;

type HoverCardTriggerProps = BaseTriggerProps & {
	asChild?: boolean;
	children?: React.ReactNode;
};

function HoverCardTrigger({
	asChild,
	children,
	delay = 400,
	closeDelay = 150,
	render: _render,
	...props
}: HoverCardTriggerProps) {
	if (asChild) {
		return (
			<PreviewCard.Trigger
				data-slot="hover-card-trigger"
				{...props}
				delay={delay}
				closeDelay={closeDelay}
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
		<PreviewCard.Trigger
			data-slot="hover-card-trigger"
			delay={delay}
			closeDelay={closeDelay}
			{...props}
		>
			{children}
		</PreviewCard.Trigger>
	);
}

type HoverCardContentProps = React.ComponentPropsWithoutRef<
	typeof PreviewCard.Popup
> & {
	sideOffset?: number;
	side?: React.ComponentPropsWithoutRef<typeof PreviewCard.Positioner>["side"];
	align?: React.ComponentPropsWithoutRef<
		typeof PreviewCard.Positioner
	>["align"];
	innerClassName?: string;
};

function HoverCardContent({
	className,
	innerClassName,
	sideOffset = 8,
	side = "top",
	align = "start",
	children,
	...props
}: HoverCardContentProps) {
	return (
		<PreviewCard.Portal>
			<PreviewCard.Positioner
				sideOffset={sideOffset}
				side={side}
				align={align}
			>
				<PreviewCard.Popup
					data-slot="hover-card-content"
					className={cn(
						overlayShellClass,
						"z-50 w-80 p-1 outline-hidden animate-in fade-in-0 zoom-in-95 data-ending-style:opacity-0 data-starting-style:opacity-0",
						className,
					)}
					{...props}
				>
					<div
						className={cn(overlayInnerClass, innerClassName ?? "p-3")}
					>
						{children}
					</div>
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	);
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
