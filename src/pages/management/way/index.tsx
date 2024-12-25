import { App, Button, Card, Popconfirm, Avatar, Tooltip, Alert, Table, Input, Space, Spin } from 'antd';

import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import { IconButton, Iconify } from '@components/icon';
import { Way, PickupPoint } from '@/pages/management/way/entity';
import wayAPI from '@/redux/api/services/wayAPI';
import { WayModal, WayModalProps } from './wayModal';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setWaysSlice } from '@/redux/slices/waySlice';

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

         // Style cho header của bảng chính
         .ant-table-thead > tr > th {
            background-color: #f0f7ff;
            color: #1890ff;
            font-weight: 600;
         }

         // Style cho header của bảng con (expanded)
         &.custom-expanded-table {
            .ant-table-thead > tr > th {
               background-color: #f6ffed;
               color: #52c41a;
               font-weight: 600;
            }
         }
      }
   `,
}));

function transformApiResponseToWay(apiResponse: any): Way {
   return {
      way_id: apiResponse.way_id,
      way_name: apiResponse.way_name,
      way_description: apiResponse.way_description,
      list_pickup_point: apiResponse.way_to_pickupPoint
         ? apiResponse.way_to_pickupPoint.map((item: any) => ({
              way_id: item.pickup_point_way_id,
              office_id: item.pickup_point_office_id,
              office_name: item.pickupPoint_belongto_office?.office_name,
              pickup_point_name: item.pickup_point_name,
              pickup_point_time: item.pickup_point_time,
              pickup_point_kind: item.pickup_point_kind,
              pickup_point_description: item.pickup_point_description,
              point_kind_name: item.point_kind_name,
           }))
         : [],
   };
}

const DEFAULT_WAY: Way = {
   way_id: 0,
   way_name: '',
   way_description: '',
   list_pickup_point: [],
};

export default function WayPage() {
   const { styles } = useStyle();
   const { notification } = App.useApp();
   const dispatch = useDispatch();
   const searchInput = useRef<InputRef>(null);

   // States
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<any>(null);

   const [modalData, setModalData] = useState<WayModalProps>({
      formValue: DEFAULT_WAY,
      title: '',
      show: false,
      isCreate: true,
      onOk: () => {
         fetchWayList();
         setModalData((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setModalData((prev) => ({ ...prev, show: false }));
      },
   });

   const ways = useSelector((state: RootState) => state.way.ways);

   useEffect(() => {
      fetchWayList();
   }, []);

   const [wayModalPros, setWayModalProps] = useState<WayModalProps>({
      formValue: {
         ...DEFAULT_WAY,
      },
      title: 'New Create Way',
      show: false,
      isCreate: true,
      onOk: () => {
         fetchWayList();
         setWayModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setWayModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const onCreate = () => {
      setWayModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Way',
         isCreate: true,
         formValue: {
            ...DEFAULT_WAY,
         },
      }));
   };

   const onEdit = (recore: Way) => {
      setWayModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Way',
         isCreate: false,
         formValue: recore,
      }));
   };

   const fetchWayList = async () => {
      setLoading(true);
      try {
         const data = await wayAPI.getWays();
         dispatch(setWaysSlice(data ? data.map(transformApiResponseToWay) : []));
      } catch (error: any) {
         setError(error);
         notification.error({
            message: 'Lỗi khi tải danh sách tài xế',
            description: error.message,
         });
      } finally {
         setLoading(false);
      }
   };

   const handleCreate = () => {
      setModalData({
         formValue: DEFAULT_WAY,
         title: 'Thêm Đường Mới',
         show: true,
         isCreate: true,
         onOk: () => {
            fetchWayList();
         },
         onCancel: () => {},
      });
   };

   const handleEdit = (record: Way) => {
      setModalData({
         formValue: record,
         title: 'Chỉnh Sửa Đường',
         show: true,
         isCreate: false,
         onOk: () => {
            fetchWayList();
         },
         onCancel: () => {},
      });
   };

   const handleDelete = async (way_id: number) => {
      setLoadingDelete(true);
      try {
         await wayAPI.deleteWay(way_id);
         notification.success({ message: 'Xóa tuyến đường thành công !' });
         await fetchWayList();
      } catch (error: any) {
         notification.error({
            message: 'Lỗi khi xóa tuyến đường !',
            description: error.message,
         });
      } finally {
         setLoadingDelete(false);
      }
   };

   // Table Columns
   const columns: ColumnsType<Way> = [
      {
         title: 'Tên Đường',
         dataIndex: 'way_name',
         fixed: 'left',
      },
      {
         title: 'Mô tả',
         dataIndex: 'way_description',
      },
      {
         title: 'Thao tác',
         key: 'action',
         fixed: 'right',
         width: 120,
         render: (_, record) => (
            <Space>
               <IconButton onClick={() => handleEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" />
               </IconButton>
               <Popconfirm
                  title="Xóa đường"
                  description="Bạn có chắc muốn xóa đường này?"
                  onConfirm={() => handleDelete(record.way_id)}
               >
                  <IconButton>
                     <Iconify icon="solar:trash-bin-trash-bold-duotone" className="text-error" />
                  </IconButton>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   // Expanded Row Content
   const expandColumns: ColumnsType<PickupPoint> = [
      {
         title: 'Loại điểm',
         dataIndex: 'pickup_point_kind',
         width: 150,
         align: 'center',
         render: (kind) => {
            let text = '';
            switch (kind) {
               case -1:
                  text = 'Điểm xuất phát';
                  break;
               case 0:
                  text = 'Điểm trung gian';
                  break;
               case 1:
                  text = 'Điểm đến';
                  break;
               default:
                  text = 'Không xác định';
            }
            return text;
         },
      },
      {
         title: 'Tên văn phòng',
         dataIndex: ['office_name'],
         width: 200,
         render: (officeName) => (
            <Tooltip placement="topLeft" title={officeName}>
               {officeName}
            </Tooltip>
         ),
      },
      {
         title: 'Thời gian đón',
         dataIndex: 'pickup_point_time',
         width: 150,
         align: 'center',
      },
      {
         title: 'Mô tả',
         dataIndex: 'pickup_point_description',
         width: 300,
         render: (description) => (
            <Tooltip placement="topLeft" title={description}>
               {description}
            </Tooltip>
         ),
      },
   ];

   const content = (
      <Table
         className={styles.customTable}
         columns={columns}
         expandable={{
            expandedRowRender: (record) => {
               const sortedPickupPoints = [...record.list_pickup_point].sort((a, b) => {
                  return a.pickup_point_kind - b.pickup_point_kind;
               });

               return (
                  <div style={{ margin: '-16px -16px' }}>
                     <Table
                        columns={expandColumns}
                        dataSource={sortedPickupPoints}
                        pagination={false}
                        rowKey="way_id"
                        scroll={{ y: '100%' }}
                        style={{ width: '100%' }}
                        className="custom-expanded-table"
                     />
                  </div>
               );
            },
            expandedRowClassName: () => 'expanded-row-custom',
         }}
         dataSource={error ? [] : ways}
         loading={loading}
         rowKey="way_id"
         style={{ width: '100%', flex: 1 }}
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: ways?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} đường`,
         }}
      />
   );

   return (
      <>
         <Card
            title="Danh sách con đường"
            style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
            extra={
               <Button size="large" type="primary" onClick={handleCreate}>
                  Thêm mới con đường
               </Button>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
               {loadingDelete && content}
            </Spin>
            {content}
         </Card>
         <WayModal
            {...modalData}
            onCancel={() => setModalData((prev) => ({ ...prev, show: false }))}
            onOk={async () => {
               setModalData((prev) => ({ ...prev, show: false }));
               await fetchWayList();
            }}
         />
      </>
   );
}
