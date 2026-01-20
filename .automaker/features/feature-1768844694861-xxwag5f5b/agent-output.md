I'll start by understanding this feature request and exploring the codebase to understand the existing patterns for file uploads and cloud storage.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
I'll use this brainstorming skill to understand and design this feature properly. Let me first explore the current project state to understand the existing file upload patterns.

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/docs/file-uploads.md"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/docs/architecture.md"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*upload*"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*s3*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/storage/r2.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/audio-storage.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/storage.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/db/schema*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/storage/storage.interface.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/storage/index.ts"
}
Now I have a good understanding of the existing codebase. Let me explore further to understand if there are any existing Figma export or asset-related code patterns:

🔧 Tool: Grep
Input: {
  "pattern": "figma.*export|asset.*upload|image.*export",
  "-i": true
}

🔧 Tool: Glob
Input: {
  "pattern": "src/data-access/**/*.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-files.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/attachments.ts"
}
I now have a good understanding of the existing patterns. The feature request asks me to implement uploading exported images and SVGs to cloud storage with content-addressed URLs, cache headers, and database tracking. Let me clarify a few things with you.

Based on my exploration, I see:
1. **Existing R2/S3 storage system** with presigned URLs for uploads
2. **Database schema for Figma files, pages, and frames** but no asset tracking table yet
3. **Layered architecture** (Routes → Components → Hooks → Queries → Fn → Data Access)

The feature requires:
- Upload exported images/SVGs to R2
- Generate content-addressed URLs (using hash of content)
- Set cache headers for optimal delivery
- Track asset references in database for cleanup and deduplication

I have one question before proceeding:

**What type of assets are these?** Are these:
1. **Figma design exports** - Images/SVGs exported from Figma designs (tied to frames/files)
2. **General user uploads** - Any images a user might upload
3. **Generated code assets** - Assets generated during Figma-to-code conversion

This affects how we structure the database tracking and relationships. Could you clarify the primary use case?