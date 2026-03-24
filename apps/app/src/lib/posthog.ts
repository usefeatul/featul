"use client"

import posthog from "posthog-js"

export const analyticsEvents = {
  authMethodUsed: "auth_method_used",
  signInCompleted: "sign_in_completed",
  signUpCompleted: "sign_up_completed",
  emailVerificationRequired: "email_verification_required",
  workspaceSetupStepViewed: "workspace_setup_step_viewed",
  workspaceSetupStepCompleted: "workspace_setup_step_completed",
  workspaceSetupAbandoned: "workspace_setup_abandoned",
  workspaceCreated: "workspace_created",
  boardCreated: "board_created",
  postCreated: "post_created",
  postUpdated: "post_updated",
  postDeleted: "post_deleted",
  postsMerged: "posts_merged",
  commentCreated: "comment_created",
  imageUploaded: "image_uploaded",
  logoUploaded: "logo_uploaded",
  postVoteToggled: "post_vote_toggled",
  workspaceInviteSent: "workspace_invite_sent",
  inviteAccepted: "invite_accepted",
  inviteDeclined: "invite_declined",
  inviteUpdated: "invite_updated",
  inviteResent: "invite_resent",
  inviteRevoked: "invite_revoked",
  memberRoleUpdated: "member_role_updated",
  memberRemoved: "member_removed",
  brandingUpdated: "branding_updated",
  roadmapVisibilityChanged: "roadmap_visibility_changed",
  changelogVisibilityChanged: "changelog_visibility_changed",
  billingCheckoutStarted: "billing_checkout_started",
  billingPortalOpened: "billing_portal_opened",
  customDomainAdded: "custom_domain_added",
  customDomainVerified: "custom_domain_verified",
  customDomainVerificationFailed: "custom_domain_verification_failed",
  subscriptionUpgraded: "subscription_upgraded",
} as const

type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents]

type AnalyticsValue = string | number | boolean | null

export type AnalyticsProperties = Record<
  string,
  AnalyticsValue | undefined
>

function cleanProperties(properties?: AnalyticsProperties) {
  if (!properties) return undefined

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  )
}

function isPostHogConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_TOKEN)
}

export function captureAnalyticsEvent(
  event: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  if (!isPostHogConfigured()) return
  posthog.capture(event, cleanProperties(properties))
}

export function identifyAnalyticsUser(user: {
  id: string
  email?: string | null
  name?: string | null
}) {
  if (!isPostHogConfigured() || !user.id) return

  posthog.identify(
    user.id,
    cleanProperties({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
    }),
  )
}

export function resetAnalyticsUser() {
  if (!isPostHogConfigured()) return
  posthog.reset()
}
