import { pgTable, text, timestamp, boolean, index, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User table - Core user information for authentication
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  isAdmin: boolean("is_admin")
    .$default(() => false)
    .notNull(),
  // Subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  plan: text("plan")
    .$default(() => "free")
    .notNull(),
  subscriptionStatus: text("subscription_status"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Session table - Better Auth session management
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Account table - Better Auth OAuth provider accounts
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Verification table - Better Auth email verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// User Profile - Extended profile information
export const userProfile = pgTable(
  "user_profile",
  {
    id: text("id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    bio: text("bio"),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("idx_user_profile_id").on(table.id)]
);

// Relations
export const userRelations = relations(user, ({ one }) => ({
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.id],
    references: [user.id],
  }),
}));

// Figma Account table - OAuth linked Figma accounts (separate from app login)
// Supports multiple Figma accounts per user for agencies/teams
export const figmaAccount = pgTable(
  "figma_account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Figma user information
    figmaUserId: text("figma_user_id").notNull(),
    figmaEmail: text("figma_email").notNull(),
    figmaHandle: text("figma_handle"),
    figmaImgUrl: text("figma_img_url"),
    // OAuth tokens (encrypted at application level)
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
    // Account metadata
    label: text("label"), // Optional friendly name for the account (e.g., "Work", "Personal")
    isDefault: boolean("is_default")
      .$default(() => false)
      .notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_account_user_id").on(table.userId),
    index("idx_figma_account_figma_user_id").on(table.figmaUserId),
  ]
);

// Figma account relations
export const figmaAccountRelations = relations(figmaAccount, ({ one }) => ({
  user: one(user, {
    fields: [figmaAccount.userId],
    references: [user.id],
  }),
}));

// Update user relations to include figma accounts
export const userFigmaRelations = relations(user, ({ many }) => ({
  figmaAccounts: many(figmaAccount),
}));

// Type exports
export type FigmaAccount = typeof figmaAccount.$inferSelect;
export type CreateFigmaAccountData = typeof figmaAccount.$inferInsert;
export type UpdateFigmaAccountData = Partial<
  Omit<CreateFigmaAccountData, "id" | "userId" | "createdAt">
>;

// Type exports
export type User = typeof user.$inferSelect;
export type CreateUserData = typeof user.$inferInsert;
export type UpdateUserData = Partial<Omit<CreateUserData, "id" | "createdAt">>;

export type UserProfile = typeof userProfile.$inferSelect;
export type CreateUserProfileData = typeof userProfile.$inferInsert;
export type UpdateUserProfileData = Partial<Omit<CreateUserProfileData, "id">>;

// Subscription types
export type SubscriptionPlan = "free" | "basic" | "pro";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | null;

// Figma Team Cache - Stores team information for faster navigation
export const figmaTeam = pgTable(
  "figma_team",
  {
    id: text("id").primaryKey(), // Figma team ID
    figmaAccountId: text("figma_account_id")
      .notNull()
      .references(() => figmaAccount.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    memberCount: integer("member_count"),
    // Permission level: "owner" | "admin" | "member" | "viewer"
    permissionLevel: text("permission_level"),
    // Cache metadata
    cachedAt: timestamp("cached_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_team_account_id").on(table.figmaAccountId),
  ]
);

// Figma Project Cache - Stores project information for faster navigation
export const figmaProject = pgTable(
  "figma_project",
  {
    id: text("id").primaryKey(), // Figma project ID
    figmaAccountId: text("figma_account_id")
      .notNull()
      .references(() => figmaAccount.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .references(() => figmaTeam.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    fileCount: integer("file_count"),
    // Project type: "team" | "personal" | "organization"
    projectType: text("project_type"),
    // Cache metadata
    cachedAt: timestamp("cached_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_project_account_id").on(table.figmaAccountId),
    index("idx_figma_project_team_id").on(table.teamId),
  ]
);

// Figma Team relations
export const figmaTeamRelations = relations(figmaTeam, ({ one, many }) => ({
  figmaAccount: one(figmaAccount, {
    fields: [figmaTeam.figmaAccountId],
    references: [figmaAccount.id],
  }),
  projects: many(figmaProject),
}));

// Figma Project relations
export const figmaProjectRelations = relations(figmaProject, ({ one }) => ({
  figmaAccount: one(figmaAccount, {
    fields: [figmaProject.figmaAccountId],
    references: [figmaAccount.id],
  }),
  team: one(figmaTeam, {
    fields: [figmaProject.teamId],
    references: [figmaTeam.id],
  }),
}));

// Update figma account relations to include teams and projects
export const figmaAccountTeamsRelations = relations(figmaAccount, ({ many }) => ({
  teams: many(figmaTeam),
  projects: many(figmaProject),
}));

// Type exports for Figma Teams and Projects
export type FigmaTeam = typeof figmaTeam.$inferSelect;
export type CreateFigmaTeamData = typeof figmaTeam.$inferInsert;
export type UpdateFigmaTeamData = Partial<Omit<CreateFigmaTeamData, "id" | "cachedAt">>;

export type FigmaProject = typeof figmaProject.$inferSelect;
export type CreateFigmaProjectData = typeof figmaProject.$inferInsert;
export type UpdateFigmaProjectData = Partial<Omit<CreateFigmaProjectData, "id" | "cachedAt">>;

// Permission types for Figma resources
export type FigmaPermissionLevel = "owner" | "admin" | "member" | "viewer";
export type FigmaProjectType = "team" | "personal" | "organization";

// Figma File Cache - Stores file information for faster navigation
export const figmaFile = pgTable(
  "figma_file",
  {
    id: text("id").primaryKey(), // Figma file key
    figmaAccountId: text("figma_account_id")
      .notNull()
      .references(() => figmaAccount.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .references(() => figmaProject.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    lastModified: timestamp("last_modified"),
    version: text("version"),
    // Cache metadata
    cachedAt: timestamp("cached_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_file_account_id").on(table.figmaAccountId),
    index("idx_figma_file_project_id").on(table.projectId),
  ]
);

// Figma Page Cache - Stores page information within files
export const figmaPage = pgTable(
  "figma_page",
  {
    id: text("id").primaryKey(), // Figma page node ID
    fileId: text("file_id")
      .notNull()
      .references(() => figmaFile.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    frameCount: integer("frame_count"),
    // Cache metadata
    cachedAt: timestamp("cached_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_page_file_id").on(table.fileId),
  ]
);

// Figma Frame Cache - Stores top-level frame information within pages
export const figmaFrame = pgTable(
  "figma_frame",
  {
    id: text("id").primaryKey(), // Figma frame node ID
    pageId: text("page_id")
      .notNull()
      .references(() => figmaPage.id, { onDelete: "cascade" }),
    fileId: text("file_id")
      .notNull()
      .references(() => figmaFile.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    // Categorization
    category: text("category").notNull(), // "screen" | "component" | "asset" | "unknown"
    matchedDevice: text("matched_device"), // Matched device name if applicable
    // Cache metadata
    cachedAt: timestamp("cached_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_frame_page_id").on(table.pageId),
    index("idx_figma_frame_file_id").on(table.fileId),
    index("idx_figma_frame_category").on(table.category),
  ]
);

// Figma File relations
export const figmaFileRelations = relations(figmaFile, ({ one, many }) => ({
  figmaAccount: one(figmaAccount, {
    fields: [figmaFile.figmaAccountId],
    references: [figmaAccount.id],
  }),
  project: one(figmaProject, {
    fields: [figmaFile.projectId],
    references: [figmaProject.id],
  }),
  pages: many(figmaPage),
  frames: many(figmaFrame),
}));

// Figma Page relations
export const figmaPageRelations = relations(figmaPage, ({ one, many }) => ({
  file: one(figmaFile, {
    fields: [figmaPage.fileId],
    references: [figmaFile.id],
  }),
  frames: many(figmaFrame),
}));

// Figma Frame relations
export const figmaFrameRelations = relations(figmaFrame, ({ one }) => ({
  page: one(figmaPage, {
    fields: [figmaFrame.pageId],
    references: [figmaPage.id],
  }),
  file: one(figmaFile, {
    fields: [figmaFrame.fileId],
    references: [figmaFile.id],
  }),
}));

// Type exports for Figma Files, Pages, and Frames
export type FigmaFile = typeof figmaFile.$inferSelect;
export type CreateFigmaFileData = typeof figmaFile.$inferInsert;
export type UpdateFigmaFileData = Partial<Omit<CreateFigmaFileData, "id" | "cachedAt">>;

export type FigmaPageRecord = typeof figmaPage.$inferSelect;
export type CreateFigmaPageData = typeof figmaPage.$inferInsert;
export type UpdateFigmaPageData = Partial<Omit<CreateFigmaPageData, "id" | "cachedAt">>;

export type FigmaFrameRecord = typeof figmaFrame.$inferSelect;
export type CreateFigmaFrameData = typeof figmaFrame.$inferInsert;
export type UpdateFigmaFrameData = Partial<Omit<CreateFigmaFrameData, "id" | "cachedAt">>;

// Frame category type
export type FigmaFrameCategory = "screen" | "component" | "asset" | "unknown";

// ============================================
// Figma Export Tables
// ============================================

// Export format type
export type FigmaExportFormat = "png" | "jpg" | "webp";

// Export status type
export type FigmaExportStatus = "pending" | "processing" | "completed" | "failed";

// Figma Export - Stores exported raster images from Figma frames
export const figmaExport = pgTable(
  "figma_export",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    figmaAccountId: text("figma_account_id")
      .notNull()
      .references(() => figmaAccount.id, { onDelete: "cascade" }),
    fileKey: text("file_key").notNull(), // Figma file key
    nodeId: text("node_id").notNull(), // Figma node ID (frame/component)
    nodeName: text("node_name").notNull(), // Original Figma node name
    // Export configuration
    format: text("format").notNull(), // "png" | "jpg" | "webp"
    scale: integer("scale").notNull(), // 1, 2, or 3 (DPI multiplier)
    quality: integer("quality"), // 1-100 for jpg/webp (null for png)
    // Image dimensions
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    // Storage
    storageKey: text("storage_key").notNull(), // R2 storage key
    fileSizeBytes: integer("file_size_bytes"),
    // Status tracking
    status: text("status")
      .$default(() => "pending")
      .notNull(), // "pending" | "processing" | "completed" | "failed"
    errorMessage: text("error_message"),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    expiresAt: timestamp("expires_at"), // For cleanup of temporary exports
  },
  (table) => [
    index("idx_figma_export_user_id").on(table.userId),
    index("idx_figma_export_figma_account_id").on(table.figmaAccountId),
    index("idx_figma_export_file_key").on(table.fileKey),
    index("idx_figma_export_node_id").on(table.nodeId),
    index("idx_figma_export_status").on(table.status),
  ]
);

// Figma Export Set - Groups multiple exports (1x, 2x, 3x) for a single node
export const figmaExportSet = pgTable(
  "figma_export_set",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    figmaAccountId: text("figma_account_id")
      .notNull()
      .references(() => figmaAccount.id, { onDelete: "cascade" }),
    fileKey: text("file_key").notNull(),
    nodeId: text("node_id").notNull(),
    nodeName: text("node_name").notNull(),
    format: text("format").notNull(), // "png" | "jpg" | "webp"
    // Whether this includes srcset variants (1x, 2x, 3x)
    includesSrcset: boolean("includes_srcset")
      .$default(() => false)
      .notNull(),
    // Generated srcset markup
    srcsetMarkup: text("srcset_markup"),
    // Status
    status: text("status")
      .$default(() => "pending")
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_figma_export_set_user_id").on(table.userId),
    index("idx_figma_export_set_node_id").on(table.nodeId),
  ]
);

// Figma Export relations
export const figmaExportRelations = relations(figmaExport, ({ one }) => ({
  user: one(user, {
    fields: [figmaExport.userId],
    references: [user.id],
  }),
  figmaAccount: one(figmaAccount, {
    fields: [figmaExport.figmaAccountId],
    references: [figmaAccount.id],
  }),
}));

// Figma Export Set relations
export const figmaExportSetRelations = relations(figmaExportSet, ({ one }) => ({
  user: one(user, {
    fields: [figmaExportSet.userId],
    references: [user.id],
  }),
  figmaAccount: one(figmaAccount, {
    fields: [figmaExportSet.figmaAccountId],
    references: [figmaAccount.id],
  }),
}));

// Type exports for Figma Exports
export type FigmaExport = typeof figmaExport.$inferSelect;
export type CreateFigmaExportData = typeof figmaExport.$inferInsert;
export type UpdateFigmaExportData = Partial<Omit<CreateFigmaExportData, "id" | "createdAt">>;

export type FigmaExportSet = typeof figmaExportSet.$inferSelect;
export type CreateFigmaExportSetData = typeof figmaExportSet.$inferInsert;
export type UpdateFigmaExportSetData = Partial<Omit<CreateFigmaExportSetData, "id" | "createdAt">>;

// ============================================
// Responsive Frame Mapping Tables
// ============================================

/** Viewport category type */
export type ViewportCategory = "mobile" | "tablet" | "desktop";

/** Element transformation type */
export type ElementTransformationType =
  | "unchanged"
  | "resized"
  | "repositioned"
  | "restyled"
  | "restructured"
  | "hidden"
  | "shown";

/** Element visibility type */
export type ElementVisibilityType = "visible" | "hidden" | "absent";

// Responsive Frame Group - Groups frames representing the same screen at different viewports
export const responsiveFrameGroup = pgTable(
  "responsive_frame_group",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    figmaAccountId: text("figma_account_id")
      .notNull()
      .references(() => figmaAccount.id, { onDelete: "cascade" }),
    fileKey: text("file_key").notNull(), // Figma file key
    // Group metadata
    baseName: text("base_name").notNull(), // Shared name across viewports (e.g., "Homepage")
    confidence: integer("confidence").notNull(), // 0-100 confidence score
    // Frame references (JSON array of frame IDs for each viewport)
    mobileFrameId: text("mobile_frame_id"),
    tabletFrameId: text("tablet_frame_id"),
    desktopFrameId: text("desktop_frame_id"),
    // Generated CSS
    generatedCss: text("generated_css"),
    tailwindClasses: text("tailwind_classes"), // JSON object with breakpoint classes
    // Status
    status: text("status")
      .$default(() => "pending")
      .notNull(), // "pending" | "processing" | "completed" | "failed"
    errorMessage: text("error_message"),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_responsive_frame_group_user_id").on(table.userId),
    index("idx_responsive_frame_group_file_key").on(table.fileKey),
    index("idx_responsive_frame_group_base_name").on(table.baseName),
  ]
);

// Element Viewport Mapping - Maps an element across different viewports
export const elementViewportMapping = pgTable(
  "element_viewport_mapping",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => responsiveFrameGroup.id, { onDelete: "cascade" }),
    // Element identification
    elementName: text("element_name").notNull(),
    elementPath: text("element_path").notNull(), // Path in tree (e.g., "Header/Logo")
    elementType: text("element_type").notNull(), // Figma node type
    confidence: integer("confidence").notNull(), // 0-100 mapping confidence
    // Element IDs at each viewport (null if absent)
    mobileElementId: text("mobile_element_id"),
    tabletElementId: text("tablet_element_id"),
    desktopElementId: text("desktop_element_id"),
    // Visibility at each viewport
    mobileVisibility: text("mobile_visibility"), // "visible" | "hidden" | "absent"
    tabletVisibility: text("tablet_visibility"),
    desktopVisibility: text("desktop_visibility"),
    // Properties JSON at each viewport (bounds, styles, etc.)
    mobileProperties: text("mobile_properties"), // JSON
    tabletProperties: text("tablet_properties"), // JSON
    desktopProperties: text("desktop_properties"), // JSON
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_element_viewport_mapping_group_id").on(table.groupId),
    index("idx_element_viewport_mapping_element_path").on(table.elementPath),
  ]
);

// Element Transformation - Records transformations between viewports
export const elementTransformation = pgTable(
  "element_transformation",
  {
    id: text("id").primaryKey(),
    mappingId: text("mapping_id")
      .notNull()
      .references(() => elementViewportMapping.id, { onDelete: "cascade" }),
    // Transformation details
    fromViewport: text("from_viewport").notNull(), // "mobile" | "tablet" | "desktop"
    toViewport: text("to_viewport").notNull(),
    transformationType: text("transformation_type").notNull(), // ElementTransformationType
    // Detailed changes (JSON)
    sizeChange: text("size_change"), // { widthDelta, heightDelta, widthPercent, heightPercent }
    positionChange: text("position_change"), // { xDelta, yDelta, relativeXPercent, relativeYPercent }
    layoutChange: text("layout_change"), // { from, to }
    visibilityChange: text("visibility_change"), // { from, to }
    styleChanges: text("style_changes"), // JSON array of style change descriptions
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_element_transformation_mapping_id").on(table.mappingId),
    index("idx_element_transformation_type").on(table.transformationType),
  ]
);

// Breakpoint Change - Records elements that appear/disappear at breakpoints
export const breakpointChange = pgTable(
  "breakpoint_change",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => responsiveFrameGroup.id, { onDelete: "cascade" }),
    mappingId: text("mapping_id")
      .notNull()
      .references(() => elementViewportMapping.id, { onDelete: "cascade" }),
    // Change details
    elementName: text("element_name").notNull(),
    elementPath: text("element_path").notNull(),
    changeType: text("change_type").notNull(), // "appears" | "disappears"
    atBreakpoint: text("at_breakpoint").notNull(), // "mobile" | "tablet" | "desktop"
    fromBreakpoint: text("from_breakpoint").notNull(),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_breakpoint_change_group_id").on(table.groupId),
    index("idx_breakpoint_change_change_type").on(table.changeType),
  ]
);

// Relations for responsive mapping tables
export const responsiveFrameGroupRelations = relations(
  responsiveFrameGroup,
  ({ one, many }) => ({
    user: one(user, {
      fields: [responsiveFrameGroup.userId],
      references: [user.id],
    }),
    figmaAccount: one(figmaAccount, {
      fields: [responsiveFrameGroup.figmaAccountId],
      references: [figmaAccount.id],
    }),
    elementMappings: many(elementViewportMapping),
    breakpointChanges: many(breakpointChange),
  })
);

export const elementViewportMappingRelations = relations(
  elementViewportMapping,
  ({ one, many }) => ({
    group: one(responsiveFrameGroup, {
      fields: [elementViewportMapping.groupId],
      references: [responsiveFrameGroup.id],
    }),
    transformations: many(elementTransformation),
    breakpointChanges: many(breakpointChange),
  })
);

export const elementTransformationRelations = relations(
  elementTransformation,
  ({ one }) => ({
    mapping: one(elementViewportMapping, {
      fields: [elementTransformation.mappingId],
      references: [elementViewportMapping.id],
    }),
  })
);

export const breakpointChangeRelations = relations(breakpointChange, ({ one }) => ({
  group: one(responsiveFrameGroup, {
    fields: [breakpointChange.groupId],
    references: [responsiveFrameGroup.id],
  }),
  mapping: one(elementViewportMapping, {
    fields: [breakpointChange.mappingId],
    references: [elementViewportMapping.id],
  }),
}));

// Type exports for Responsive Mapping tables
export type ResponsiveFrameGroup = typeof responsiveFrameGroup.$inferSelect;
export type CreateResponsiveFrameGroupData = typeof responsiveFrameGroup.$inferInsert;
export type UpdateResponsiveFrameGroupData = Partial<
  Omit<CreateResponsiveFrameGroupData, "id" | "createdAt">
>;

export type ElementViewportMapping = typeof elementViewportMapping.$inferSelect;
export type CreateElementViewportMappingData = typeof elementViewportMapping.$inferInsert;
export type UpdateElementViewportMappingData = Partial<
  Omit<CreateElementViewportMappingData, "id" | "createdAt">
>;

export type ElementTransformation = typeof elementTransformation.$inferSelect;
export type CreateElementTransformationData = typeof elementTransformation.$inferInsert;

export type BreakpointChange = typeof breakpointChange.$inferSelect;
export type CreateBreakpointChangeData = typeof breakpointChange.$inferInsert;

// ============================================
// Project Configuration Tables
// ============================================

/** Code style convention options */
export type CodeStyle = "camelCase" | "kebab-case" | "PascalCase" | "snake_case";

/** Component file structure options */
export type ComponentStructure = "flat" | "folder" | "feature-based";

// Project Configuration - Stores saved configurations for code generation
export const projectConfiguration = pgTable(
  "project_configuration",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Configuration metadata
    name: text("name").notNull(),
    description: text("description"),
    isDefault: boolean("is_default")
      .$default(() => false)
      .notNull(),
    isTemplate: boolean("is_template")
      .$default(() => false)
      .notNull(),
    // Target framework settings
    jsFramework: text("js_framework").notNull(), // "react" | "vue" | "angular" | "svelte" | "nextjs" | "nuxt" | "vanilla"
    cssFramework: text("css_framework").notNull(), // "vanilla-css" | "tailwind" | "css-modules" | "styled-components" | "emotion" | "scss"
    // CSS framework-specific options (JSON)
    cssOptions: text("css_options").notNull(), // JSON string of framework-specific options
    // Code style settings
    codeStyle: text("code_style")
      .$default(() => "camelCase")
      .notNull(), // Variable and function naming convention
    componentNaming: text("component_naming")
      .$default(() => "PascalCase")
      .notNull(), // Component naming convention
    fileNaming: text("file_naming")
      .$default(() => "kebab-case")
      .notNull(), // File naming convention
    componentStructure: text("component_structure")
      .$default(() => "folder")
      .notNull(), // "flat" | "folder" | "feature-based"
    // Additional code generation options (JSON)
    additionalOptions: text("additional_options"), // JSON for extensibility
    // Sharing settings
    isShared: boolean("is_shared")
      .$default(() => false)
      .notNull(),
    sharedWithTeam: text("shared_with_team"), // Team ID if shared with specific team
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_project_configuration_user_id").on(table.userId),
    index("idx_project_configuration_is_template").on(table.isTemplate),
    index("idx_project_configuration_is_shared").on(table.isShared),
  ]
);

// Project Configuration relations
export const projectConfigurationRelations = relations(
  projectConfiguration,
  ({ one }) => ({
    user: one(user, {
      fields: [projectConfiguration.userId],
      references: [user.id],
    }),
  })
);

// Type exports for Project Configuration
export type ProjectConfiguration = typeof projectConfiguration.$inferSelect;
export type CreateProjectConfigurationData = typeof projectConfiguration.$inferInsert;
export type UpdateProjectConfigurationData = Partial<
  Omit<CreateProjectConfigurationData, "id" | "userId" | "createdAt">
>;

// ============================================
// Conversion History Tables
// ============================================

/** Conversion status type */
export type ConversionStatus = "pending" | "processing" | "completed" | "failed";

/** Conversion type - what kind of conversion was performed */
export type ConversionType = "code-generation" | "image-export" | "full-export" | "preview";

// Conversion History - Tracks all conversions performed by users
export const conversionHistory = pgTable(
  "conversion_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    figmaAccountId: text("figma_account_id")
      .references(() => figmaAccount.id, { onDelete: "set null" }),
    // Figma source information
    fileKey: text("file_key").notNull(),
    fileName: text("file_name"),
    nodeId: text("node_id").notNull(),
    nodeName: text("node_name").notNull(),
    nodeType: text("node_type"), // "frame" | "component" | "section" etc.
    // Conversion type and settings
    conversionType: text("conversion_type").notNull(), // "code-generation" | "image-export" | "full-export" | "preview"
    // Configuration used (stored as snapshot for historical reference)
    configurationId: text("configuration_id")
      .references(() => projectConfiguration.id, { onDelete: "set null" }),
    configurationSnapshot: text("configuration_snapshot"), // JSON snapshot of settings at time of conversion
    // Framework and styling settings (denormalized for quick filtering)
    jsFramework: text("js_framework"),
    cssFramework: text("css_framework"),
    // Output information
    outputCode: text("output_code"), // Generated code (stored for comparison)
    outputCodeLines: integer("output_code_lines"),
    outputFormat: text("output_format"), // "tsx" | "vue" | "html" etc.
    // Export assets info (if applicable)
    exportedAssetsCount: integer("exported_assets_count"),
    exportedAssetsJson: text("exported_assets_json"), // JSON array of asset info
    // Performance metrics
    durationMs: integer("duration_ms"), // Time taken to complete conversion
    // Status tracking
    status: text("status")
      .$default(() => "pending")
      .notNull(),
    errorMessage: text("error_message"),
    // Version tracking for comparison
    version: integer("version")
      .$default(() => 1)
      .notNull(),
    parentConversionId: text("parent_conversion_id"), // For re-run tracking
    // Metadata
    tags: text("tags"), // JSON array of user-defined tags
    notes: text("notes"), // User notes about this conversion
    isFavorite: boolean("is_favorite")
      .$default(() => false)
      .notNull(),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("idx_conversion_history_user_id").on(table.userId),
    index("idx_conversion_history_figma_account_id").on(table.figmaAccountId),
    index("idx_conversion_history_file_key").on(table.fileKey),
    index("idx_conversion_history_node_id").on(table.nodeId),
    index("idx_conversion_history_status").on(table.status),
    index("idx_conversion_history_conversion_type").on(table.conversionType),
    index("idx_conversion_history_created_at").on(table.createdAt),
    index("idx_conversion_history_is_favorite").on(table.isFavorite),
    index("idx_conversion_history_parent_id").on(table.parentConversionId),
  ]
);

// Conversion History relations
export const conversionHistoryRelations = relations(
  conversionHistory,
  ({ one }) => ({
    user: one(user, {
      fields: [conversionHistory.userId],
      references: [user.id],
    }),
    figmaAccount: one(figmaAccount, {
      fields: [conversionHistory.figmaAccountId],
      references: [figmaAccount.id],
    }),
    configuration: one(projectConfiguration, {
      fields: [conversionHistory.configurationId],
      references: [projectConfiguration.id],
    }),
    parentConversion: one(conversionHistory, {
      fields: [conversionHistory.parentConversionId],
      references: [conversionHistory.id],
    }),
  })
);

// Type exports for Conversion History
export type ConversionHistory = typeof conversionHistory.$inferSelect;
export type CreateConversionHistoryData = typeof conversionHistory.$inferInsert;
export type UpdateConversionHistoryData = Partial<
  Omit<CreateConversionHistoryData, "id" | "userId" | "createdAt">
>;

// ============================================
// GitHub Account Tables
// ============================================

/** GitHub account connection status */
export type GitHubAccountStatus = "active" | "expired" | "revoked";

// GitHub Account - OAuth linked GitHub accounts for code export
export const githubAccount = pgTable(
  "github_account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // GitHub user information
    githubUserId: text("github_user_id").notNull(),
    githubUsername: text("github_username").notNull(),
    githubEmail: text("github_email"),
    githubAvatarUrl: text("github_avatar_url"),
    githubName: text("github_name"),
    // OAuth tokens (encrypted at application level)
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    // Scopes granted
    scopes: text("scopes"), // Comma-separated list of scopes
    // Account metadata
    label: text("label"), // Optional friendly name (e.g., "Work", "Personal")
    isDefault: boolean("is_default")
      .$default(() => false)
      .notNull(),
    status: text("status")
      .$default(() => "active")
      .notNull(), // "active" | "expired" | "revoked"
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_github_account_user_id").on(table.userId),
    index("idx_github_account_github_user_id").on(table.githubUserId),
  ]
);

// GitHub Export - Tracks exports to GitHub repositories
export const githubExport = pgTable(
  "github_export",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    githubAccountId: text("github_account_id")
      .notNull()
      .references(() => githubAccount.id, { onDelete: "cascade" }),
    // Repository information
    repositoryOwner: text("repository_owner").notNull(),
    repositoryName: text("repository_name").notNull(),
    repositoryUrl: text("repository_url").notNull(),
    isNewRepository: boolean("is_new_repository")
      .$default(() => false)
      .notNull(),
    // Branch and commit info
    branchName: text("branch_name").notNull(),
    commitSha: text("commit_sha"),
    commitMessage: text("commit_message").notNull(),
    // PR info (if created)
    pullRequestUrl: text("pull_request_url"),
    pullRequestNumber: integer("pull_request_number"),
    pullRequestTitle: text("pull_request_title"),
    // Export details
    componentName: text("component_name").notNull(),
    filesExported: integer("files_exported").notNull(),
    totalSizeBytes: integer("total_size_bytes"),
    // Source conversion reference (if applicable)
    conversionHistoryId: text("conversion_history_id")
      .references(() => conversionHistory.id, { onDelete: "set null" }),
    // Status
    status: text("status")
      .$default(() => "pending")
      .notNull(), // "pending" | "in_progress" | "completed" | "failed"
    errorMessage: text("error_message"),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("idx_github_export_user_id").on(table.userId),
    index("idx_github_export_github_account_id").on(table.githubAccountId),
    index("idx_github_export_repository").on(table.repositoryOwner, table.repositoryName),
    index("idx_github_export_status").on(table.status),
  ]
);

// GitHub Account relations
export const githubAccountRelations = relations(githubAccount, ({ one, many }) => ({
  user: one(user, {
    fields: [githubAccount.userId],
    references: [user.id],
  }),
  exports: many(githubExport),
}));

// GitHub Export relations
export const githubExportRelations = relations(githubExport, ({ one }) => ({
  user: one(user, {
    fields: [githubExport.userId],
    references: [user.id],
  }),
  githubAccount: one(githubAccount, {
    fields: [githubExport.githubAccountId],
    references: [githubAccount.id],
  }),
  conversionHistory: one(conversionHistory, {
    fields: [githubExport.conversionHistoryId],
    references: [conversionHistory.id],
  }),
}));

// Type exports for GitHub Account
export type GitHubAccount = typeof githubAccount.$inferSelect;
export type CreateGitHubAccountData = typeof githubAccount.$inferInsert;
export type UpdateGitHubAccountData = Partial<
  Omit<CreateGitHubAccountData, "id" | "userId" | "createdAt">
>;

// Type exports for GitHub Export
export type GitHubExport = typeof githubExport.$inferSelect;
export type CreateGitHubExportData = typeof githubExport.$inferInsert;
export type UpdateGitHubExportData = Partial<
  Omit<CreateGitHubExportData, "id" | "userId" | "createdAt">
>;

/** GitHub export status type */
export type GitHubExportStatus = "pending" | "in_progress" | "completed" | "failed";
