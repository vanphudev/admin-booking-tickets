export interface Article {
   article_id: number;
   article_title: string;
   article_description: string;
   article_content: string;
   article_slug: string;
   published_at: string;
   is_priority: 0 | 1;
   article_type: ArticleType;
   employee: {
      employee_id: number;
      employee_full_name: string;
      employee_email: string;
   };
   thumbnail_img: string;
}

export interface ArticleType {
   article_type_id: number;
   article_title: string;
   article_field: string;
   is_highlight: 0 | 1;
}
