import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Tooltip, Table, Input, Space, Typography, Spin, Modal, Tag, Select } from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect, useCallback } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import { Customer } from './entity';
import customerAPI from '@/redux/api/services/customerAPI';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setCustomerSlice } from '@/redux/slices/customerSlice';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import dayjs from 'dayjs';

import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY');
};

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

type DataIndex = keyof Customer;

function CopyButton({ value }: { value: string }) {
   const { copyFn } = useCopyToClipboard();
   return (
      <Tooltip title="Copy">
         <IconButton className="text-gray" onClick={() => copyFn(value)}>
            <Iconify icon="eva:copy-fill" size={20} />
         </IconButton>
      </Tooltip>
   );
}

function transformApiResponseToCustomer(apiResponse: any): Customer {
   return {
      customer_id: apiResponse.customer_id,
      customer_full_name: apiResponse.customer_full_name,
      customer_email: apiResponse.customer_email,
      customer_phone: apiResponse.customer_phone,
      customer_birthday: apiResponse.customer_birthday,
      customer_password: apiResponse.customer_password,
      customer_gender: apiResponse.customer_gender,
      customer_avatar: apiResponse.customer_avatar,
      customer_destination_address: apiResponse.customer_destination_address,
      is_disabled: apiResponse.is_disabled === 1 ? 1 : 0,
      bonus_point: apiResponse.bonus_point,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
   };
}

export default function CustomerPage() {
   const { styles } = useStyle();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const dispatch = useDispatch();
   const customersSlice = useSelector((state: RootState) => state.customer.customers);

   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
   const [isLocking, setIsLocking] = useState(false);

   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
   const [isChartModalOpen, setIsChartModalOpen] = useState(false);

   const [chartData, setChartData] = useState<{
      series: ApexAxisChartSeries;
      options: ApexOptions;
   }>({
      series: [
         {
            name: 'Số lượng đăng ký',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         },
      ],
      options: {
         chart: {
            type: 'bar',
            height: 350,
            toolbar: {
               show: true,
            },
         },
         plotOptions: {
            bar: {
               horizontal: false,
               columnWidth: '55%',
               borderRadius: 5,
            },
         },
         dataLabels: {
            enabled: false,
         },
         stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
         },
         xaxis: {
            categories: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
            title: {
               text: 'Tháng',
            },
         },
         yaxis: {
            title: {
               text: 'Số lượng khách hàng',
            },
         },
         fill: {
            opacity: 1,
            colors: ['#1677ff'],
         },
         tooltip: {
            y: {
               formatter(val: number) {
                  return `${val} khách hàng`;
               },
            },
         },
         title: {
            text: 'Thống kê số lượng đăng ký theo tháng',
            align: 'center',
            style: {
               fontSize: '16px',
            },
         },
      },
   });

   const years = Array.from(new Set(customersSlice.map((customer) => dayjs(customer.created_at).year()))).sort(
      (a, b) => b - a,
   );

   const loadChartData = (year: number) => {
      const monthlyData = Array(12).fill(0); // Mảng 12 phần tử cho 12 tháng

      customersSlice.forEach((customer) => {
         const customerYear = dayjs(customer.created_at).year();
         if (customerYear === year) {
            const month = dayjs(customer.created_at).month(); // Lấy tháng (0-11)
            monthlyData[month] += 1; // Tăng số lượng khách hàng cho tháng đó
         }
      });

      setChartData((prev) => ({
         ...prev,
         series: [
            {
               name: 'Số lượng đăng ký',
               data: monthlyData,
            },
         ],
      }));
   };

   const handleYearChange = (value: number) => {
      setSelectedYear(value);
      loadChartData(value);
   };

   const showChartModal = () => {
      loadChartData(selectedYear);
      setIsChartModalOpen(true);
   };

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Customer> => ({
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

   const loadCustomers = useCallback(async () => {
      try {
         setLoading(true);
         const response = await customerAPI.getCustomers();
         if (response) {
            dispatch(setCustomerSlice(response.map(transformApiResponseToCustomer)));
            setCustomers(response.map(transformApiResponseToCustomer));
         } else {
            notification.error({
               message: 'Lỗi tải danh sách khách hàng',
               description: (
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                     <p>Không thể tải danh sách khách hàng!</p>
                     <p>ERROR: {response.message}</p>
                  </div>
               ),
               duration: 5,
               style: {
                  border: '1px solid #ff4d4f',
                  borderRadius: '5px',
                  backgroundColor: '#fff1f0',
               },
            });
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi tải danh sách khách hàng',
            description: (
               <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  <p>Không thể tải danh sách khách hàng!</p>
                  <p>ERROR: {error.message}</p>
               </div>
            ),
            duration: 5,
            style: {
               border: '1px solid #ff4d4f',
               borderRadius: '5px',
               backgroundColor: '#fff1f0',
            },
         });
      } finally {
         setLoading(false);
      }
   }, [dispatch, notification]);

   useEffect(() => {
      loadCustomers();
   }, [loadCustomers]);

   const refreshCustomers = () => {
      loadCustomers();
   };

   const columns: ColumnsType<Customer> = [
      {
         title: 'Họ và tên',
         dataIndex: 'customer_full_name',
         key: 'customer_full_name',
         ...getColumnSearchProps('customer_full_name'),
         sorter: (a, b) => a.customer_full_name?.localeCompare(b.customer_full_name as string) || 0,
         fixed: 'left',
         width: 240,
         align: 'center',
      },
      {
         title: 'Ảnh đại diện',
         dataIndex: 'customer_avatar',
         key: 'customer_avatar',
         align: 'center',
         render: (image: string) =>
            image ? (
               <img
                  src={`${image}`}
                  alt="Ảnh đại diện"
                  style={{ width: 60, height: 60, borderRadius: '50%', margin: 'auto' }}
               />
            ) : (
               <Iconify icon="mdi:account-off" style={{ color: '#ccc', fontSize: '40px' }} />
            ),
      },
      {
         title: 'Email',
         dataIndex: 'customer_email',
         key: 'customer_email',
         ...getColumnSearchProps('customer_email'),
         align: 'center',
      },
      {
         title: 'Số điện thoại',
         dataIndex: 'customer_phone',
         key: 'customer_phone',
         render: (phone) => (
            <Input suffix={<CopyButton value={phone.toString()} />} value={phone.toString()} readOnly />
         ),
         align: 'center',
      },
      {
         title: 'Ngày sinh',
         dataIndex: 'customer_birthday',
         key: 'customer_birthday',
         align: 'center',
         render: (date: string) => formatDateTime(date),
      },
      {
         title: 'Giới tính',
         dataIndex: 'customer_gender',
         key: 'customer_gender',
         align: 'center',
         render: (gender: number) => {
            switch (gender) {
               case 1:
                  return 'Nam';
               case 0:
                  return 'Nữ';
               default:
                  return 'Khác';
            }
         },
      },
      {
         title: 'Số điểm thưởng',
         dataIndex: 'bonus_point',
         key: 'bonus_point',
         align: 'center',
         render: (points: number) => {
            const getRankInfo = (point: number) => {
               if (point >= 200) return { label: 'Kim Cương', color: '#B9F2FF', icon: 'mdi:diamond' };
               if (point >= 150) return { label: 'Bạch Kim', color: '#E5E4E2', icon: 'game-icons:platinum-crown' };
               if (point >= 100) return { label: 'Vàng', color: '#FFD700', icon: 'ph:crown-bold' };
               if (point >= 80) return { label: 'VIP', color: '#FF4069', icon: 'mdi:crown' };
               if (point >= 50) return { label: 'Tiềm Năng', color: '#87CEEB', icon: 'mdi:star-circle' };
               if (point >= 30) return { label: 'Đồng', color: '#CD7F32', icon: 'game-icons:bronze-medal' };
               return { label: 'Mới', color: '#90EE90', icon: 'mdi:sprout' };
            };
            const rankInfo = getRankInfo(points);
            return (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Tag
                     color={rankInfo.color}
                     style={{
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                     }}
                  >
                     <Iconify icon={rankInfo.icon} width={20} />
                     <span>{rankInfo.label}</span>
                     <span>({points} điểm)</span>
                  </Tag>
               </div>
            );
         },
      },
      {
         title: 'Trạng thái',
         dataIndex: 'is_disabled',
         key: 'is_disabled',
         align: 'center',
         render: (isDisabled: number) => (
            <Tag color={isDisabled === 1 ? 'error' : 'success'}>{isDisabled === 1 ? 'Khóa' : 'Hoạt động'}</Tag>
         ),
      },
      {
         title: 'Hành động',
         key: 'action',
         align: 'center',
         render: (_, record) => (
            <Space>
               {record.is_disabled === 0 ? (
                  <Tooltip title="Khóa tài khoản">
                     <IconButton
                        className="text-danger"
                        onClick={() => {
                           setSelectedCustomer(record);
                           setIsModalOpen(true);
                        }}
                     >
                        <Iconify icon="mdi:account-lock" size={20} />
                     </IconButton>
                  </Tooltip>
               ) : (
                  <Tooltip title="Mở khóa tài khoản">
                     <IconButton
                        className="text-success"
                        onClick={() => {
                           setSelectedCustomer(record);
                           setIsUnlockModalOpen(true);
                        }}
                     >
                        <Iconify icon="mdi:account-lock-open" size={20} />
                     </IconButton>
                  </Tooltip>
               )}
            </Space>
         ),
      },
   ];

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.customer_id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: customers?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Customer>}
         dataSource={error ? [] : customers || []}
         loading={loading}
      />
   );

   const handleLockAccount = async () => {
      try {
         setIsLocking(true);
         const response = await customerAPI.lockAccount({ customer_id: selectedCustomer?.customer_id });
         if (response.status === 201 || response.status === 200) {
            notification.success({
               message: 'Thành công',
               description: 'Đã khóa tài khoản khách hàng và gửi email thông báo',
            });
            setIsModalOpen(false);
            refreshCustomers();
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi',
            description: error.message || 'Không thể khóa tài khoản khách hàng',
         });
      } finally {
         setIsLocking(false);
      }
   };

   const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

   const handleUnlockAccount = async () => {
      try {
         setLoadingDelete(true);
         const response = await customerAPI.unlockAccount({ customer_id: selectedCustomer?.customer_id });
         if (response.status === 201 || response.status === 200) {
            notification.success({
               message: 'Thành công',
               description: 'Đã mở khóa tài khoản khách hàng',
               duration: 3,
               style: {
                  border: '1px solid #52c41a',
                  borderRadius: '5px',
                  backgroundColor: '#f6ffed',
               },
            });
            setIsUnlockModalOpen(false);
            refreshCustomers();
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi mở khóa tài khoản',
            description: (
               <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  <p>Không thể mở khóa tài khoản khách hàng!</p>
                  <p>ERROR: {error.message}</p>
               </div>
            ),
            duration: 5,
            style: {
               border: '1px solid #ff4d4f',
               borderRadius: '5px',
               backgroundColor: '#fff1f0',
            },
         });
      } finally {
         setLoadingDelete(false);
         setSelectedCustomer(null);
      }
   };

   return (
      <>
         <Card
            style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
            title="Danh sách khách hàng"
            extra={
               <Space>
                  <Select size="large" defaultValue={selectedYear} onChange={handleYearChange} style={{ width: 120 }}>
                     {years.map((year) => (
                        <Select.Option key={year} value={year}>
                           {year}
                        </Select.Option>
                     ))}
                  </Select>
                  <Button size="large" type="primary" onClick={showChartModal}>
                     Thống kê
                  </Button>
               </Space>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
               {loadingDelete && content}
            </Spin>
            {content}
         </Card>

         <Modal
            title="Xác nhận khóa tài khoản"
            open={isModalOpen}
            onCancel={() => {
               if (!isLocking) {
                  setIsModalOpen(false);
                  setSelectedCustomer(null);
               }
            }}
            footer={[
               <Button
                  key="cancel"
                  disabled={isLocking}
                  onClick={() => {
                     setIsModalOpen(false);
                     setSelectedCustomer(null);
                  }}
               >
                  Hủy
               </Button>,
               <Button key="lock" danger type="primary" loading={isLocking} onClick={handleLockAccount}>
                  Khóa tài khoản
               </Button>,
            ]}
            maskClosable={!isLocking}
            closable={!isLocking}
            centered
         >
            <Spin spinning={isLocking}>
               <div style={{ minHeight: '100px' }}>
                  <Typography.Paragraph>
                     Bạn có chắc chắn muốn khóa tài khoản của khách hàng{' '}
                     <Typography.Text strong>{selectedCustomer?.customer_full_name}</Typography.Text>?
                  </Typography.Paragraph>
                  <Typography.Paragraph type="secondary">
                     Hệ thống sẽ gửi email thông báo đến địa chỉ: {selectedCustomer?.customer_email}
                  </Typography.Paragraph>
               </div>
            </Spin>
         </Modal>
         <Modal
            title={`Thống kê khách hàng đăng ký năm ${selectedYear}`}
            open={isChartModalOpen}
            onCancel={() => setIsChartModalOpen(false)}
            footer={null}
            width={800}
         >
            <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
         </Modal>
         <Modal
            title="Xác nhận mở khóa tài khoản"
            open={isUnlockModalOpen}
            onCancel={() => {
               if (!loadingDelete) {
                  setIsUnlockModalOpen(false);
                  setSelectedCustomer(null);
               }
            }}
            footer={[
               <Button
                  key="cancel"
                  disabled={loadingDelete}
                  onClick={() => {
                     setIsUnlockModalOpen(false);
                     setSelectedCustomer(null);
                  }}
               >
                  Hủy
               </Button>,
               <Button key="unlock" type="primary" loading={loadingDelete} onClick={handleUnlockAccount}>
                  Mở khóa tài khoản
               </Button>,
            ]}
            maskClosable={!loadingDelete}
            closable={!loadingDelete}
            centered
         >
            <Spin spinning={loadingDelete}>
               <div style={{ minHeight: '100px' }}>
                  <Typography.Paragraph>
                     Bạn có chắc chắn muốn mở khóa tài khoản của khách hàng{' '}
                     <Typography.Text strong>{selectedCustomer?.customer_full_name}</Typography.Text>?
                  </Typography.Paragraph>
               </div>
            </Spin>
         </Modal>
      </>
   );
}
