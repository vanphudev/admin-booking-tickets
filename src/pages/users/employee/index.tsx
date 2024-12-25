import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Tooltip,
   Table,
   Input,
   Space,
   Typography,
   Empty,
   Spin,
   Modal,
   ConfigProvider,
} from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect, useCallback } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import { Employee } from './entity';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { EmployeeModal, EmployeeModalProps } from './employeeModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setEmployeeSlice } from '@/redux/slices/employeeSlice';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import dayjs from 'dayjs';

const DEFAULT_EMPLOYEE_VALUE: Employee = {
   employee_id: undefined,
   employee_full_name: '',
   employee_email: '',
   employee_phone: '',
   employee_username: '',
   employee_birthday: '',
   employee_password: '',
   employee_profile_image: '',
   employee_gender: '',
   is_first_activation: 0,
   is_locked: 0,
   last_lock_at: '',
   office: {
      office_id: undefined,
      office_name: '',
      office_address: '',
      office_phone: '',
   },
   employee_type: {
      employee_type_id: undefined,
      employee_type_name: '',
   },
};

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY');
};

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

type DataIndex = keyof Employee;

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

function transformApiResponseToEmployee(apiResponse: any): Employee {
   return {
      employee_id: apiResponse.employee_id,
      employee_full_name: apiResponse.employee_full_name,
      employee_email: apiResponse.employee_email,
      employee_phone: apiResponse.employee_phone,
      employee_username: apiResponse.employee_username,
      employee_birthday: apiResponse.employee_birthday,
      employee_password: apiResponse.employee_password,
      employee_gender: apiResponse.employee_gender,
      employee_profile_image: apiResponse.employee_profile_image,
      is_locked: apiResponse.is_locked === 1 ? 1 : 0,
      last_lock_at: apiResponse.last_lock_at || '',
      office: {
         office_id: apiResponse?.office?.office_id,
         office_name: apiResponse?.office?.office_name,
         office_address: apiResponse?.office?.office_address,
         office_phone: apiResponse?.office?.office_phone,
      },
      employee_type: {
         employee_type_id: apiResponse?.employee_type?.employee_type_id,
         employee_type_name: apiResponse?.employee_type?.employee_type_name,
      },
      driver: apiResponse?.driver
         ? {
              driver_id: apiResponse?.driver?.driver_id,
              driver_license_number: apiResponse?.driver?.driver_license_number,
              driver_experience_years: apiResponse?.driver?.driver_experience_years,
           }
         : undefined,
   };
}

// Thêm hàm format username
const maskUsername = (username: string): string => {
   if (!username) return '';
   if (username.length <= 4) return username;

   const start = username.slice(0, 2);
   const end = username.slice(-2);
   const masked = '*'.repeat(username.length - 4);

   return `${start}${masked}${end}`;
};

export default function EmployeePage() {
   const { styles } = useStyle();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const dispatch = useDispatch();
   const employeesSlice = useSelector((state: RootState) => state.employee.employees);
   const user = useSelector((state: RootState) => state.user.userInfo);
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');

   const [confirmModalProps, setConfirmModalProps] = useState(false);

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Employee> => ({
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

   const loadEmployees = useCallback(async () => {
      try {
         setLoading(true);
         const response = await employeeAPI.getEmployees();
         if (response) {
            dispatch(setEmployeeSlice(response.map(transformApiResponseToEmployee)));
            setEmployees(response.map(transformApiResponseToEmployee));
         } else {
            notification.error({
               message: 'Lỗi ti danh sách nhân viên',
               description: (
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                     <p>Không thể tải danh sách nhân viên!</p>
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
            message: 'Lỗi tải danh sách nhân viên',
            description: (
               <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  <p>Không thể tải danh sách nhân viên!</p>
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
      loadEmployees();
   }, [loadEmployees]);

   const refreshEmployees = () => {
      loadEmployees();
   };

   const handleDelete = async (employeeId: number) => {
      if (employeeId === Number(user?.userId)) {
         notification.error({
            message: 'Không thể xóa',
            description: 'Bạn không thể xóa tài khoản cá nhân của chính mình!',
            duration: 3,
         });
         return;
      }
      try {
         setLoadingDelete(true);
         const response = await employeeAPI.deleteEmployee(employeeId.toString());
         if (response.success) {
            notification.success({
               message: 'Xóa nhân viên thành công!',
               description: response.message,
               duration: 3,
            });
            refreshEmployees();
         } else {
            notification.error({
               message: 'Không thể xóa nhân viên',
               description: (
                  <div style={{ color: '#ff4d4f' }}>
                     <p>{response.message}</p>
                     <p>Vui lòng thử lại sau!</p>
                  </div>
               ),
               duration: 3,
            });
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi hệ thống',
            description: (
               <div style={{ color: '#ff4d4f' }}>
                  <p>Không thể xóa nhân viên!</p>
                  <p>Lỗi: {error.message}</p>
                  <p>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
               </div>
            ),
            duration: 3,
         });
      } finally {
         setLoadingDelete(false);
      }
   };

   const handleCreate = () => {
      setEmployeeModalProps({
         formValue: DEFAULT_EMPLOYEE_VALUE,
         title: 'Thêm nhân viên',
         show: true,
         isCreate: true,
         onOk: () => {
            refreshEmployees();
            setEmployeeModalProps((prev) => ({ ...prev, show: false }));
         },
         onCancel: handleModalCancel,
      });
   };

   const handleEdit = (record: Employee) => {
      if (record.employee_id !== user?.userId) {
         notification.error({
            message: 'Không thể chỉnh sửa',
            description: 'Bạn không thể chỉnh sửa thông tin của nhân viên khác!',
            duration: 3,
         });
         return;
      }
      setEmployeeModalProps({
         formValue: record,
         title: 'Cập nhật thông tin nhân viên',
         show: true,
         isCreate: false,
         onOk: () => {
            refreshEmployees();
            setEmployeeModalProps((prev) => ({ ...prev, show: false }));
         },
         onCancel: () => {
            setEmployeeModalProps((prev) => ({ ...prev, show: false }));
         },
      });
   };

   const [resetPasswordModal, setResetPasswordModal] = useState({
      open: false,
      employeeId: 0,
   });

   const handleResetPassword = (employeeId: number) => {
      setResetPasswordModal({
         open: true,
         employeeId,
      });
   };

   const handleCloseResetModal = () => {
      setResetPasswordModal({
         open: false,
         employeeId: 0,
      });
   };

   const [isResetting, setIsResetting] = useState(false);

   const handleConfirmReset = async () => {
      setIsResetting(true);
      try {
         const response = await employeeAPI.resetPassword(resetPasswordModal.employeeId);
         if (response) {
            notification.success({
               message: 'Đặt lại mật khẩu thành công!',
               description: 'Mật khẩu mới đã được gửi đến email của nhân viên.',
               duration: 3,
            });
            handleCloseResetModal();
         }
      } catch (error: any) {
         notification.error({
            message: 'Đặt lại mật khẩu thất bại!',
            description: error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.',
            duration: 3,
         });
      } finally {
         setIsResetting(false);
      }
   };

   const handleModalCancel = () => {
      setEmployeeModalProps((prev) => ({ ...prev, show: false }));
   };

   const [employeeModalProps, setEmployeeModalProps] = useState<EmployeeModalProps>({
      formValue: DEFAULT_EMPLOYEE_VALUE,
      title: 'Thêm nhân viên mới',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshEmployees();
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Employee> = [
      {
         title: 'Họ và tên',
         dataIndex: 'employee_full_name',
         key: 'employee_full_name',
         ...getColumnSearchProps('employee_full_name'),
         sorter: (a, b) => a.employee_full_name?.localeCompare(b.employee_full_name as string) || 0,
         fixed: 'left',
         width: 240,
         align: 'center',
      },
      {
         title: 'Ảnh đại diện',
         dataIndex: 'employee_profile_image',
         key: 'employee_profile_image',
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
         title: 'Loại nhân viên',
         dataIndex: 'employee_type',
         key: 'employee_type',
         align: 'center',
         render: (employeeType: any) => employeeType?.employee_type_name,
      },
      {
         title: 'Email',
         dataIndex: 'employee_email',
         key: 'employee_email',
         ...getColumnSearchProps('employee_email'),
         align: 'center',
      },
      {
         title: 'Số điện thoại',
         dataIndex: 'employee_phone',
         key: 'employee_phone',
         render: (phone) => (
            <Input suffix={<CopyButton value={phone.toString()} />} value={phone.toString()} readOnly />
         ),
         align: 'center',
      },
      {
         title: 'Tên đăng nhập',
         dataIndex: 'employee_username',
         key: 'employee_username',
         align: 'center',
         width: 180,
         render: (username: string) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <span
                  style={{
                     fontFamily: 'monospace',
                     letterSpacing: '1px',
                  }}
               >
                  {maskUsername(username)}
               </span>
            </div>
         ),
      },
      {
         title: 'Mật khẩu',
         dataIndex: 'employee_password',
         key: 'employee_password',
         align: 'center',
      },
      {
         title: 'Ngày sinh',
         dataIndex: 'employee_birthday',
         key: 'employee_birthday',
         align: 'center',
         render: (date: string) => formatDateTime(date),
      },
      {
         title: 'Giới tính',
         dataIndex: 'employee_gender',
         key: 'employee_gender',
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
         title: 'Tài xế',
         dataIndex: 'driver',
         key: 'driver',
         align: 'center',
         render: (driver: any) => {
            console.log(driver);
            if (!driver) {
               return <Iconify icon="mdi:account-off" style={{ color: '#ff4d4f', fontSize: '24px' }} />;
            }
            return <Iconify icon="mdi:car" style={{ color: '#4caf50', fontSize: '24px' }} />;
         },
      },
      {
         title: 'Thao tác',
         key: 'action',
         align: 'center',
         render: (_, record) => (
            <div className="flex w-full justify-center text-gray">
               <IconButton onClick={() => handleEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <IconButton onClick={() => handleResetPassword(record.employee_id as number)}>
                  <Iconify icon="mdi:lock-reset" size={18} className="text-warning" />
               </IconButton>
               <Popconfirm
                  title="Xóa nhân viên ?"
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                  onCancel={() => {}}
                  onConfirm={() => handleDelete(record.employee_id as number)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.employee_id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: employees?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Employee>}
         dataSource={error ? [] : employees || []}
         loading={loading}
      />
   );

   return (
      <>
         <Card
            style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
            title="Danh sách nhân viên"
            extra={
               <Space>
                  <Button size="large" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                     Thêm nhân viên
                  </Button>
               </Space>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
               {loadingDelete && content}
            </Spin>
            {content}
         </Card>
         <EmployeeModal {...employeeModalProps} />
         <Modal
            title={
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Iconify icon="mdi:lock-reset" style={{ fontSize: '24px', color: '#faad14' }} />
                  <span>Xác nhận đặt lại mật khẩu</span>
               </div>
            }
            open={resetPasswordModal.open}
            onCancel={handleCloseResetModal}
            centered
            width={500}
            confirmLoading={isResetting}
            footer={[
               <Button key="cancel" onClick={handleCloseResetModal} disabled={isResetting}>
                  Hủy
               </Button>,
               <Button
                  key="submit"
                  type="primary"
                  onClick={handleConfirmReset}
                  loading={isResetting}
                  style={{ background: '#faad14' }}
               >
                  {isResetting ? 'Đang đặt lại mật khẩu...' : 'Xác nhận'}
               </Button>,
            ]}
         >
            <div style={{ marginTop: '16px' }}>
               <div style={{ marginBottom: '16px', color: 'var(--ant-text-color-secondary)' }}>
                  Bạn có chắc chắn muốn đặt lại mật khẩu cho nhân viên này?
               </div>
               <div
                  style={{
                     padding: '12px',
                     background: '#fffbe6',
                     border: '1px solid #ffe58f',
                     borderRadius: '6px',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px',
                  }}
               >
                  <Iconify icon="mingcute:information-fill" style={{ fontSize: '20px', color: '#faad14' }} />
                  <span style={{ color: '#d48806' }}>Mật khẩu mới sẽ được gửi đến email của nhân viên</span>
               </div>
            </div>
         </Modal>
      </>
   );
}
