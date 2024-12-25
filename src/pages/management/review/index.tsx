import { SearchOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Avatar,
   Tooltip,
   Alert,
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
import { IconButton, Iconify } from '@components/icon';
import { Review } from '@pages/management/review/entity';
import getReviews from '@api/reviewAPI';
import ProTag from '@theme/antd/components/tag';
import { ReviewModal, ReviewModalProps } from './reviewModel';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setReviewsSlice } from '@/redux/slices/reviewSlice';

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

const DEFAULE_REVIEW_VALUE: Review = {
   review_id: -1,
   review_rating: 0,
   review_date: '',
   review_comment: '',
   is_locked: 0,
   last_lock_at: '',
   route_id: 1,
   customer: {
      customer_id: 1,
      customer_full_name: '',
      customer_phone: '',
      customer_email: '',
   },
   trip: {
      trip_id: 1,
      trip_date: '',
      route_name: '',
   },
   booking: {
      booking_id: 1,
      booking_code: '',
      created_at: '',
   },
};

function transformApiResponseToReview(apiResponse: any): Review {
   return {
      review_id: apiResponse.review_id,
      review_rating: apiResponse.review_rating,
      review_date: apiResponse.review_date,
      review_comment: apiResponse.review_comment,
      is_locked: apiResponse.is_locked === 1 ? 1 : 0,
      last_lock_at: apiResponse.last_lock_at || '',
      route_id: apiResponse.route_id,
      customer: {
         customer_id: apiResponse.customer_id,
         customer_full_name: apiResponse.customer_full_name,
         customer_phone: apiResponse.customer_phone,
         customer_email: apiResponse.customer_email,
      },
      trip: {
         trip_id: apiResponse.trip_id,
         trip_date: apiResponse.trip_date,
         route_name: apiResponse.route_name,
      },
      booking: {
         booking_id: apiResponse.booking_id,
         booking_code: apiResponse.booking_code,
         created_at: apiResponse.created_at,
      },
   };
}

type DataIndex = keyof Review;

export default function OfficePage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const [reviews, setReviews] = useState<Review[]>([]);
   const dispatch = useDispatch();

   const reviewsSlice = useSelector((state: RootState) => state.review.reviews);

   const handleDelete = (review_image_id: number) => {
      setLoadingDelete(true);
      getReviews
         .deleteReview(review_image_id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete review Success by Id ${review_image_id} !`,
                  duration: 3,
               });
            }
            if (res && (res.status === 400 || res.error === true)) {
               notification.error({
                  message: `Delete Office Failed by Id ${review_image_id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Office Failed by Id ${review_image_id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Review> => ({
      // eslint-disable-next-line react/no-unstable-nested-components
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
      // eslint-disable-next-line react/no-unstable-nested-components
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
      setLoading(true);
      getReviews
         .getReviews()
         .then((res: any) => {
            dispatch(setReviewsSlice(res.map(transformApiResponseToReview)));
         })
         .catch((error) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await getReviews.getReviews();
         dispatch(setReviewsSlice(res.map(transformApiResponseToReview)));
      } catch (error) {
         setError(error);
      }
   };

   const [reviewModalPros, setReviewModalProps] = useState<ReviewModalProps>({
      formValue: {
         ...DEFAULE_REVIEW_VALUE,
      },
      title: 'New Create Review',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setReviewModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setReviewModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Review> = [
      Table.EXPAND_COLUMN,
      {
         title: 'review comment',
         dataIndex: 'review_comment',
         ...getColumnSearchProps('review_comment'),
         fixed: 'left',
         sorter: (a, b) => a.review_comment.localeCompare(b.review_comment),
         ellipsis: {
            showTitle: false,
         },
         render: (review_comment) => (
            <Tooltip placement="topLeft" title={review_comment}>
               {review_comment}
            </Tooltip>
         ),
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               <Avatar.Group max={{ count: 3 }} size="large">
                  {images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Review Image ${index + 1}`} />
                  ))}
               </Avatar.Group>
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
         fixed: 'left',
      },
      {
         title: 'Route',
         dataIndex: ['review_belongto_route', 'route_name'],
         width: 150,
      },
      {
         title: 'Customer',
         dataIndex: ['review_belongto_customer', 'customer_full_name'],
         width: 150,
      },
      {
         title: 'Lock Status',
         align: 'center',
         dataIndex: 'is_locked',
         filters: [
            {
               text: 'Locked',
               value: 1,
            },
            {
               text: 'Unlocked',
               value: 0,
            },
         ],
         onFilter: (value, record) => record.is_locked === value,
         render: (is_locked) => (
            <ProTag color={is_locked === 1 ? 'error' : 'success'}>{is_locked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
         ),
      },
      {
         title: 'Action',
         key: 'operation',
         align: 'center',
         width: 100,
         fixed: 'right',
         render: (_, record) => (
            <div className="flex w-full justify-center text-gray">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete the Office ?"
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                  onCancel={() => {}}
                  onConfirm={() => handleDelete(record.review_id)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const onCreate = () => {
      setReviewModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New',
         isCreate: true,
         formValue: {
            ...prev.formValue,
            ...DEFAULE_REVIEW_VALUE,
         },
      }));
   };

   const onEdit = (formValue: Review) => {
      setReviewModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit',
         isCreate: false,
         formValue,
      }));
   };


   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.review_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: reviews?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Review>}
         dataSource={error ? [] : reviewsSlice || []}
         loading={loading}
      />
   );

   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Office List"
         extra={
            <Button type="primary" onClick={onCreate}>
               New
            </Button>
         }
      >
         <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
            {loadingDelete && content}
         </Spin>
         {content}
         <ReviewModal {...reviewModalPros} />
      </Card>
   );
}
