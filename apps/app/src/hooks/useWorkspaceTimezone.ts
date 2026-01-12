import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { toast } from "sonner";

export function useWorkspaceTimezone(slug: string, initialTimezone?: string) {
    const queryClient = useQueryClient();

    // Query for fetching timezone
    const { data: timezone } = useQuery<string>({
        queryKey: ["workspace-timezone", slug],
        queryFn: async () => {
            if (!slug) return "UTC";
            const res = await client.workspace.bySlug.$get({ slug });
            const data = await res.json();
            return data?.workspace?.timezone || "UTC";
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000, // 5 minutes - timezone changes are rare
        gcTime: 10 * 60 * 1000, // 10 minutes cache
        refetchOnMount: false, // Don't refetch on mount if we have cached data
        refetchOnWindowFocus: false, // Don't refetch on window focus
        placeholderData: initialTimezone || "UTC", // Use placeholder to prevent loading state
    });

    // Mutation for updating timezone
    const mutation = useMutation({
        mutationFn: async (newTimezone: string) => {
            const res = await client.workspace.updateTimezone.$post({
                slug,
                timezone: newTimezone,
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !("ok" in data) || !data.ok) {
                const message = (data as { message?: string })?.message || "Failed to update timezone";
                throw new Error(message);
            }

            return newTimezone;
        },
        onMutate: async (newTimezone) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["workspace-timezone", slug] });

            // Snapshot the previous value
            const previousTimezone = queryClient.getQueryData<string>(["workspace-timezone", slug]);

            // Optimistically update to the new value
            queryClient.setQueryData<string>(["workspace-timezone", slug], newTimezone);

            return { previousTimezone };
        },
        onError: (error, _newTimezone, context) => {
            // Rollback to the previous value on error
            if (context?.previousTimezone) {
                queryClient.setQueryData<string>(["workspace-timezone", slug], context.previousTimezone);
            }
            toast.error(error.message || "Failed to update timezone");
        },
        onSuccess: () => {
            toast.success("Timezone updated");
            // Invalidate workspace query to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ["workspace", slug] });
        },
    });

    return {
        timezone: timezone || "UTC",
        updateTimezone: mutation.mutate,
        isUpdating: mutation.isPending,
    };
}
