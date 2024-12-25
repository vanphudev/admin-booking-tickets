export interface ArticleType {
   article_type_id: number;
   article_title: string;
   article_field: string;
   is_highlight: 0 | 1;
   created_at?: string;
   updated_at?: string;
}