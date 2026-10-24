/**
 * Journal author registry (Journey/blog design D-9, 2026-10-22).
 *
 * The single source of truth for who a post is attributed to. A post's
 * frontmatter `author` must be a key of `AUTHORS` (the journal schema rejects
 * anything else), so a byline can never name a person who is not registered
 * here with an approved bio and portrait.
 *
 * Bio strings are Owner-directed copy and are rendered verbatim. Nothing in
 * this file is a claim about a product, a credential or an award.
 *
 * No `@/` imports: this module is loaded by the content schema and by the
 * Node-run architecture tests.
 */
export type AuthorLanguage = "vi" | "en";

export interface AuthorBio {
  /** One sentence for the post's author card. */
  short: string;
  /** Full paragraph for the about page and long-form author surfaces. */
  long: string;
}

export interface Author {
  name: string;
  role: Record<AuthorLanguage, string>;
  /** Site-relative paths under `public/`: 256 px (rendered at 64 CSS px) and 512 px. */
  avatar: string;
  avatarLarge: string;
  avatarAlt: Record<AuthorLanguage, string>;
  /** Truthful origin of the portrait, kept next to the asset it describes. */
  avatarProvenance: string;
  /** Localised about page that introduces the author. */
  aboutPath: Record<AuthorLanguage, string>;
  bio: Record<AuthorLanguage, AuthorBio>;
}

export const AUTHORS = {
  "tony-nguyen": {
    name: "Tony Nguyen",
    role: {
      vi: "Nhà sáng lập kiêm CEO",
      en: "Founder & CEO",
    },
    avatar: "/images/authors/tony-nguyen-256.webp",
    avatarLarge: "/images/authors/tony-nguyen-512.webp",
    avatarAlt: {
      vi: "Chân dung nét khắc Tony Nguyen",
      en: "Line-engraving portrait of Tony Nguyen",
    },
    avatarProvenance:
      "Line-engraving (hedcut-style) illustration derived from a portrait photograph supplied by the Owner, made at the Owner's request (2026-10-24: art, not the original photo) by deterministic local image processing (tools/journal-art/hedcut.py, no generative model); brand ink on a porcelain tint, circular crop, cobalt ring.",
    aboutPath: {
      vi: "/vi/about/",
      en: "/en/about/",
    },
    bio: {
      vi: {
        short:
          "Người làm IT mê công nghệ, muốn góp một phần nhỏ đưa những ý tưởng thiết thực vào đời sống hằng ngày.",
        long: "Tony Nguyen là nhà sáng lập kiêm CEO của BlueSkyz Labs, sống và làm việc tại TP. Hồ Chí Minh. Là một người làm IT đam mê công nghệ, Tony tin rằng công nghệ tốt nhất là thứ khiến những việc thường ngày trở nên nhẹ nhàng hơn. BlueSkyz Labs ra đời từ niềm tin ấy: góp một phần nhỏ để biến những ý tưởng thiết thực thành sản phẩm giúp đời sống của mọi người dễ dàng hơn mỗi ngày.",
      },
      en: {
        short:
          "An IT professional who loves technology and wants to play a small part in bringing practical ideas into everyday life.",
        long: "Tony Nguyen is the founder and CEO of BlueSkyz Labs, based in Ho Chi Minh City. An IT professional who loves technology, Tony believes the best technology makes everyday tasks feel lighter. BlueSkyz Labs grew out of that belief: to play a small part in turning practical ideas into products that make people's daily lives a little easier.",
      },
    },
  },
} as const satisfies Record<string, Author>;

export type AuthorId = keyof typeof AUTHORS;

/** Tuple form for `z.enum`; the schema derives its allowed keys from here. */
export const AUTHOR_IDS = Object.keys(AUTHORS) as [AuthorId, ...AuthorId[]];

export function getAuthor(id: AuthorId): Author {
  return AUTHORS[id];
}
