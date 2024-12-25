import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Tooltip, Table, Input, Space, Spin, Tag, Typography, Modal, Divider } from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect, useCallback } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import { Refund, Employee, Ticket, Booking, Customer } from './entity';
import refundAPI from '@/redux/api/services/refundAPI';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import dayjs from 'dayjs';

import { setRefundsSlice } from '@/redux/slices/refundSlice';

const { Text } = Typography;

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

type DataIndex = keyof Refund;

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

function transformApiResponseToRefund(apiResponse: any): Refund {
   const ticket: Ticket = {
      ticket_id: apiResponse.ticket_id,
      booking_seat_id: apiResponse.booking_seat_id,
      ticket_name_chair: apiResponse.ticket_name_chair,
      ticket_amount: apiResponse.ticket_amount,
      ticket_code: apiResponse.ticket_code,
   };

   const employee: Employee = {
      employee_id: apiResponse.employee_id,
      employee_full_name: apiResponse.employee_full_name,
      employee_phone: apiResponse.employee_phone,
      employee_email: apiResponse.employee_email,
   };

   const customer: Customer = {
      customer_id: apiResponse.customer_id,
      customer_full_name: apiResponse.customer_name,
      customer_phone: apiResponse.customer_phone,
      customer_email: apiResponse.customer_email,
   };

   const booking: Booking = {
      booking_code: apiResponse.booking_code,
      booking_total_payment: apiResponse.booking_total_payment,
      booking_status: apiResponse.booking_status,
      payment_status: apiResponse.payment_status,
   };

   return {
      refund_id: apiResponse.refund_id,
      refund_code: apiResponse.refund_code,
      ticket_id: ticket,
      refund_amount: apiResponse.refund_amount,
      refund_description: apiResponse.refund_description,
      refund_percentage: apiResponse.refund_percentage,
      employee_id: employee,
      refunded_at: apiResponse.refunded_at,
      is_refunded: apiResponse.is_refunded,
      refund_method: apiResponse.refund_method,
      is_approved: apiResponse.is_approved,
      customer_id: customer,
      booking_id: booking,
   };
}

export default function CustomerPage() {
   const { styles } = useStyle();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [refunds, setRefunds] = useState<Refund[]>([]);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const dispatch = useDispatch();
   const refundsSlice = useSelector((state: RootState) => state.refund.refunds);

   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Refund> => ({
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

   const loadRefunds = useCallback(async () => {
      try {
         setLoading(true);
         const response = await refundAPI.getRefund();
         if (response) {
            dispatch(setRefundsSlice(response.map(transformApiResponseToRefund)));
            setRefunds(response.map(transformApiResponseToRefund));
         } else {
            notification.error({
               message: 'Lỗi tải danh sách hoàn tiền',
               description: (
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                     <p>Không thể tải danh sách hoàn tiền!</p>
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
            message: 'Lỗi tải danh sách hoàn tiền',
            description: (
               <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  <p>Không thể tải danh sách hoàn tiền!</p>
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
      loadRefunds();
   }, [loadRefunds]);

   const refreshRefunds = () => {
      loadRefunds();
   };

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
   const [isApproving, setIsApproving] = useState(false);
   const user = useSelector((state: RootState) => state.user.userInfo);

   const handleApproveRefund = (refund: Refund) => {
      setSelectedRefund(refund);
      setIsModalOpen(true);
   };

   const handleConfirmApprove = async () => {
      if (!selectedRefund) return;

      setIsApproving(true);
      try {
         const data = {
            refund_id: selectedRefund.refund_id,
            employee_id: user?.userId,
         };
         const response = await refundAPI.approveRefund(data);
         if (response) {
            notification.success({
               message: 'Thành công',
               description: 'Đã xác nhận hoàn tiền thành công',
            });
            refreshRefunds();
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi',
            description: 'Không thể xác nhận hoàn tiền: ' + error.message,
         });
      } finally {
         setIsApproving(false);
         setIsModalOpen(false);
         setSelectedRefund(null);
      }
   };

   const handleExportRefunds = () => {
      console.log('Xuất Excel hoàn tiền');
   };

   const handleExportPendingRefunds = () => {
      console.log('Xuất Excel chưa hoàn tiền');
   };

   const columns: ColumnsType<Refund> = [
      {
         title: 'Mã hoàn tiền',
         dataIndex: 'refund_code',
         key: 'refund_code',
         ...getColumnSearchProps('refund_code'),
         sorter: (a, b) => a.refund_code?.localeCompare(b.refund_code as string) || 0,
         fixed: 'left',
         width: 240,
         align: 'center',
         render: (code: string) => {
            if (!code) return '';
            const first6 = code.substring(0, 6);
            const last4 = code.substring(code.length - 4);
            return `${first6}****${last4}`;
         },
      },
      {
         title: 'Mã vé',
         dataIndex: 'ticket_id',
         key: 'ticket_id',
         align: 'center',
         render: (ticket: Ticket) =>
            ticket ? (
               <Input suffix={<CopyButton value={ticket.ticket_code} />} value={ticket.ticket_code} readOnly />
            ) : (
               <Iconify icon="mdi:account-off" style={{ color: '#ccc', fontSize: '40px' }} />
            ),
      },
      {
         title: 'Phương thức hoàn tiền',
         dataIndex: 'refund_method',
         key: 'refund_method',
         render: (method: string) => {
            if (method.toLowerCase() === 'online') {
               return (
                  <Tag icon={<Iconify icon="mdi:credit-card-wireless" />} color="processing">
                     {method}
                  </Tag>
               );
            }
            return <Input value={method} readOnly />;
         },
         align: 'center',
      },
      {
         title: 'Ngày hoàn tiền',
         dataIndex: 'refunded_at',
         key: 'refunded_at',
         align: 'center',
         render: (date: string) => {
            if (!date) return '';
            const weekdays = {
               Monday: 'Thứ hai',
               Tuesday: 'Thứ ba',
               Wednesday: 'Thứ tư',
               Thursday: 'Thứ năm',
               Friday: 'Thứ sáu',
               Saturday: 'Thứ bảy',
               Sunday: 'Chủ nhật',
            };
            const weekday = dayjs(date).format('dddd');
            return `${weekdays[weekday as keyof typeof weekdays]}, ${dayjs(date).format('DD/MM/YYYY')}`;
         },
      },
      {
         title: 'Trạng thái',
         dataIndex: 'is_refunded',
         key: 'is_refunded',
         align: 'center',
         render: (status: number) => {
            switch (status) {
               case 1:
                  return (
                     <Tag icon={<CheckCircleOutlined />} color="success">
                        Đã hoàn tiền
                     </Tag>
                  );
               case 0:
                  return (
                     <Tag icon={<ClockCircleOutlined />} color="warning">
                        Chưa hoàn tiền
                     </Tag>
                  );
               default:
                  return (
                     <Tag icon={<CloseCircleOutlined />} color="error">
                        Khác
                     </Tag>
                  );
            }
         },
      },
      // thông tin khách hàng
      {
         title: 'Tên khách hàng',
         dataIndex: 'customer_id',
         key: 'customer_full_name',
         align: 'center',
         render: (customer: Customer) => (
            <Space>
               <Text>{customer.customer_full_name}</Text>
            </Space>
         ),
      },
      {
         title: 'Số điện thoại',
         dataIndex: 'customer_id',
         key: 'customer_phone',
         align: 'center',
         render: (customer: Customer) => (
            <Input suffix={<CopyButton value={customer.customer_phone} />} value={customer.customer_phone} readOnly />
         ),
      },
      {
         title: 'Mã đặt vé',
         dataIndex: 'booking_id',
         key: 'booking_code',
         align: 'center',
         render: (booking: Booking) => (
            <Space>
               <Text strong>
                  {booking.booking_code.slice(0, 4)}
                  {'****'}
                  {booking.booking_code.slice(-4)}
               </Text>
            </Space>
         ),
      },
      {
         title: 'Tổng tiền đặt vé',
         dataIndex: 'booking_id',
         key: 'booking_total_payment',
         align: 'center',
         render: (booking: Booking) => (
            <Text>
               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  booking.booking_total_payment,
               )}
            </Text>
         ),
      },
      {
         title: 'Trạng thái thanh toán',
         dataIndex: 'booking_id',
         key: 'payment_status',
         align: 'center',
         render: (booking: Booking) => {
            switch (booking.payment_status) {
               case 'completed':
                  return (
                     <Tag color="success" icon={<CheckCircleOutlined />}>
                        Đã thanh toán
                     </Tag>
                  );
               case 'pending':
                  return (
                     <Tag color="warning" icon={<ClockCircleOutlined />}>
                        Chưa thanh toán
                     </Tag>
                  );
               default:
                  return (
                     <Tag color="error" icon={<CloseCircleOutlined />}>
                        Lỗi
                     </Tag>
                  );
            }
         },
      },
      {
         title: 'Nhân viên',
         dataIndex: 'employee_id',
         key: 'employee_full_name',
         align: 'center',
         render: (employee: Employee) =>
            employee.employee_full_name ? (
               <Input value={employee.employee_full_name} readOnly />
            ) : (
               <CloseCircleOutlined style={{ color: 'red', fontSize: '24px' }} />
            ),
      },
      {
         title: 'Số điện thoại nhân viên',
         dataIndex: 'employee_id',
         key: 'employee_phone',
         align: 'center',
         render: (employee: Employee) =>
            employee.employee_phone ? (
               <Input
                  suffix={<CopyButton value={employee.employee_phone} />}
                  value={employee.employee_phone}
                  readOnly
               />
            ) : (
               <CloseCircleOutlined style={{ color: 'red', fontSize: '24px' }} />
            ),
      },
      {
         title: 'Hành động',
         key: 'action',
         align: 'center',
         render: (_, record) =>
            record.is_approved === 1 && record.is_refunded === 1 ? null : (
               <Button
                  size="large"
                  type="primary"
                  onClick={() => handleApproveRefund(record)}
                  icon={<CheckCircleOutlined />}
               >
                  Duyệt hoàn tiền
               </Button>
            ),
      },
   ];

   const handleTodayRefunds = useCallback(async () => {
      setLoading(true);
      const response = await refundAPI.refundToday();
      if (response) {
         dispatch(setRefundsSlice(response.map(transformApiResponseToRefund)));
         setRefunds(response.map(transformApiResponseToRefund));
      }
      setLoading(false);
      notification.success({
         message: 'Thành công',
         description: 'Hoàn tiền hôm nay đã được thực hiện thành công với ' + response.length + ' khách hàng',
      });
   }, [dispatch]);

   const handlePendingRefunds = useCallback(async () => {
      setLoading(true);
      const response = await refundAPI.refundNoApproved();
      if (response) {
         dispatch(setRefundsSlice(response.map(transformApiResponseToRefund)));
         setRefunds(response.map(transformApiResponseToRefund));
      }
      setLoading(false);
      notification.success({
         message: 'Thành công',
         description: 'Hoàn tiền chưa được duyệt đã được thực hiện thành công với ' + response.length + ' khách hàng',
      });
   }, [dispatch]);

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.refund_id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ x: refunds?.length ? 2000 : undefined, y: 'calc(100vh - 310px)' }}
         pagination={{
            size: 'default',
            total: refunds?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Refund>}
         dataSource={error ? [] : refunds || []}
         loading={loading}
      />
   );

   return (
      <>
         <Card
            style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
            title="Danh sách hoàn tiền"
            extra={
               <Space>
                  <Button size="large" type="primary" onClick={handleTodayRefunds}>
                     Load hoàn tiền hôm nay
                  </Button>
                  <Button size="large" onClick={handlePendingRefunds}>
                     Load chưa hoàn tiền
                  </Button>
                  {/* <Button
                     size="large"
                     onClick={handleExportRefunds}
                     icon={<Iconify icon="mdi:microsoft-excel" style={{ color: '#217346' }} />}
                  >
                     Xuất Excel hoàn tiền
                  </Button>
                  <Button
                     size="large"
                     onClick={handleExportPendingRefunds}
                     icon={<Iconify icon="mdi:file-excel" style={{ color: '#217346' }} />}
                  >
                     Xuất Excel chưa hoàn tiền
                  </Button> */}
               </Space>
            }
         >
            <Spin spinning={loading} size="large" tip="Đang tải dữ liệu..." fullscreen>
               {content}
            </Spin>
            {content}
         </Card>

         <Modal
            title="Xác nhận hoàn tiền"
            open={isModalOpen}
            onCancel={() => {
               if (!isApproving) {
                  setIsModalOpen(false);
                  setSelectedRefund(null);
               }
            }}
            footer={[
               <Button
                  key="cancel"
                  disabled={isApproving}
                  onClick={() => {
                     setIsModalOpen(false);
                     setSelectedRefund(null);
                  }}
               >
                  Hủy
               </Button>,
               <Button key="approve" type="primary" loading={isApproving} onClick={handleConfirmApprove}>
                  Xác nhận hoàn tiền
               </Button>,
            ]}
            maskClosable={!isApproving}
            closable={!isApproving}
            centered
            width={700}
         >
            <Spin spinning={isApproving}>
               <div style={{ minHeight: '200px' }}>
                  <Typography.Title level={5}>Thông tin hoàn tiền</Typography.Title>
                  <Typography.Paragraph>
                     Mã hoàn tiền: <Typography.Text strong>{selectedRefund?.refund_code}</Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                     Số tiền hoàn:{' '}
                     <Typography.Text strong>
                        {selectedRefund?.refund_amount?.toLocaleString('vi-VN')} VNĐ
                     </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                     Phần trăm hoàn: <Typography.Text strong>{selectedRefund?.refund_percentage}%</Typography.Text>
                  </Typography.Paragraph>

                  <Divider />

                  <Typography.Title level={5}>Thông tin khách hàng</Typography.Title>
                  <Typography.Paragraph>
                     Họ tên: <Typography.Text strong>{selectedRefund?.customer_id?.customer_full_name}</Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                     Số điện thoại:{' '}
                     <Typography.Text strong>{selectedRefund?.customer_id?.customer_phone}</Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                     Email: <Typography.Text strong>{selectedRefund?.customer_id?.customer_email}</Typography.Text>
                  </Typography.Paragraph>

                  <Typography.Paragraph type="warning" style={{ marginTop: '20px' }}>
                     Bạn có chắc chắn muốn xác nhận hoàn tiền cho khách hàng này?
                  </Typography.Paragraph>
               </div>
            </Spin>
         </Modal>
      </>
   );
}
