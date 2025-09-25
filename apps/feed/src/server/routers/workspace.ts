import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { workspace, workspaceMember } from "@feedgot/db";
import { privateProcedure, publicProcedure, j } from "../jstack";

export const workspaceRouter = j.router({
  // Create a new workspace
  // create: privateProcedure(async ({ ctx, input }: { ctx: any; input: any }) => {
  //   const { db, session } = ctx;
  //   const { name, slug } = input || {};
    
  //   if (!name || !slug) {
  //     throw new Error("Name and slug are required");
  //   }
    
  //   // Validate slug format
  //   if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 1 || slug.length > 50) {
  //     throw new Error("Slug can only contain lowercase letters, numbers, and hyphens (1-50 characters)");
  //   }
    
  //   try {
  //     // Check if slug is already taken
  //     const existingWorkspace = await db
  //       .select({ id: workspace.id })
  //       .from(workspace)
  //       .where(eq(workspace.slug, slug))
  //       .limit(1);
      
  //     if (existingWorkspace.length > 0) {
  //       throw new Error("Slug is already taken");
  //     }
      
  //     // Create the workspace
  //     const [newWorkspace] = await db
  //       .insert(workspace)
  //       .values({
  //         name,
  //         slug,
  //         ownerId: session.user.id,
  //       })
  //       .returning();
      
  //     // Add the creator as owner to workspace members
  //     await db
  //       .insert(workspaceMember)
  //       .values({
  //         workspaceId: newWorkspace.id,
  //         userId: session.user.id,
  //         role: "owner",
  //         isActive: true,
  //       });
      
  //     return newWorkspace;
  //   } catch (error) {
  //     throw new Error(error instanceof Error ? error.message : "Failed to create workspace");
  //   }
  // }),

  // Check if a slug is available
  // checkSlugAvailability: publicProcedure(async ({ ctx, input }: { ctx: any; input: any }) => {
  //   const { db } = ctx;
  //   const slug = input?.slug;
    
  //   if (!slug || typeof slug !== 'string') {
  //     throw new Error("Slug is required");
  //   }
    
  //   // Validate slug format
  //   if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 1 || slug.length > 50) {
  //     throw new Error("Slug can only contain lowercase letters, numbers, and hyphens (1-50 characters)");
  //   }
    
  //   try {
  //     const existingWorkspace = await db
  //       .select({ id: workspace.id })
  //       .from(workspace)
  //       .where(eq(workspace.slug, slug))
  //       .limit(1);
      
  //     return {
  //       available: existingWorkspace.length === 0,
  //       slug
  //     };
  //   } catch (error) {
  //     throw new Error("Failed to check slug availability");
  //   }
  // }),

  // // Get user's workspaces
  // getUserWorkspaces: privateProcedure(async ({ ctx }: { ctx: any }) => {
  //   const { db, session } = ctx;
    
  //   try {
  //     const userWorkspaces = await db
  //       .select({
  //         id: workspace.id,
  //         name: workspace.name,
  //         slug: workspace.slug,
  //         logo: workspace.logo,
  //         primaryColor: workspace.primaryColor,
  //         theme: workspace.theme,
  //         role: workspaceMember.role,
  //         createdAt: workspace.createdAt,
  //       })
  //       .from(workspace)
  //       .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
  //       .where(
  //         and(
  //           eq(workspaceMember.userId, session.user.id),
  //           eq(workspaceMember.isActive, true)
  //         )
  //       );

  //     return userWorkspaces;
  //   } catch (error) {
  //     throw new Error("Failed to fetch user workspaces");
  //   }
  // }),

  // Get workspace by slug
  getBySlug: publicProcedure(async ({c}) => {
    const { db } = c;
    const slug = input?.slug;
    
    if (!slug) {
      throw new Error("Slug is required");
    }
    
    try {
      const [workspaceData] = await db
        .select({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo: workspace.logo,
          primaryColor: workspace.primaryColor,
          theme: workspace.theme,
          createdAt: workspace.createdAt,
        })
        .from(workspace)
        .where(eq(workspace.slug as any, slug))
        .limit(1);
      
      if (!workspaceData) {
        throw new Error("Workspace not found");
      }
      
      return workspaceData;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch workspace");
    }
  }),

  // // Update workspace
  // update: privateProcedure(async ({ ctx, input }: { ctx: any; input: any }) => {
  //   const { db, session } = ctx;
  //   const { id, name, logo, primaryColor, theme } = input || {};
    
  //   if (!id) {
  //     throw new Error("Workspace ID is required");
  //   }
    
  //   try {
  //     // Check if user has permission to update this workspace
  //     const memberCheck = await db
  //       .select({ role: workspaceMember.role })
  //       .from(workspaceMember)
  //       .where(
  //         and(
  //           eq(workspaceMember.workspaceId, id),
  //           eq(workspaceMember.userId, session.user.id),
  //           eq(workspaceMember.isActive, true)
  //         )
  //       )
  //       .limit(1);
      
  //     if (memberCheck.length === 0 || !['owner', 'admin'].includes(memberCheck[0].role)) {
  //       throw new Error("Insufficient permissions to update workspace");
  //     }
      
  //     const updateData: any = {};
  //     if (name) updateData.name = name;
  //     if (logo !== undefined) updateData.logo = logo;
  //     if (primaryColor) updateData.primaryColor = primaryColor;
  //     if (theme) updateData.theme = theme;
      
  //     const [updatedWorkspace] = await db
  //       .update(workspace)
  //       .set(updateData)
  //       .where(eq(workspace.id, id))
  //       .returning();
      
  //     return updatedWorkspace;
  //   } catch (error) {
  //     throw new Error(error instanceof Error ? error.message : "Failed to update workspace");
  //   }
  // }),

  // // Delete workspace
  // delete: privateProcedure(async ({ ctx, input }: { ctx: any; input: any }) => {
  //   const { db, session } = ctx;
  //   const { id } = input || {};
    
  //   if (!id) {
  //     throw new Error("Workspace ID is required");
  //   }
    
  //   try {
  //     // Check if user is the owner
  //     const ownerCheck = await db
  //       .select({ role: workspaceMember.role })
  //       .from(workspaceMember)
  //       .where(
  //         and(
  //           eq(workspaceMember.workspaceId, id),
  //           eq(workspaceMember.userId, session.user.id),
  //           eq(workspaceMember.role, "owner"),
  //           eq(workspaceMember.isActive, true)
  //         )
  //       )
  //       .limit(1);
      
  //     if (ownerCheck.length === 0) {
  //       throw new Error("Only workspace owners can delete workspaces");
  //     }
      
  //     // Delete workspace members first (foreign key constraint)
  //     await db
  //       .delete(workspaceMember)
  //       .where(eq(workspaceMember.workspaceId, id));
      
  //     // Delete the workspace
  //     await db
  //       .delete(workspace)
  //       .where(eq(workspace.id, id));
      
  //     return { success: true, message: "Workspace deleted successfully" };
  //   } catch (error) {
  //     throw new Error(error instanceof Error ? error.message : "Failed to delete workspace");
  //   }
  // }),

  // // Join workspace (for invited users)
  // join: privateProcedure(async ({ ctx, input }: { ctx: any; input: any }) => {
  //   const { db, session } = ctx;
  //   const { workspaceId, inviteCode } = input || {};
    
  //   if (!workspaceId) {
  //     throw new Error("Workspace ID is required");
  //   }
    
  //   try {
  //     // Check if user is already a member
  //     const existingMember = await db
  //       .select({ id: workspaceMember.id })
  //       .from(workspaceMember)
  //       .where(
  //         and(
  //           eq(workspaceMember.workspaceId, workspaceId),
  //           eq(workspaceMember.userId, session.user.id)
  //         )
  //       )
  //       .limit(1);
      
  //     if (existingMember.length > 0) {
  //       throw new Error("User is already a member of this workspace");
  //     }
      
  //     // Add user as member
  //     const [newMember] = await db
  //       .insert(workspaceMember)
  //       .values({
  //         workspaceId,
  //         userId: session.user.id,
  //         role: "member",
  //         isActive: true,
  //       })
  //       .returning();
      
  //     return newMember;
  //   } catch (error) {
  //     throw new Error(error instanceof Error ? error.message : "Failed to join workspace");
  //   }
  // }),
});