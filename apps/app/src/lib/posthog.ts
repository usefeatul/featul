"use client"

import posthog from "posthog-js"
import { readAnalyticsConsent, subscribeAnalyticsConsent } from "@featul/ui/lib/consent"

/** Canonical PostHog event names for product analytics. */
export const analyticsEvents = {
  authMethodUsed: "auth_method_used",
  signInCompleted: "sign_in_completed",
  signUpCompleted: "sign_up_completed",
  emailVerificationRequired: "email_verification_required",
  workspaceSetupStepViewed: "workspace_setup_step_viewed",
  workspaceSetupStepCompleted: "workspace_setup_step_completed",
  workspaceSetupAbandoned: "workspace_setup_abandoned",
  workspaceCreated: "workspace_created",
  welcomeTourStepViewed: "welcome_tour_step_viewed",
  welcomeTourFinished: "welcome_tour_finished",
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

let initialized = false
let optedIn = false
let currentUserId: string | null = null
let unsubscribe: (() => void) | undefined

/** No SDK initialization or collection occurs until an explicit, current consent exists. */
export function synchronizeAnalyticsConsent() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const allowed = Boolean(token) && readAnalyticsConsent() === "granted"
  if (!allowed) {
    if (initialized && optedIn) posthog.opt_out_capturing()
    optedIn = false
    return false
  }
  if (!initialized) {
    posthog.init(token!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2026-01-30",
      opt_out_capturing_by_default: true,
      persistence: "memory",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      advanced_disable_flags: true,
      ip: false,
      // Recheck each event so another tab's withdrawal is honored before the next poll.
      before_send: event => readAnalyticsConsent() === "granted" ? event : null,
    })
    initialized = true
  }
  if (!optedIn) {
    posthog.opt_in_capturing({ captureEventName: false })
    optedIn = true
    if (currentUserId) posthog.identify(currentUserId)
  }
  return true
}

export function startAnalyticsConsent() {
  synchronizeAnalyticsConsent()
  unsubscribe ??= subscribeAnalyticsConsent(synchronizeAnalyticsConsent)
}

export function captureAnalyticsEvent(event: AnalyticsEventName, properties?: AnalyticsProperties) {
  if (synchronizeAnalyticsConsent()) posthog.capture(event, cleanProperties(properties))
}

export function identifyAnalyticsUser(user: { id: string; email?: string | null; name?: string | null }) {
  const wasOptedIn = optedIn
  currentUserId = user.id || null
  if (synchronizeAnalyticsConsent() && wasOptedIn && currentUserId) posthog.identify(currentUserId)
}

export function resetAnalyticsUser() {
  currentUserId = null
  if (initialized) {
    posthog.reset()
    optedIn = false
    synchronizeAnalyticsConsent()
  }
}
