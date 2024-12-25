import { SearchOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Tooltip,
   Table,
   Input,
   Space,
   Spin,
} from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import ProTag from '@theme/antd/components/tag';
import { PaymentMethodModal, PaymentMethodModalProps } from './paymentMethodModal';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { PaymentMethod } from './entity';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setPaymentMethodsSlice } from '@/redux/slices/paymentMethodSlice';
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

const DEFAULT_PAYMENTMETHOD_VALUE: PaymentMethod = {
   payment_method_id: 0,
   payment_method_code: '',
   payment_method_name: '',
   is_locked: 0,
   last_lock_at: '',
   payment_method_description: '',
};

function transformApiResponseToPaymentMethod(apiResponse: any): PaymentMethod {
   return {
      payment_method_id: apiResponse.payment_method_id,
      payment_method_code: apiResponse.payment_method_code,
      payment_method_name: apiResponse.payment_method_name,
      is_locked: apiResponse.is_locked,
      last_lock_at: apiResponse.last_lock_at || '',
      payment_method_description: apiResponse.payment_method_description,
   };
}

type DataIndex = keyof PaymentMethod;

export default function PaymentMethodPage() {
   const { styles } = useStyle();
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<any>(null);
   const dispatch = useDispatch();
   const paymentMethodsSlice = useSelector((state: RootState) => state.paymentMethod.paymentMethods);

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<PaymentMethod> => ({
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
      const fetchPaymentMethods = async () => {
         try {
            setLoading(true);
            await paymentMethodAPI.getPaymentMethods().then((res: any) => {
               if (res) {
                  dispatch(setPaymentMethodsSlice(res.map(transformApiResponseToPaymentMethod)));
               }
            });
         } catch (error) {
            setError(error);
         } finally {
            setLoading(false);
         }
      };
      fetchPaymentMethods();
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await paymentMethodAPI.getPaymentMethods();
         dispatch(setPaymentMethodsSlice(res.map(transformApiResponseToPaymentMethod)));
      } catch (error) {
         setError(error);
      }
   };

   const [paymentMethodModalProps, setPaymentMethodModalProps] = useState<PaymentMethodModalProps>({
      formValue: { ...DEFAULT_PAYMENTMETHOD_VALUE },
      title: 'New Create Payment Method',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setPaymentMethodModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setPaymentMethodModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const handleDelete = (id: number | undefined) => {
      if (id !== undefined) {
         setLoadingDelete(true);
         // getPaymentMethods
         //    .deletePaymentMethod(id.toString())
         //    .then((res: any) => {
         //       if (res && res.status === 200) {
         //          refreshData();
         //          notification.success({
         //             message: `Delete Payment Method Success by Id ${id} !`,
         //             duration: 3,
         //          });
         //       }
         //       if (res && (res.status === 400 || res.error === true)) {
         //          notification.error({
         //             message: `Delete Payment Method Failed by Id ${id} !`,
         //             duration: 3,
         //             description: res.message,
         //          });
         //       }
         //    })
         //    .catch((error) => {
         //       notification.error({
         //          message: `Delete Payment Method Failed by Id ${id} !`,
         //          duration: 3,
         //          description: error.message,
         //       });
         //    })
         //    .finally(() => {
         //       setLoadingDelete(false);
         //    });
      }
   };

   const columns: ColumnsType<PaymentMethod> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Name Payment Method',
         dataIndex: 'payment_method_name',
         ...getColumnSearchProps('payment_method_name'),
         fixed: 'left',
         sorter: (a, b) => a.payment_method_name.localeCompare(b.payment_method_name),
         ellipsis: {
            showTitle: false,
         },
         render: (payment_method_name) => (
            <Tooltip placement="topLeft" title={payment_method_name}>
               {payment_method_name}
            </Tooltip>
         ),
         onHeaderCell: () => ({
            style: { backgroundColor: '#FFF2F0' },
         }),
      },
      {
         title: 'Code Payment Method',
         dataIndex: 'payment_method_code',
         align: 'center',
         onHeaderCell: () => ({
            style: { backgroundColor: '#FFF2F0' },
         }),
      },
      {
         title: 'Description Payment Method',
         dataIndex: 'payment_method_description',
         align: 'center',
         onHeaderCell: () => ({
            style: { backgroundColor: '#FFF2F0' },
         }),
      },
      {
         title: 'Lock Status',
         dataIndex: 'is_locked',
         filters: [
            { text: 'Locked', value: 1 },
            { text: 'Unlocked', value: 0 },
         ],
         onFilter: (value, record) => record.is_locked === value,
         render: (is_locked) => (
            <ProTag color={is_locked === 1 ? 'error' : 'success'}>{is_locked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
         ),
         onHeaderCell: () => ({
            style: { backgroundColor: '#FFF2F0' },
         }),
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
                  title="Delete the Payment Method?"
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                  onConfirm={() => handleDelete(record.payment_method_id)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
         onHeaderCell: () => ({
            style: { backgroundColor: '#FFF2F0' },
         }),
      },
   ];

   const onCreate = () => {
      setPaymentMethodModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Payment Method',
         isCreate: true,
         formValue: { ...prev.formValue, ...DEFAULT_PAYMENTMETHOD_VALUE },
      }));
   };

   const onEdit = (formValue: PaymentMethod) => {
      setPaymentMethodModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Payment Method',
         isCreate: false,
         formValue,
      }));
   };

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.payment_method_id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: paymentMethodsSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
      }}
         columns={columns as ColumnsType<PaymentMethod>}
         dataSource={error ? [] : paymentMethodsSlice || []}
         loading={loading}
      />
   );

   return (
   <>    
     <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
            title="Payment Method List"
            extra={
               <Button size="large" type="primary" onClick={onCreate}>
                  New Payment Method
               </Button>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
               {loadingDelete && content}
            </Spin>
            {content}
         </Card>
         <PaymentMethodModal {...paymentMethodModalProps} />
   </>
   );
}
