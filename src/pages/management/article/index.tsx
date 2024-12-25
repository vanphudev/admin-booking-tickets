import { SearchOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Avatar,
   Table,
   Input,
   Space,
   Typography,
   Empty,
   Spin,
} from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@/components/icon';

import { ArticleModal, type ArticleModalProps } from './articleModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setArticlesSlice } from '@/redux/slices/articleSlice';
import { Article, ArticleType } from './entity';
import articleAPI from '@/redux/api/services/articleAPI';
const { Text } = Typography;

const useStyle = createStyles(({ css }) => ({
   customTable: css`
      .ant-table {
         .ant-table-container {
            .ant-table-body,
            .ant-table-content {
               scrollbar-width: thin;
               scrollbar-color: #939393 transparent;
               scrollbar-gutter: stable;
            }
         }
      }
   `,
}));

const DEFAULT_ARTICLE_TYPE_VALUE: ArticleType = {
   article_type_id: 0,
   article_title: '',
   article_field: '',
   is_highlight: 0,
};

const DEFAULT_ARTICLE_VALUE: Article = {
   article_id: 0,
   article_title: '',
   article_description: '',
   article_content: '',
   article_slug: '',
   published_at: '',
   is_priority: 0,
   article_type: DEFAULT_ARTICLE_TYPE_VALUE,
   employee: {
      employee_id: 0,
      employee_full_name: '',
      employee_email: '',
   },
   thumbnail_img: '',
};

function transformApiResponseToArticle(apiResponse: any): Article {
   const ARTICLE_TYPE: ArticleType = {
      article_type_id: apiResponse.article_belongto_articleType?.article_type_id,
      article_title: apiResponse.article_belongto_articleType?.article_title,
      article_field: apiResponse.article_belongto_articleType?.article_field,
      is_highlight: apiResponse.article_belongto_articleType?.is_highlight,
   };

   return {
      article_id: apiResponse.article_id,
      article_title: apiResponse.article_title,
      article_description: apiResponse.article_description,
      article_content: apiResponse.article_content,
      article_slug: apiResponse.article_slug,
      published_at: apiResponse.published_at,
      is_priority: apiResponse.is_priority,
      article_type: ARTICLE_TYPE,
      employee: apiResponse.article_belongto_employee
         ? {
              employee_id: apiResponse.article_belongto_employee.employee_id,
              employee_full_name: apiResponse.article_belongto_employee.employee_full_name,
              employee_email: apiResponse.article_belongto_employee.employee_email,
           }
         : {
              employee_id: 0,
              employee_full_name: '',
              employee_email: '',
           },
      thumbnail_img: apiResponse.thumbnail_img || '',
   };
}

type DataIndex = keyof Article;

export default function VehiclePage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<Error | null>(null);
   const dispatch = useDispatch();

   const articlesSlice = useSelector((state: RootState) => state.article.articles);

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      articleAPI
         .deleteArticle(id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Article Success by Id ${id} !`,
                  duration: 3,
               });
            } else {
               notification.error({
                  message: `Delete Article Failed by Id ${id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Article Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Article> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
         <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
               ref={searchInput}
               placeholder={`Search ${dataIndex}`}
               value={selectedKeys[0]}
               onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
               onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
               style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
               <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
               >
                  Search
               </Button>
               <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                  Reset
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     confirm({ closeDropdown: false });
                     setSearchText((selectedKeys as string[])[0]);
                     setSearchedColumn(dataIndex);
                  }}
               >
                  Filter
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     close();
                  }}
               >
                  close
               </Button>
            </Space>
         </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, record) => {
         const text = record[dataIndex]?.toString().toLowerCase();
         return text ? text.includes((value as string).toLowerCase()) : false;
      },
      onFilterDropdownOpenChange: (visible) => {
         if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
         }
      },
      render: (text) =>
         searchedColumn === dataIndex ? (
            <Highlighter
               highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
               searchWords={[searchText]}
               autoEscape
               textToHighlight={text ? text.toString() : ''}
            />
         ) : (
            text
         ),
   });

   useEffect(() => {
      const fetchVehicles = async () => {
         setLoading(true);
         try {
            const res = await articleAPI.getArticles();
            if (res) {
               dispatch(setArticlesSlice(res.map(transformApiResponseToArticle)));
               console.log('res', res);
            }
         } catch (error) {
            setError(error);
         } finally {
            setLoading(false);
         }
      };

      fetchVehicles();
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await articleAPI.getArticles();
         if (res) {
            dispatch(setArticlesSlice(res.map(transformApiResponseToArticle)));
         }
      } catch (error) {
         setError(error);
      }
   };

   const [articleModalProps, setArticleModalProps] = useState<ArticleModalProps>({
      formValue: DEFAULT_ARTICLE_VALUE,
      title: 'New Create Article',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setArticleModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setArticleModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Article> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Code',
         dataIndex: 'article_id',
         ...getColumnSearchProps('article_id'),
         fixed: 'left',
         align: 'center',
         sorter: (a, b) => a.article_id - b.article_id,
      },
      {
         title: 'Title',
         dataIndex: 'article_title',
         ...getColumnSearchProps('article_title'),
         fixed: 'left',
      },
      {
         title: 'Images',
         dataIndex: 'thumbnail_img',
         align: 'center',
         render: (thumbnail_img) =>
            thumbnail_img && thumbnail_img.length > 0 ? (
               <Avatar size={100} shape="square" src={thumbnail_img} alt="Article Image"  />
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
      {
         title: 'Published At',
         align: 'center',
         key: 'published_at',
         render: (_, record) => {
            const { is_priority, published_at } = record;
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  <Text mark>{dayjs(published_at).format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
            );
         },
      },
      {
         title: 'Type',
         dataIndex: 'article_type',
         align: 'center',
         render: (article_type) => <Text>{article_type.article_title}</Text>,
      },
      {
         title: 'Người viết',
         dataIndex: 'employee',
         align: 'center',
         render: (employee) => <Text>{employee.employee_full_name}</Text>,
      },
      {
         title: 'Action',
         key: 'operation',
         fixed: 'right',
         width: 100,
         render: (_, record) => (
            <Space>
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete this article?"
                  onConfirm={() => handleDelete(record.article_id)}
                  okText="Yes"
                  cancelText="No"
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   const onCreate = () => {
      setArticleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Article',
         isCreate: true,
         formValue: DEFAULT_ARTICLE_VALUE,
      }));
   };

   const onEdit = (formValue: Article) => {
      setArticleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Article',
         isCreate: false,
         formValue,
      }));
   };

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.article_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: articlesSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns}
         dataSource={error ? [] : articlesSlice}
         loading={loading}
      />
   );

   return (
      <>
         <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
            title={<p style={{ fontSize: '25px', fontWeight: 'bold' }}>Danh sách bài viết - tin tức</p>}
            extra={
               <Space size="middle">
                  <Button size="large" type="primary" onClick={onCreate}>
                     New Article
                  </Button>
               </Space>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen />
            {content}
            <ArticleModal {...articleModalProps} />
         </Card>
      </>
   );
}
