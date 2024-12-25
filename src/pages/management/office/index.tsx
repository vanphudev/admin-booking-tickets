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
import { Office } from '@pages/management/office/entity';
import getOffices from '@api/officeAPI';
import ProTag from '@theme/antd/components/tag';
import { OfficeModal, OfficeModalProps } from './officeModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import GoogleMapIframe from '@components/GoogleMapIframe/GoogleMapIframe';
import dayjs from 'dayjs';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setOfficesSlice } from '@/redux/slices/officeSlice';

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

const DEFAULE_OFFICE_VALUE: Office = {
   id: -1,
   name: '',
   phone: '',
   fax: '',
   description: '',
   latitude: 0,
   longitude: 0,
   mapUrl: '',
   isLocked: 0,
   lastLockAt: '',
   createdAt: '',
   updatedAt: '',
   Address: {
      province: null,
      district: null,
      ward: null,
      street: '',
   },
   images: [],
};

function transformApiResponseToOffice(apiResponse: any): Office {
   return {
      id: apiResponse.office_id,
      name: apiResponse.office_name,
      phone: apiResponse.office_phone,
      fax: apiResponse.office_fax,
      description: apiResponse.office_description,
      latitude: apiResponse.office_latitude,
      longitude: apiResponse.office_longitude,
      mapUrl: apiResponse.office_map_url,
      isLocked: apiResponse.is_locked === 1 ? 1 : 0,
      lastLockAt: apiResponse.last_lock_at || '',
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      Address: {
         province: apiResponse?.office_belongto_ward?.ward_belongto_district?.district_belongto_province?.province_id,
         district: apiResponse?.office_belongto_ward?.ward_belongto_district?.district_id,
         ward: apiResponse?.office_belongto_ward?.ward_id,
         street: apiResponse?.office_address,
      },
      images: apiResponse?.office_to_officeImage.map((image: any) => image.office_image_url),
   };
}

type DataIndex = keyof Office;
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
   const dispatch = useDispatch();

   const officesSlice = useSelector((state: RootState) => state.office.offices);

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      getOffices
         .deleteOffice(id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Office Success by Id ${id} !`,
                  duration: 3,
               });
            }
            if (res && (res.status === 400 || res.error === true)) {
               notification.error({
                  message: `Delete Office Failed by Id ${id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Office Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Office> => ({
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
      getOffices
         .getOffices()
         .then((res: any) => {
            dispatch(setOfficesSlice(res.map(transformApiResponseToOffice)));
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
         const res = await getOffices.getOffices();
         dispatch(setOfficesSlice(res.map(transformApiResponseToOffice)));
      } catch (error) {
         setError(error);
      }
   };

   const [officeModalPros, setOfficeModalProps] = useState<OfficeModalProps>({
      formValue: {
         ...DEFAULE_OFFICE_VALUE,
      },
      title: 'New Create Office',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setOfficeModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setOfficeModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Office> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Name',
         dataIndex: 'name',
         ...getColumnSearchProps('name'),
         fixed: 'left',
         sorter: (a, b) => a.name.localeCompare(b.name),
         ellipsis: {
            showTitle: false,
         },
         render: (name) => (
            <Tooltip placement="topLeft" title={name}>
               {name}
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
                     <Avatar key={index} src={image} alt={`Office Image ${index + 1}`} />
                  ))}
               </Avatar.Group>
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
         fixed: 'left',
      },
      {
         title: 'Phone',
         dataIndex: 'phone',
         align: 'center',
         render: (phone) => (
            <Input suffix={<CopyButton value={phone.toString()} />} value={phone.toString()} readOnly />
         ),
      },
      {
         title: 'Lock Status',
         align: 'center',
         dataIndex: 'isLocked',
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
         onFilter: (value, record) => record.isLocked === value,
         render: (isLocked) => (
            <ProTag color={isLocked === 1 ? 'error' : 'success'}>{isLocked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
         ),
      },
      {
         title: 'Fax',
         align: 'center',
         dataIndex: 'fax',
         render: (fax) => <Input suffix={<CopyButton value={fax.toString()} />} value={fax.toString()} readOnly />,
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
                  onConfirm={() => handleDelete(record.id)}
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
      setOfficeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Office',
         isCreate: true,
         formValue: {
            ...DEFAULE_OFFICE_VALUE,
         },
      }));
   };

   const onEdit = (recore: Office) => {
      setOfficeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Office',
         isCreate: false,
         formValue: recore,
      }));
   };

   const expandColumns: ColumnsType<Office> = [
      {
         title: 'Location',
         key: 'location',
         fixed: 'left',
         width: 300,
         render: (_, record) => {
            const { latitude, longitude } = record;
            return <GoogleMapIframe latitude={latitude || 0} longitude={longitude || 0} />;
         },
      },
      {
         title: 'Lock Status',
         align: 'center',
         key: 'lockStatus',
         render: (_, record) => {
            const { isLocked, lastLockAt } = record;
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  {isLocked === 1 && lastLockAt && (
                     <>
                        <Iconify icon="fxemoji:lock" size={40} />
                        <Text mark>{dayjs(lastLockAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
                     </>
                  )}
                  {isLocked === 0 && (
                     <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
               </div>
            );
         },
      },
      {
         title: 'Timestamps',
         key: 'timestamps',
         align: 'center',
         render: (_, record) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8, fontWeight: 'bold' }}>Created Date:</span>
                  <Text mark>{dayjs(record.createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ marginRight: 8, fontWeight: 'bold' }}>Updated Date:</span>
                  <Text mark>{dayjs(record.updatedAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
            </div>
         ),
      },
      {
         title: 'Address',
         key: 'address',
         render: (_, record) => {
            return (
               record.Address?.street || (
                  <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
               )
            );
         },
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               images.map((image: string) => {
                  return <Avatar size="large" src={image} alt="Office Image" />;
               })
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
   ];

   const renderExpandedRow = (record: Office) => (
      <div>
         <Alert message="Description" description={record.description} type="info" />
         <Table<Office> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: officesSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Office>}
         expandable={{ expandedRowRender: renderExpandedRow, defaultExpandedRowKeys: ['0'] }}
         dataSource={error ? [] : officesSlice || []}
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
         <OfficeModal {...officeModalPros} />
      </Card>
   );
}
