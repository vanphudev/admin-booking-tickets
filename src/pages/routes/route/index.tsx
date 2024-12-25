import { App, Button, Card, Popconfirm, Table, Input, Space, Typography, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import { IconButton, Iconify } from '@/components/icon';
import routeAPI from '@/redux/api/services/routeAPI';
import ProTag from '@/theme/antd/components/tag';
import { RouteModal, RouteModalProps } from './routeModal';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setRoutesSlice } from '@/redux/slices/routeSlice';
import { Route, DEFAULT_ROUTE, Office, Way } from './entity';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

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

function transformApiResponseToRoute(apiResponse: any): Route {
   return {
      route_id: apiResponse.route_id,
      route_name: apiResponse.route_name,
      route_duration: apiResponse.route_duration,
      route_distance: apiResponse.route_distance,
      route_price: apiResponse.route_price,
      route_url_gps: apiResponse.route_url_gps,
      origin_office_id: apiResponse.origin_office_id,
      destination_office_id: apiResponse.destination_office_id,
      is_locked: apiResponse.is_locked,
      last_lock_at: apiResponse.last_lock_at || '',
      is_default: apiResponse.is_default,
      way: {
         way_id: apiResponse?.way?.way_id,
         way_name: apiResponse?.way?.way_name,
         way_description: apiResponse?.way?.way_description,
         origin_office: apiResponse?.way?.origin_office
            ? {
                 office_id: apiResponse?.way?.origin_office?.office_id,
                 office_name: apiResponse?.way?.origin_office?.office_name,
              }
            : ({} as Office),
         destination_office: apiResponse?.way?.destination_office
            ? {
                 office_id: apiResponse?.way?.destination_office?.office_id,
                 office_name: apiResponse?.way?.destination_office?.office_name,
              }
            : ({} as Office),
      } as Way,
   };
}

export default function RoutePage() {
   const { notification } = App.useApp();
   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
   const dispatch = useDispatch();
   const [loadingDelete, setLoadingDelete] = useState(false);

   const [routeModalProps, setRouteModalProps] = useState<RouteModalProps>({
      formValue: DEFAULT_ROUTE,
      title: 'Thêm tuyến xe mới',
      show: false,
      isCreate: true,
      onCancel: () => setRouteModalProps((prev) => ({ ...prev, show: false })),
      onOk: () => {
         fetchData();
         setRouteModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const routes = useSelector((state: RootState) => state.route.routes);

   const handleDelete = async (id: number) => {
      try {
         await routeAPI.deleteRoute(id);
         notification.success({
            message: 'Xóa tuyến đường thành công!',
         });
         fetchData();
      } catch (err) {
         notification.error({
            message: 'Xóa tuyến đường thất bại!',
            description: err.message,
         });
      }
   };

   const columns: ColumnsType<Route> = [
      {
         title: 'Tên tuyến',
         dataIndex: 'route_name',
         fixed: 'left',
         width: 200,
      },
      {
         title: 'Thời gian',
         dataIndex: 'route_duration',
         align: 'center',
         width: 120,
         render: (duration) => {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;

            if (hours > 0) {
               return `${hours} Giờ${minutes > 0 ? ` ${minutes} Phút` : ''}`;
            }
            return `${minutes} Phút`;
         },
         sorter: (a, b) => a.route_duration - b.route_duration,
      },
      {
         title: 'Khoảng cách',
         dataIndex: 'route_distance',
         align: 'center',
         width: 120,
         render: (distance) => `${distance} KM`,
         sorter: (a, b) => a.route_distance - b.route_distance,
      },
      {
         title: 'Giá vé',
         dataIndex: 'route_price',
         align: 'center',
         width: 120,
         render: (price) =>
            `${new Intl.NumberFormat('vi-VN', {
               style: 'decimal',
               minimumFractionDigits: 0,
               maximumFractionDigits: 0,
            }).format(price)} VNĐ`,
         sorter: (a, b) => a.route_price - b.route_price,
      },
      {
         title: 'Trạng thái',
         align: 'center',
         width: 120,
         render: (_, record) => (
            <Space direction="vertical" size={4}>
               <ProTag color={record.is_default === 1 ? 'success' : undefined}>
                  {record.is_default === 1 ? 'Tuyến mặc định' : 'Tuyến thường'}
               </ProTag>
               <ProTag color={record.is_locked === 1 ? 'error' : 'success'}>
                  {record.is_locked === 1 ? 'Đã khóa' : 'Hoạt động'}
               </ProTag>
            </Space>
         ),
         filters: [
            { text: 'Tuyến mặc định', value: 1 },
            { text: 'Tuyến thường', value: 0 },
         ],
         onFilter: (value, record) => record.is_default === value,
      },
      {
         title: 'Thao tác',
         fixed: 'right',
         width: 120,
         render: (_, record) => (
            <Space>
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Bạn có chắc muốn xóa tuyến xe này không?"
                  onConfirm={() => handleDelete(record.route_id)}
                  okText="Có"
                  cancelText="Không"
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   // Expanded row content
   const expandedRowRender = (record: Route) => (
      <div style={{ padding: '12px' }}>
         <Space direction="vertical" size={8}>
            <div>
               <Text strong>Tên đường:</Text> {record.way.way_name}
            </div>
            <div>
               <Text strong>Mô tả:</Text> {record.way.way_description}
            </div>
            <div>
               <Text strong>Điểm đi:</Text> {record.way.origin_office.office_name}
            </div>
            <div>
               <Text strong>Điểm đến:</Text> {record.way.destination_office.office_name}
            </div>
            {record.is_locked && (
               <div>
                  <Text strong>Thời gian khóa:</Text>{' '}
                  <Text mark>{dayjs(record.last_lock_at).format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
            )}
         </Space>
      </div>
   );

   // Data fetching
   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      setLoading(true);
      try {
         const data = await routeAPI.getRoutes();
         const transformedData = data.map(transformApiResponseToRoute);
         dispatch(setRoutesSlice(transformedData));
      } catch (err) {
         setError(err);
         notification.error({
            message: 'Lỗi khi tải dữ liệu',
            description: err.message,
         });
      } finally {
         setLoading(false);
      }
   };

   // Modal handlers
   const onCreate = () => {
      setRouteModalProps({
         title: 'Thêm tuyến xe mới',
         show: true,
         isCreate: true,
         formValue: DEFAULT_ROUTE,
         onCancel: () => setRouteModalProps((prev) => ({ ...prev, show: false })),
         onOk: () => {
            fetchData();
            setRouteModalProps((prev) => ({ ...prev, show: false }));
         },
      });
   };

   const onEdit = (record: Route) => {
      setRouteModalProps({
         title: 'Chỉnh sửa tuyến xe',
         show: true,
         isCreate: false,
         formValue: record,
         onCancel: () => setRouteModalProps((prev) => ({ ...prev, show: false })),
         onOk: () => {
            fetchData();
            setRouteModalProps((prev) => ({ ...prev, show: false }));
         },
      });
   };

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.route_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: routes?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} tuyến xe`,
         }}
         columns={columns as ColumnsType<Route>}
         expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
         dataSource={error ? [] : routes || []}
         loading={loading}
      />
   );

   return (
      <>
         <Card
            style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
            title="Danh sách tuyến xe"
            extra={
               <Space>
                  <Button size="large" type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                     Thêm tuyến xe mới
                  </Button>
               </Space>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
               {loadingDelete && content}
            </Spin>
            {content}
         </Card>
         <RouteModal {...routeModalProps} />
      </>
   );
}
