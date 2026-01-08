"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { toast } from "sonner";

/**
 * Integration types supported by the system
 */
export type IntegrationType = "discord" | "slack";

/**
 * Integration data returned from the API
 */
export interface Integration {
  id: string;
  type: IntegrationType;
  isActive: boolean | null;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}

interface UseIntegrationsProps {
  workspaceSlug: string;
}

interface UseIntegrationsReturn {
  integrations: Integration[];
  isLoading: boolean;
  isPending: boolean;
  connect: (type: IntegrationType, webhookUrl: string) => Promise<boolean>;
  disconnect: (type: IntegrationType) => Promise<boolean>;
  test: (type: IntegrationType) => Promise<boolean>;
  getIntegration: (type: IntegrationType) => Integration | undefined;
  isConnected: (type: IntegrationType) => boolean;
}

/**
 * Hook for managing workspace integrations (Discord, Slack webhooks)
 */
export function useIntegrations({
  workspaceSlug,
}: UseIntegrationsProps): UseIntegrationsReturn {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  // Fetch integrations
  const { data, isLoading } = useQuery({
    queryKey: ["integrations", workspaceSlug],
    queryFn: async () => {
      const res = await client.integration.list.$get({
        workspaceSlug,
      });
      if (!res.ok) return { integrations: [] };
      return await res.json();
    },
    staleTime: 30_000,
  });

  const integrations = (data?.integrations ?? []) as Integration[];

  /**
   * Get a specific integration by type
   */
  const getIntegration = (type: IntegrationType): Integration | undefined => {
    return integrations.find((i) => i.type === type);
  };

  /**
   * Check if an integration type is connected
   */
  const isConnected = (type: IntegrationType): boolean => {
    return !!getIntegration(type);
  };

  /**
   * Connect a webhook integration
   */
  const connect = async (
    type: IntegrationType,
    webhookUrl: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const res = await client.integration.connect.$post({
            workspaceSlug,
            type,
            webhookUrl,
          });

          if (res.ok) {
            const data = await res.json();
            toast.success(data.message || `${type} connected successfully`);
            queryClient.invalidateQueries({
              queryKey: ["integrations", workspaceSlug],
            });
            resolve(true);
          } else {
            const error = await res.json();
            toast.error((error as any)?.message || `Failed to connect ${type}`);
            resolve(false);
          }
        } catch (error) {
          console.error("Failed to connect integration:", error);
          toast.error("Failed to connect integration");
          resolve(false);
        }
      });
    });
  };

  /**
   * Disconnect a webhook integration
   */
  const disconnect = async (type: IntegrationType): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const res = await client.integration.disconnect.$post({
            workspaceSlug,
            type,
          });

          if (res.ok) {
            const data = await res.json();
            toast.success(data.message || `${type} disconnected`);
            queryClient.invalidateQueries({
              queryKey: ["integrations", workspaceSlug],
            });
            resolve(true);
          } else {
            toast.error(`Failed to disconnect ${type}`);
            resolve(false);
          }
        } catch (error) {
          console.error("Failed to disconnect integration:", error);
          toast.error("Failed to disconnect integration");
          resolve(false);
        }
      });
    });
  };

  /**
   * Send a test notification
   */
  const test = async (type: IntegrationType): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const res = await client.integration.test.$post({
            workspaceSlug,
            type,
          });

          if (res.ok) {
            toast.success("Test notification sent successfully");
            resolve(true);
          } else {
            toast.error("Failed to send test notification");
            resolve(false);
          }
        } catch (error) {
          console.error("Failed to test integration:", error);
          toast.error("Failed to send test notification");
          resolve(false);
        }
      });
    });
  };

  return {
    integrations,
    isLoading,
    isPending,
    connect,
    disconnect,
    test,
    getIntegration,
    isConnected,
  };
}
