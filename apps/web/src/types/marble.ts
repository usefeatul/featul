export type MarblePost = {
  id: string
  slug: string
  title: string
  excerpt?: string
  coverImage?: string | null
  publishedAt?: string | null
  content?: string | null
  author?: MarbleAuthor | null
  authors?: MarbleAuthor[] | null
  tags?: MarbleTag[] | null
  category?: MarbleCategory | null
}

export type MarblePostListResponse = {
  posts: MarblePost[]
}

export type MarblePostResponse = {
  post: MarblePost
}

export type MarbleTag = {
  id: string
  name: string
  slug?: string
}

export type MarbleTagListResponse = {
  tags: MarbleTag[]
}

export type MarbleCategory = {
  id: string
  name: string
  slug?: string
}

export type MarbleCategoryListResponse = {
  categories: MarbleCategory[]
}

export type MarbleAuthor = {
  id: string
  name: string
  image?: string | null
  avatar?: string | null
  bio?: string | null
}

export type MarbleAuthorListResponse = {
  authors: MarbleAuthor[]
}