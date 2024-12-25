import { SearchOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Avatar,
   Alert,
   Table,
   Input,
   Space,
   Typography,
   Empty,
   Spin,
   Modal,
   DatePicker,
   Select,
   Form,
   TimePicker,
   Row,
   Col,
   InputNumber,
} from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@/components/icon';
import tripAPI from '@/redux/api/services/tripAPI';
import ProTag from '@/theme/antd/components/tag';
import { TripModal, type TripModalProps } from './articleModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setTripsSlice } from '@/redux/slices/tripSlice';
import { Route } from '../route/entity';
import { Office } from '../route/entity';
import { Way } from '../route/entity';

import { Trip } from './entity';
import routeAPI from '@/redux/api/services/routeAPI';
const { Text } = Typography;
const { RangePicker } = DatePicker;

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

const DEFAULT_TRIP_VALUE: Trip = {
   trip_id: undefined,
   trip_arrival_time: '',
   trip_departure_time: '',
   trip_date: '',
   trip_price: 0,
   trip_discount: 0,
   trip_shuttle_enable: 0,
   allow_online_booking: 0,
   trip_holiday: 0,
   route: {
      route_id: undefined,
      route_name: '',
      route_price: 0,
   },
   vehicle: {
      vehicle_id: undefined,
      vehicle_license_plate: '',
      vehicle_code: '',
   },
};

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

function transformApiResponseToTrip(apiResponse: any): Trip {
   return {
      trip_id: apiResponse.trip_id,
      trip_arrival_time: apiResponse.trip_arrival_time,
      trip_departure_time: apiResponse.trip_departure_time,
      trip_date: apiResponse.trip_date,
      trip_price: apiResponse.trip_price,
      trip_discount: apiResponse.trip_discount,
      trip_shuttle_enable: apiResponse.trip_shuttle_enable,
      allow_online_booking: apiResponse.allow_online_booking,
      trip_holiday: apiResponse.trip_holiday,
      route: apiResponse.route
         ? {
              route_id: apiResponse.route.route_id,
              route_name: apiResponse.route.route_name,
              route_price: apiResponse.route.route_price,
           }
         : ({} as any),
      vehicle: apiResponse.vehicle
         ? {
              vehicle_id: apiResponse.vehicle.vehicle_id,
              vehicle_license_plate: apiResponse.vehicle.vehicle_license_plate,
              vehicle_code: apiResponse.vehicle.vehicle_code,
           }
         : ({} as any),
   };
}

type DataIndex = keyof Trip;

function FilterModal({
   open,
   onCancel,
   onFilter,
   routes,
}: {
   open: boolean;
   onCancel: () => void;
   onFilter: (params: any) => void;
   routes: Route[];
}) {
   const [form] = Form.useForm();

   return (
      <Modal
         title="Bộ lọc tìm kiếm"
         open={open}
         onCancel={onCancel}
         footer={[
            <Button key="cancel" onClick={onCancel}>
               Hủy
            </Button>,
            <Button
               key="apply"
               type="primary"
               onClick={() => {
                  const values = form.getFieldsValue();
                  onFilter(values);
               }}
            >
               Áp dụng
            </Button>,
         ]}
         width={700}
      >
         <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
               <Col span={12}>
                  <Form.Item label="Kiểu chọn ngày" name="dateType">
                     <Select style={{ width: '100%' }}>
                        <Select.Option value="today">Hôm nay</Select.Option>
                        <Select.Option value="specific">Chọn ngày cụ thể</Select.Option>
                        <Select.Option value="range">Chọn khoảng ngày</Select.Option>
                     </Select>
                  </Form.Item>
               </Col>
               <Col span={12}>
                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev?.dateType !== curr?.dateType}>
                     {({ getFieldValue }) => {
                        const dateType = getFieldValue('dateType');
                        if (dateType === 'specific') {
                           return (
                              <Form.Item label="Ngày cụ thể" name="specificDate">
                                 <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                              </Form.Item>
                           );
                        }
                        if (dateType === 'range') {
                           return (
                              <Form.Item label="Khoảng ngày" name="dateRange">
                                 <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                              </Form.Item>
                           );
                        }
                        return null;
                     }}
                  </Form.Item>
               </Col>

               <Col span={12}>
                  <Form.Item label="Giờ bắt đầu" name="startTime">
                     <TimePicker style={{ width: '100%' }} format="HH:mm" />
                  </Form.Item>
               </Col>
               <Col span={12}>
                  <Form.Item label="Giờ kết thúc" name="endTime">
                     <TimePicker style={{ width: '100%' }} format="HH:mm" />
                  </Form.Item>
               </Col>

               <Col span={24}>
                  <Form.Item label="Tuyến đường" name="routeId">
                     <Select
                        style={{ width: '100%' }}
                        placeholder="Chọn tuyến đường"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        options={routes?.map((route) => ({
                           label: route.route_name,
                           value: route.route_id,
                        }))}
                     />
                  </Form.Item>
               </Col>
            </Row>
         </Form>
      </Modal>
   );
}

export default function TripPage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<Error | null>(null);
   const [routes, setRoutes] = useState<Route[]>([]);
   const dispatch = useDispatch();

   const tripsSlice = useSelector((state: RootState) => state.trip.trips);
   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const [showAdvancedUpdateModal, setShowAdvancedUpdateModal] = useState(false);
   const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

   const handleAdvancedUpdate = (trip: Trip) => {
      setSelectedTrip(trip);
      setShowAdvancedUpdateModal(true);
   };

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      tripAPI
         .deleteTrip(id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Trip Success by Id ${id} !`,
                  duration: 3,
               });
               refreshData();
            } else {
               notification.error({
                  message: `Delete Trip Failed by Id ${id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Trip Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Trip> => ({
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
      const fetchTrips = async () => {
         setLoading(true);
         try {
            const res = await tripAPI.getTrips({});
            if (res) {
               dispatch(setTripsSlice(res.map(transformApiResponseToTrip)));
            }
         } catch (error) {
            setError(error);
         } finally {
            setLoading(false);
         }
      };
      fetchTrips();
   }, [dispatch]);

   const fetchRoutes = async () => {
      const res = await routeAPI.getRoutes();
      if (res) {
         setRoutes(res.map(transformApiResponseToRoute));
      }
   };

   useEffect(() => {
      fetchRoutes();
   }, [tripsSlice]);

   const refreshData = async (params?: any) => {
      try {
         const res = await tripAPI.getTrips(params || {});
         if (res) {
            dispatch(setTripsSlice(res.map(transformApiResponseToTrip)));
         }
      } catch (error) {
         setError(error);
      }
   };

   const [tripModalProps, setTripModalProps] = useState<TripModalProps>({
      formValue: {
         ...DEFAULT_TRIP_VALUE,
      },
      title: 'New Create Trip',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setTripModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setTripModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Trip> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Code',
         dataIndex: 'trip_id',
         ...getColumnSearchProps('trip_id'),
         fixed: 'left',
         render: (trip_id) => <Text>{trip_id?.toString().toUpperCase()}</Text>,
         sorter: (a, b) => (a.trip_id || 0) - (b.trip_id || 0),
      },
      {
         title: 'Route',
         dataIndex: 'route',
         ...getColumnSearchProps('route'),
         fixed: 'left',
         render: (route) => route.route_name,
      },
      {
         title: 'Vehicle',
         dataIndex: 'vehicle',
         align: 'center',
         render: (vehicle) => vehicle && `${vehicle.vehicle_license_plate} - ${vehicle.vehicle_code}`,
      },
      {
         title: 'Trip Status',
         align: 'center',
         dataIndex: 'trip_holiday',
         render: (trip_holiday) => (
            <ProTag color={trip_holiday === 1 ? 'error' : 'success'}>
               {trip_holiday === 1 ? 'TRIP_HOLIDAY' : 'TRIP_NORMAL'}
            </ProTag>
         ),
      },
      {
         title: 'Price',
         dataIndex: 'trip_price',
         align: 'center',
         render: (trip_price) => trip_price && formatCurrency(trip_price),
      },
      {
         title: 'Discount',
         dataIndex: 'trip_discount',
         align: 'center',
         render: (trip_discount) => trip_discount && `${trip_discount}%`,
      },
      {
         title: 'Action',
         key: 'operation',
         fixed: 'right',
         width: 140,
         render: (_, record) => (
            <Space>
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Xác nhận cập nhật nâng cao?"
                  description={`Bạn có chắc chắn muốn cập nhật nâng cao cho chuyến xe ${record.route.route_name}?`}
                  onConfirm={() => handleAdvancedUpdate(record)}
                  okText="Đồng ý"
                  cancelText="Hủy"
               >
                  <IconButton>
                     <Iconify icon="solar:settings-bold-duotone" size={18} className="text-warning" />
                  </IconButton>
               </Popconfirm>
               <Popconfirm
                  title="Delete this trip?"
                  onConfirm={() => handleDelete(record.trip_id || 0)}
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
      setTripModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Trip',
         isCreate: true,
         formValue: {
            ...DEFAULT_TRIP_VALUE,
         },
      }));
   };

   const onEdit = (formValue: Trip) => {
      setTripModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Trip',
         isCreate: false,
         formValue: formValue,
      }));
   };

   const expandColumns: ColumnsType<Trip> = [
      {
         title: 'Layout Information',
         key: 'layout',
         render: (_, record) => (
            <div>
               <Text strong>Route:</Text> {record.route.route_name}
               <br />
               <Text strong>Vehicle:</Text> {record.vehicle.vehicle_license_plate}
            </div>
         ),
      },
      {
         title: 'Lock Status',
         align: 'center',
         key: 'trip_holiday',
         render: (trip_holiday) => {
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  {trip_holiday === 1 && (
                     <>
                        <Iconify icon="fxemoji:lock" size={40} />
                        <Text mark>{dayjs(trip_holiday).format('DD/MM/YYYY HH:mm:ss')}</Text>
                     </>
                  )}
                  {trip_holiday === 0 && (
                     <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
               </div>
            );
         },
      },
   ];

   const renderExpandedRow = (record: Trip) => (
      <div>
         <Alert message="Description" description={record.route.route_name} type="info" />
         <Table<Trip> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.trip_id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: tripsSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns}
         expandable={{ expandedRowRender: renderExpandedRow }}
         dataSource={error ? [] : tripsSlice}
         loading={loading}
      />
   );

   const handleExportExcel = () => {
      // Xử lý xuất Excel
   };

   const handleExportDoc = () => {
      // Xử lý xuất DOC
   };

   const handleExportPDF = () => {
      // Xử lý xuất PDF
   };

   const [showFilterModal, setShowFilterModal] = useState(false);

   const handleFilter = async (params: any) => {
      setLoading(true);
      try {
         const res = await tripAPI.getTrips(params);
         if (res) {
            setRoutes(res);
            dispatch(setTripsSlice(res.map(transformApiResponseToTrip)));
         }
      } catch (error) {
         notification.error({
            message: 'Lỗi',
            description: 'Không thể tải dữ liệu. Vui lòng thử lại.',
         });
      } finally {
         setLoading(false);
      }
   };

   const [showAdvancedModal, setShowAdvancedModal] = useState(false);

   function AdvancedFeaturesModal({ open, onCancel }: { open: boolean; onCancel: () => void }) {
      return (
         <Modal title="Chức năng nâng cao" open={open} onCancel={onCancel} footer={null} width={500}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
               <Button
                  block
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     borderRadius: '8px',
                  }}
                  icon={<Iconify icon="vscode-icons:file-type-excel" size={40} />}
                  onClick={handleExportExcel}
               >
                  <span style={{ fontSize: '18px', marginLeft: '10px' }}>Xuất dữ liệu ra Excel</span>
               </Button>
               <Button
                  block
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     borderRadius: '8px',
                  }}
                  icon={<Iconify icon="vscode-icons:file-type-word" size={40} />}
                  onClick={handleExportDoc}
               >
                  <span style={{ fontSize: '18px', marginLeft: '10px' }}>Xuất báo cáo Word</span>
               </Button>
               <Button
                  block
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     borderRadius: '8px',
                  }}
                  icon={<Iconify icon="vscode-icons:file-type-pdf2" size={40} />}
                  onClick={handleExportPDF}
               >
                  <span style={{ fontSize: '18px', marginLeft: '10px' }}>Xuất báo cáo PDF</span>
               </Button>
            </Space>
         </Modal>
      );
   }

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: 'VND',
      })
         .format(amount)
         .replace('₫', 'VNĐ');
   };

   function AdvancedUpdateModal({ open, onCancel, trip }: { open: boolean; onCancel: () => void; trip: Trip | null }) {
      const [form] = Form.useForm();
      const [loading, setLoading] = useState(false);
      const tripData = tripsSlice.find((t) => t.trip_id === trip?.trip_id);
      const { userId } = useSelector((state: RootState) => state.user.userInfo);

      const handleOk = async () => {
         await form
            .validateFields()
            .then(async (values) => {
               setLoading(true);
               const fromDate = dayjs(values?.dateRange[0]).format('YYYY-MM-DD HH:mm');
               const toDate = dayjs(values?.dateRange[1]).format('YYYY-MM-DD HH:mm');
               const data = {
                  trip_id: trip?.trip_id,
                  fromDate,
                  toDate,
                  price: values.newPrice,
                  discount: values.discountPrice,
                  user_id: userId,
               };
               const res = await tripAPI.updateTripAdvanced(data);
               if (res && (res.status === 200 || res.status === 201)) {
                  notification.success({
                     message: 'Cập nhật thành công',
                     description: 'Giá chuyến xe đã được cập nhật tạm thời thành công!',
                     duration: 3,
                  });
                  onCancel();
               } else {
                  notification.error({
                     message: 'Lỗi',
                     description: res.message,
                     duration: 3,
                  });
               }
            })
            .catch((error) => {
               notification.error({
                  message: 'Lỗi',
                  description: error.message,
               });
            })
            .finally(() => {
               setLoading(false);
            });
      };

      return (
         <Modal
            title="Cập nhật giá chuyến xe"
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Cập nhật"
            cancelText="Hủy"
            confirmLoading={loading}
         >
            <Spin spinning={loading}>
               <Alert
                  message={
                     <Space direction="vertical">
                        <Text>Giá hiện tại:</Text>
                        <Space>
                           <ProTag color="processing">Giá gốc: {formatCurrency(tripData?.trip_price || 0)}</ProTag>
                           <ProTag color="warning">Giảm giá: {tripData?.trip_discount || 0}%</ProTag>
                        </Space>
                     </Space>
                  }
                  type="info"
                  style={{ marginBottom: 16 }}
               />
               <Form form={form} layout="vertical">
                  <Form.Item
                     label="Khoảng thời gian áp dụng"
                     name="dateRange"
                     rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
                  >
                     <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
                  </Form.Item>
                  <Form.Item
                     label="Giá mới"
                     name="newPrice"
                     rules={[{ required: true, message: 'Vui lòng nhập giá mới' }]}
                  >
                     <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        addonAfter="VNĐ"
                     />
                  </Form.Item>
                  <Form.Item
                     label="Giảm giá (%)"
                     name="discountPrice"
                     rules={[
                        { required: true, message: 'Vui lòng nhập tỉ lệ giảm giá' },
                        { type: 'number', min: 0, max: 100, message: 'Tỉ lệ giảm giá phải từ 0-100%' },
                     ]}
                  >
                     <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value: string | undefined) =>
                           value ? Math.min(100, Math.max(0, Number(value.replace('%', '')))) : 0
                        }
                        addonAfter="%"
                     />
                  </Form.Item>
               </Form>
            </Spin>
         </Modal>
      );
   }

   return (
      <>
         <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
            title={<p style={{ fontSize: '25px', fontWeight: 'bold' }}>Danh sách chuyến xe</p>}
            extra={
               <Space size="middle" wrap>
                  <Button
                     size="large"
                     icon={<Iconify icon="solar:filter-bold" size={16} />}
                     onClick={() => setShowFilterModal(true)}
                  >
                     Bộ lọc
                  </Button>
                  <Button
                     size="large"
                     icon={<Iconify icon="solar:widget-5-bold" size={16} />}
                     onClick={() => setShowAdvancedModal(true)}
                  >
                     Chức năng nâng cao
                  </Button>
                  <Button size="large" type="primary" onClick={onCreate}>
                     New Trip
                  </Button>
               </Space>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen />
            {content}
            <TripModal {...tripModalProps} />
            <FilterModal
               open={showFilterModal}
               onCancel={() => setShowFilterModal(false)}
               onFilter={handleFilter}
               routes={routes}
            />
            <AdvancedFeaturesModal open={showAdvancedModal} onCancel={() => setShowAdvancedModal(false)} />
            <AdvancedUpdateModal
               open={showAdvancedUpdateModal}
               onCancel={() => {
                  setShowAdvancedUpdateModal(false);
                  setSelectedTrip(null);
               }}
               trip={selectedTrip}
            />
         </Card>
      </>
   );
}
